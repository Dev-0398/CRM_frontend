"use server"

import type { Lead, User } from "./types"
import ApiService from "@/lib/ApiService";

// Mock database for leads
let leads: Lead[] = []

// Mock database for users
let users: User[] = []

/**
 * Fetches all leads from the API and stores them in local memory.
 *
 * @returns {Promise<Lead[]>} A promise that resolves to the list of leads.
 */
export async function getLeads(): Promise<Lead[]> {
  try {
    const response = await ApiService.get("/leads/");
    console.log("API /leads response:", response); // Debug print
    if (response?.data && Array.isArray(response.data)) {
      leads = response.data.map((lead: any) => ({
        ...lead,
        descri: lead.descr || "",
      }));
    } else {
      console.warn("Failed to load leads:", response?.message || "Unknown error");
    }
    return leads;
  } catch (error) {
    console.error("Error in getLeads:", error);
    return leads;
  }
}

/**
 * Fetches a lead by its ID from the API.
 *
 * @param {string} id - The ID of the lead to retrieve.
 * @returns {Promise<Lead | null>} A promise that resolves to the lead or null if not found.
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  try {
    const response = await ApiService.get(`/leads/${id}`);
    if (response?.data) {
      return {
        ...response.data,
        descri: response.data.descr || "",
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching lead:", error);
    return null;
  }
}

/**
 * Creates a new lead and adds it to the local cache.
 *
 * @param {Omit<Lead, "id">} leadData - The data for the new lead, excluding the ID.
 * @returns {Promise<Lead>} A promise that resolves to the newly created lead.
 */
export async function createLead(leadData: Omit<Lead, "id">): Promise<Lead> {
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
  console.log("Creating lead with payload:", payload); // Debug print
  const newLeadDB = await ApiService.post("/leads/new", payload);
  if (newLeadDB?.id) {
    leads = [...leads, newLeadDB];
  }
  return newLeadDB;
}

/**
 * Updates a lead by its ID and updates the local cache.
 *
 * @param {string} id - The ID of the lead to update.
 * @param {Partial<Omit<Lead, "id">>} leadData - The fields to update.
 * @returns {Promise<Lead | null>} A promise that resolves to the updated lead, or null if not found.
 */
export async function updateLead(id: number, data: Partial<Lead>): Promise<{ msg: string }> {
  try {
    const response = await ApiService.patch(`/leads/${id}`, data);
    return { msg: response.msg || "Lead updated successfully" };
  } catch (error: any) {
    console.error("Error updating lead:", error);
    throw new Error(error.message || "Failed to update lead");
  }
}

/**
 * Deletes a lead by its ID and updates the local cache.
 *
 * @param {string} id - The ID of the lead to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false otherwise.
 */
export async function deleteLeadById(id: string): Promise<boolean> {
  await ApiService.delete(`/leads/${id}`);
  // Remove the lead from the local cache, converting id to string for comparison
  const leadIndex = leads.findIndex((lead) => String(lead.id) === String(id));
  if (leadIndex === -1) return false;
  leads = [...leads.slice(0, leadIndex), ...leads.slice(leadIndex + 1)];
  return true;
}

// User actions
export async function getUsers(): Promise<User[]> {
  try {
    const response = await ApiService.get("/users/");
    console.log("API /users response:", response); // Debug print
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error("Error in getUsers:", error);
    return [];
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const response = await ApiService.get(`/users/${id}`);
    return response?.data || null;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}

export async function createUser(userData: Omit<User, "id" | "created_at">): Promise<User> {
  try {
    const response = await ApiService.post("/users/new", userData);
    return response;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
}

export async function updateUser(id: number, userData: Partial<Omit<User, "id" | "created_at">>): Promise<User | null> {
  try {
    const response = await ApiService.patch(`/users/${id}`, userData);
    return response;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}

export async function deleteUserById(id: number): Promise<boolean> {
  try {
    const response = await ApiService.delete(`/users/${id}`);
    return response;
  } catch (error) {
    console.error("Error in deleteUserById:", error);
    throw error;
  }
}