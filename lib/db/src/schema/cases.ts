import { pgTable, text, serial, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  paymentMethod: text("payment_method").notNull(),
  problemType: text("problem_type").notNull(),
  merchantName: text("merchant_name").notNull(),
  amount: real("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  merchantCountry: text("merchant_country"),
  merchantContacted: boolean("merchant_contacted").notNull().default(false),
  merchantResponse: text("merchant_response"),
  evidence: jsonb("evidence").$type<string[]>().notNull().default([]),
  description: text("description").notNull(),
  analysis: jsonb("analysis").$type<CaseAnalysis>().notNull(),
  paid: boolean("paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  paidAmountCents: integer("paid_amount_cents").notNull().default(0),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CaseAnalysis = {
  strength: "stark" | "mittel" | "schwach";
  strengthLabel: string;
  successProbability: number;
  successProbabilityLabel: string;
  summary: string;
  reasoning: string;
  missingEvidence: string[];
  nextSteps: string[];
  recommendedCategory: string;
  legalBasis: string[];
  counterarguments: string[];
  urgencyLevel: "hoch" | "mittel" | "niedrig";
  deadline: string;
  merchantTemplate: string;
  bankTemplate: string;
  escalationTemplate: string;
  disclaimer: string;
};

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true, createdAt: true });
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;
