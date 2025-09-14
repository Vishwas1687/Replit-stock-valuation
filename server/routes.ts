import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertUserPreferencesSchema } from "@shared/schema";
import { fetchStockData, convertToInsertCompany } from "./services/yahooFinance";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all companies
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Get company by ID
  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Add company by stock symbol (fetches from Yahoo Finance)
  app.post("/api/companies/add-symbol", async (req, res) => {
    try {
      const { symbol } = z.object({ symbol: z.string().min(1).max(10) }).parse(req.body);
      
      // Check if company already exists
      const existing = await storage.getCompanyBySymbol(symbol);
      if (existing) {
        return res.status(400).json({ message: `Company with symbol ${symbol} already exists` });
      }

      // Fetch data from Yahoo Finance
      const stockData = await fetchStockData(symbol);
      const companyData = convertToInsertCompany(stockData);
      
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error adding company:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to add company" });
      }
    }
  });

  // Create company with manual data
  app.post("/api/companies", async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  // Update company
  app.put("/api/companies/:id", async (req, res) => {
    try {
      const updateData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, updateData);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  // Delete company
  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCompany(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json({ message: "Company deleted successfully" });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Refresh company data from Yahoo Finance
  app.post("/api/companies/:id/refresh", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const stockData = await fetchStockData(company.symbol);
      const updatedData = convertToInsertCompany(stockData);
      
      const updatedCompany = await storage.updateCompany(req.params.id, updatedData);
      res.json(updatedCompany);
    } catch (error) {
      console.error("Error refreshing company data:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to refresh company data" });
      }
    }
  });

  // Refresh all companies
  app.post("/api/companies/refresh-all", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      const refreshPromises = companies.map(async (company) => {
        try {
          const stockData = await fetchStockData(company.symbol);
          const updatedData = convertToInsertCompany(stockData);
          return await storage.updateCompany(company.id, updatedData);
        } catch (error) {
          console.error(`Failed to refresh ${company.symbol}:`, error);
          return company; // Return original if refresh fails
        }
      });

      const refreshedCompanies = await Promise.all(refreshPromises);
      res.json(refreshedCompanies);
    } catch (error) {
      console.error("Error refreshing all companies:", error);
      res.status(500).json({ message: "Failed to refresh companies" });
    }
  });

  // Get user preferences (simplified for demo - no authentication)
  app.get("/api/preferences", async (req, res) => {
    try {
      // For demo purposes, use a fixed user ID
      const userId = "demo-user";
      let preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        preferences = await storage.updateUserPreferences(userId, { showLowHigh: false });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Update user preferences
  app.put("/api/preferences", async (req, res) => {
    try {
      const userId = "demo-user"; // Fixed for demo
      const preferencesData = insertUserPreferencesSchema.omit({ userId: true }).parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ message: "Invalid preferences data" });
    }
  });

  // Validate stock symbol endpoint
  app.post("/api/validate-symbol", async (req, res) => {
    try {
      const { symbol } = z.object({ symbol: z.string().min(1).max(10) }).parse(req.body);
      
      try {
        const stockData = await fetchStockData(symbol);
        res.json({ 
          valid: true, 
          companyName: stockData.companyName,
          symbol: stockData.symbol,
          price: stockData.price 
        });
      } catch (error) {
        res.json({ valid: false, message: "Invalid symbol or data unavailable" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
