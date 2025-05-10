import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const probeTypes = {
  PING: "ping",
  TRACEROUTE: "traceroute",
  DNS: "dns",
  WHOIS: "whois",
} as const;

export const probeStatus = {
  SUCCESS: "success",
  FAILURE: "failure",
  PENDING: "pending",
} as const;

export const probeResults = pgTable("probe_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  probeType: text("probe_type").notNull(),
  target: text("target").notNull(),
  status: text("status").notNull(),
  result: text("result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export const insertProbeResultSchema = createInsertSchema(probeResults).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type ProbeResult = typeof probeResults.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type InsertProbeResult = z.infer<typeof insertProbeResultSchema>;
export type ProbeType = typeof probeTypes[keyof typeof probeTypes];
export type ProbeStatus = typeof probeStatus[keyof typeof probeStatus];

export const pingProbeSchema = z.object({
  host: z.string().min(1, "Host is required"),
});

export const tracerouteProbeSchema = z.object({
  host: z.string().min(1, "Host is required"),
});

export const dnsProbeSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  recordType: z.string().min(1, "Record type is required"),
});

export const whoisProbeSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

export type PingProbeParams = z.infer<typeof pingProbeSchema>;
export type TracerouteProbeParams = z.infer<typeof tracerouteProbeSchema>;
export type DnsProbeParams = z.infer<typeof dnsProbeSchema>;
export type WhoisProbeParams = z.infer<typeof whoisProbeSchema>;

// RBAC Types
// Based on the ProbeOps RBAC implementation from backend team

// Available user roles
export const UserRoles = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// Available subscription tiers
export const SubscriptionTiers = {
  FREE: 'free',
  STANDARD: 'standard',
  ENTERPRISE: 'enterprise',
} as const;

// Schema for user role
export const roleSchema = z.enum([UserRoles.USER, UserRoles.ADMIN]);

// Schema for subscription tier
export const subscriptionTierSchema = z.enum([
  SubscriptionTiers.FREE, 
  SubscriptionTiers.STANDARD, 
  SubscriptionTiers.ENTERPRISE
]);

// Rate limit information schema
export const rateLimitSchema = z.object({
  tier: subscriptionTierSchema,
  daily: z.object({
    limit: z.number(),
    used: z.number(),
    remaining: z.number(),
  }),
  monthly: z.object({
    limit: z.number(),
    used: z.number(),
    remaining: z.number(),
  }),
  probe_interval: z.number(), // interval in minutes
});

// Extend the user schema to include role and subscription information
export const userWithRoleSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  is_active: z.boolean(),
  is_admin: z.boolean(),
  role: roleSchema,
  subscription_tier: subscriptionTierSchema,
  api_key_count: z.number(),
});

// Types for TypeScript
export type UserRole = z.infer<typeof roleSchema>;
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>;
export type RateLimit = z.infer<typeof rateLimitSchema>;
export type UserWithRole = z.infer<typeof userWithRoleSchema>;
