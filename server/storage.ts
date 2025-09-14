import { type User, type InsertUser, type Company, type InsertCompany, type UserPreferences, type InsertUserPreferences } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company operations
  getCompanies(userId?: string): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;
  getCompanyBySymbol(symbol: string, userId?: string): Promise<Company | undefined>;
  
  // User preferences operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<string, Company>;
  private userPreferences: Map<string, UserPreferences>;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.userPreferences = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCompanies(userId?: string): Promise<Company[]> {
    const companies = Array.from(this.companies.values());
    if (userId) {
      return companies.filter(company => company.userId === userId);
    }
    return companies.filter(company => !company.userId); // Return companies without userId for demo
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = {
      ...insertCompany,
      id,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure all optional fields are properly handled
      cyEpsLow: insertCompany.cyEpsLow ?? null,
      cyEpsHigh: insertCompany.cyEpsHigh ?? null,
      cyEpsChangePercentLow: insertCompany.cyEpsChangePercentLow ?? null,
      cyEpsChangePercentHigh: insertCompany.cyEpsChangePercentHigh ?? null,
      cyPeLow: insertCompany.cyPeLow ?? null,
      cyPeHigh: insertCompany.cyPeHigh ?? null,
      cyPegLow: insertCompany.cyPegLow ?? null,
      cyPegHigh: insertCompany.cyPegHigh ?? null,
      nyEpsLow: insertCompany.nyEpsLow ?? null,
      nyEpsHigh: insertCompany.nyEpsHigh ?? null,
      nyEpsChangePercentLow: insertCompany.nyEpsChangePercentLow ?? null,
      nyEpsChangePercentHigh: insertCompany.nyEpsChangePercentHigh ?? null,
      nyPeLow: insertCompany.nyPeLow ?? null,
      nyPeHigh: insertCompany.nyPeHigh ?? null,
      nyPegLow: insertCompany.nyPegLow ?? null,
      nyPegHigh: insertCompany.nyPegHigh ?? null,
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: string, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany: Company = {
      ...company,
      ...updateData,
      updatedAt: new Date(),
    };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<boolean> {
    return this.companies.delete(id);
  }

  async getCompanyBySymbol(symbol: string, userId?: string): Promise<Company | undefined> {
    const companies = Array.from(this.companies.values());
    return companies.find(company => 
      company.symbol.toLowerCase() === symbol.toLowerCase() &&
      (userId ? company.userId === userId : !company.userId)
    );
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(pref => pref.userId === userId);
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const updated: UserPreferences = {
        ...existing,
        ...preferences,
        updatedAt: new Date(),
      };
      this.userPreferences.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newPreferences: UserPreferences = {
        id,
        userId,
        showLowHigh: preferences.showLowHigh ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.userPreferences.set(id, newPreferences);
      return newPreferences;
    }
  }
}

export const storage = new MemStorage();
