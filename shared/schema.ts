import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  companyName: text("company_name").notNull(),
  price: real("price").notNull(),
  pe: real("pe").notNull(),
  pyEps: real("py_eps").notNull(),
  
  // Current Year Fields
  cyEpsLow: real("cy_eps_low"),
  cyEpsAvg: real("cy_eps_avg").notNull(),
  cyEpsHigh: real("cy_eps_high"),
  cyEpsChangePercentLow: real("cy_eps_change_percent_low"),
  cyEpsChangePercentAvg: real("cy_eps_change_percent_avg").notNull(),
  cyEpsChangePercentHigh: real("cy_eps_change_percent_high"),
  cyPeLow: real("cy_pe_low"),
  cyPeAvg: real("cy_pe_avg").notNull(),
  cyPeHigh: real("cy_pe_high"),
  cyPegLow: real("cy_peg_low"),
  cyPegAvg: real("cy_peg_avg").notNull(),
  cyPegHigh: real("cy_peg_high"),
  
  // Next Year Fields
  nyEpsLow: real("ny_eps_low"),
  nyEpsAvg: real("ny_eps_avg").notNull(),
  nyEpsHigh: real("ny_eps_high"),
  nyEpsChangePercentLow: real("ny_eps_change_percent_low"),
  nyEpsChangePercentAvg: real("ny_eps_change_percent_avg").notNull(),
  nyEpsChangePercentHigh: real("ny_eps_change_percent_high"),
  nyPeLow: real("ny_pe_low"),
  nyPeAvg: real("ny_pe_avg").notNull(),
  nyPeHigh: real("ny_pe_high"),
  nyPegLow: real("ny_peg_low"),
  nyPegAvg: real("ny_peg_avg").notNull(),
  nyPegHigh: real("ny_peg_high"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  showLowHigh: boolean("show_low_high").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
