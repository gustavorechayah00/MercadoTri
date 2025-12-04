
export enum Category {
  CYCLING = 'Cycling',
  RUNNING = 'Running',
  SWIMMING = 'Swimming',
  TRIATHLON = 'Triathlon',
  OTHER = 'Other'
}

export enum Condition {
  NEW = 'New',
  USED_LIKE_NEW = 'Used - Like New',
  USED_GOOD = 'Used - Good',
  USED_FAIR = 'Used - Fair'
}

export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: Category;
  brand: string;
  condition: Condition;
  price: number;
  currency: string;
  imageUrls: string[]; 
  status: 'draft' | 'published' | 'sold';
  createdAt: number;
  tags: string[];
}

export interface AIAnalysisResult {
  title: string;
  category: Category;
  brand: string;
  condition: Condition;
  description: string;
  suggestedPrice: number;
  minPrice?: number;     // New: Market Low
  maxPrice?: number;     // New: Market High
  priceExplanation?: string; // New: Reason for price
  sourceLinks?: { title: string, uri: string }[]; // New: Grounding sources
  tags: string[];
  confidenceScore: number;
  isSafe: boolean;
  safetyReason?: string;
  currency?: string;
}

export type UserRole = 'admin' | 'seller' | 'buyer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  whatsapp?: string;
  phone?: string;
  avatarUrl?: string;
  shopName?: string;
  shopImageUrl?: string; 
  shopDescription?: string; // New field for Shop Bio
}

export interface ShopSummary {
  id: string; // This is the User ID of the seller
  name: string;
  shopImageUrl?: string; 
  productCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export type AIProvider = 'gemini' | 'openai';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  defaultLanguage: 'es' | 'en';
  
  // AI Config
  aiProvider: AIProvider;
  geminiApiKey?: string;
  geminiModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
}
