import { 
  users, type User, type InsertUser, 
  apiKeys, type ApiKey, type InsertApiKey,
  probeResults, type ProbeResult, type InsertProbeResult
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { randomBytes } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // API Key operations
  getApiKeysByUserId(userId: number): Promise<ApiKey[]>;
  getApiKeyById(id: number): Promise<ApiKey | undefined>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: Omit<InsertApiKey, "key">): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Probe operations
  getProbeResults(userId: number, limit?: number): Promise<ProbeResult[]>;
  getProbeResultById(id: number): Promise<ProbeResult | undefined>;
  createProbeResult(probeResult: InsertProbeResult): Promise<ProbeResult>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeys: Map<number, ApiKey>;
  private probeResults: Map<number, ProbeResult>;
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentApiKeyId: number;
  currentProbeResultId: number;

  constructor() {
    this.users = new Map();
    this.apiKeys = new Map();
    this.probeResults = new Map();
    this.currentUserId = 1;
    this.currentApiKeyId = 1;
    this.currentProbeResultId = 1;
    
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // API Key operations
  async getApiKeysByUserId(userId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(
      (apiKey) => apiKey.userId === userId
    );
  }
  
  async getApiKeyById(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }
  
  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(
      (apiKey) => apiKey.key === key
    );
  }
  
  async createApiKey(apiKeyData: Omit<InsertApiKey, "key">): Promise<ApiKey> {
    const id = this.currentApiKeyId++;
    const key = `probeops_${randomBytes(16).toString('hex')}`;
    const createdAt = new Date();
    
    const apiKey: ApiKey = {
      ...apiKeyData,
      id,
      key,
      createdAt,
    };
    
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    return this.apiKeys.delete(id);
  }
  
  // Probe operations
  async getProbeResults(userId: number, limit?: number): Promise<ProbeResult[]> {
    const results = Array.from(this.probeResults.values())
      .filter((result) => result.userId === userId)
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
    if (limit) {
      return results.slice(0, limit);
    }
    
    return results;
  }
  
  async getProbeResultById(id: number): Promise<ProbeResult | undefined> {
    return this.probeResults.get(id);
  }
  
  async createProbeResult(probeResult: InsertProbeResult): Promise<ProbeResult> {
    const id = this.currentProbeResultId++;
    const createdAt = new Date();
    
    const result: ProbeResult = {
      ...probeResult,
      id,
      createdAt,
    };
    
    this.probeResults.set(id, result);
    return result;
  }
}

export const storage = new MemStorage();
