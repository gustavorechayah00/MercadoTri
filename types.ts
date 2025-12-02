
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
  status: 'draft' | 'published';
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