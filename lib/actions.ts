"use server"

import type { Lead, User } from "./types";
import ApiService from "@/lib/ApiService";

// Local in-memory cache
let leads: Lead[] = [];
let users: User[] = [];

// Helper function to validate auth params
function validateAuth(token?: string, tokenType?: string) {
  if (!token || !tokenType) {
    throw new Error('Authentication required. Please login again.');
  }
}

// Get all leads
export async function getLeads(token?: string, tokenType?: string): Promise<Lead[]> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.get("/leads/");
    if (response?.data && Array.isArray(response.data)) {
      leads = response.data.map((lead: any) => ({
        ...lead,
        descri: lead.descr || "",
      }));
    }
    return leads;
  } catch (error) {
    console.error("Error in getLeads:", error);
    throw error; // Re-throw to handle in component
  }
}

// Get a lead by ID
export async function getLeadById(id: string, token?: string, tokenType?: string): Promise<Lead | null> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.get(`/leads/${id}`);
    if (response?.data) {
      return {
        ...response.data,
        descri: response.data.descr || "",
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }
}

// Create a new lead
export async function createLead(
  leadData: Omit<Lead, "id">,
  token?: string,
  tokenType?: string
): Promise<Lead> {
  validateAuth(token, tokenType);
  const apiService = new ApiService(token!, tokenType!);
  const payload: Omit<Lead, "id"> = {
    ...leadData,
    lead_owner: leadData.lead_owner || "Unassigned",
    lead_status: leadData.lead_status || "New",
    lead_source: leadData.lead_source || "",
    street: leadData.street || "",
    city: leadData.city || "",
    state: leadData.state || "",
    zipcode: leadData.zipcode || "",
    country: leadData.country || "",
    descri: leadData.descri || "",
  };
  console.log("Creating lead with payload:", payload);
  const newLeadDB = await apiService.post("/leads/new", payload);
  if (newLeadDB?.id) {
    leads.push(newLeadDB);
  }
  return newLeadDB;
}

// Update a lead
export async function updateLead(
  id: number,
  data: Partial<Lead>,
  token?: string,
  tokenType?: string
): Promise<{ msg: string }> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.patch(`/leads/${id}`, data);
    return { msg: response.msg || "Lead updated successfully" };
  } catch (error: any) {
    console.error("Error updating lead:", error);
    throw new Error(error.message || "Failed to update lead");
  }
}

// Delete a lead
export async function deleteLeadById(
  id: string,
  token?: string,
  tokenType?: string
): Promise<boolean> {
  validateAuth(token, tokenType);
  const apiService = new ApiService(token!, tokenType!);
  await apiService.delete(`/leads/${id}`);
  const leadIndex = leads.findIndex((lead) => String(lead.id) === String(id));
  if (leadIndex === -1) return false;
  leads.splice(leadIndex, 1);
  return true;
}

// Get all users
export async function getUsers(token?: string, tokenType?: string): Promise<User[]> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.get("/users/");
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(
  id: number,
  token?: string,
  tokenType?: string
): Promise<User | null> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.get(`/users/${id}`);
    return response?.data || null;
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
}

// Create user
export async function createUser(
  userData: Omit<User, "id" | "created_at">,
  token?: string,
  tokenType?: string
): Promise<User> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.post("/users/new", userData);
    return response;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}

// Update user
export async function updateUser(
  id: number,
  userData: Partial<Omit<User, "id" | "created_at">>,
  token?: string,
  tokenType?: string
): Promise<User | null> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.patch(`/users/${id}`, userData);
    return response;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}

// Delete user
export async function deleteUserById(
  id: number,
  token?: string,
  tokenType?: string
): Promise<boolean> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    await apiService.delete(`/users/${id}`);
    return true;
  } catch (error) {
    console.error("Error in deleteUserById:", error);
    throw error;
  }
}