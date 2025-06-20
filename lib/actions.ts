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
    console.log("token",token,tokenType);
    // validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.get("/leads/my-leads/");
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    console.error("Error in getLeads:", error);
    
    // Provide more specific error messages
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    } else if (error.message?.includes('403')) {
      throw new Error('Access denied. You do not have permission to view leads.');
    } else if (error.message?.includes('Network')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw new Error(error.message || 'Failed to fetch leads');
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
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    } else if (error.message?.includes('404')) {
      throw new Error('Lead not found.');
    }
    
    throw new Error(error.message || 'Failed to fetch lead');
  }
}

// Create a new lead
export async function createLead(
  leadData: Omit<Lead, "id">,
  token?: string,
  tokenType?: string
): Promise<Lead> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const payload = {
      lead_owner_id: leadData.lead_owner_id,
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      title: leadData.title,
      email: leadData.email,
      mobile: leadData.mobile,
      lead_source: leadData.lead_source,
      lead_status: leadData.lead_status,
      street: leadData.street,
      city: leadData.city,
      state: leadData.state,
      zipcode: leadData.zipcode,
      country: leadData.country,
      descr: leadData.descri,
    };
    console.log('Creating lead with payload:', payload);
    const newLeadDB = await apiService.post("/leads/new", payload);
    if (newLeadDB?.id) {
      leads.push(newLeadDB);
    }
    return newLeadDB;
  } catch (error: any) {
    console.error("Error creating lead:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || 'Failed to create lead');
  }
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
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || "Failed to update lead");
  }
}

// Delete a lead
export async function deleteLeadById(
  id: string,
  token?: string,
  tokenType?: string
): Promise<boolean> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    await apiService.delete(`/leads/${id}`);
    const leadIndex = leads.findIndex((lead) => String(lead.id) === String(id));
    if (leadIndex === -1) return false;
    leads.splice(leadIndex, 1);
    return true;
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || 'Failed to delete lead');
  }
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
  } catch (error: any) {
    console.error("Error in getUsers:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || 'Failed to fetch users');
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
  } catch (error: any) {
    console.error("Error in getUserById:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || 'Failed to fetch user');
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
  } catch (error: any) {
    console.error("Error in createUser:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || 'Failed to create user');
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


// Get role tree
export async function getRoleTree(token?: string, tokenType?: string): Promise<any> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    const response = await apiService.get("/user-roles/tree");
    
    if (response?.status === "success" && response?.data) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    console.error("Error in getRoleTree:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || 'Failed to fetch role tree');
  }
}

// Get users tree (if you have a similar endpoint for users)
export async function getUsersTree(token?: string, tokenType?: string): Promise<any> {
  try {
    validateAuth(token, tokenType);
    const apiService = new ApiService(token!, tokenType!);
    // Assuming you might have a users tree endpoint
    const response = await apiService.get("/users/tree");
    
    if (response?.status === "success" && response?.data) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    console.error("Error in getUsersTree:", error);
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.message || 'Failed to fetch users tree');
  }
}