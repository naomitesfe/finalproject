import axios from "axios";

export const API_URL = (import.meta as any).env?.VITE_API_URL;

if (!API_URL) {
  throw new Error("Missing VITE_API_URL in .env");
}

// Axios instance with default config
export const api = axios.create({
  baseURL: "https://api.puter.com",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------
// USER ROLES
// ----------------------------
export type UserRole =
  | "entrepreneur"
  | "investor"
  | "realtor"
  | "supplier"
  | "admin";

// ----------------------------
// PROFILE INTERFACE
// ----------------------------
export interface Profile {
  _id: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  rating: number;
  total_reviews: number;
  visibility: "public" | "private";
  company_name?: string;
  specialization?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------
// BUSINESS IDEAS
// ----------------------------
export interface BusinessIdea {
  _id: string;
  entrepreneurId: string;
  title: string;
  description: string;
  category?: string;
  estimated_capital: number;
  estimated_roi: number;
  location?: string;
  status: "draft" | "active" | "funded" | "completed";
  ai_generated: boolean;
  createdAt: string;
}

// ----------------------------
// INVESTMENTS
// ----------------------------
export interface Investment {
  _id: string;
  investorId: string;
  entrepreneurId: string;
  businessIdeaId?: string;
  amount: number;
  investment_type: "equity" | "loan" | "grant";
  interest_rate?: number;
  status: "pending" | "active" | "completed" | "defaulted";
  roi_percentage?: number;
  createdAt: string;
}

// ----------------------------
// PROPERTIES (Realtor)
// ----------------------------
export interface Property {
  _id: string;
  realtorId: string;
  title: string;
  description: string;
  property_type: string;
  price: number;
  listing_type: "sale" | "lease";
  address: string;
  city: string;
  country: string;
  images: string[];
  amenities: string[];
  status: "available" | "pending" | "sold" | "leased";
  createdAt: string;
  updatedAt: string;
}
