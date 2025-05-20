"use server"

import type { Lead, User } from "./types"
import ApiService from "@/lib/ApiService";

// Mock database for leads
let leads: Lead[] = [
  {
    id: "1",
    lead_owner: "John Smith",
    first_name: "Michael",
    last_name: "Johnson",
    title: "CTO",
    email: "michael.johnson@example.com",
    mobile: "+1 (555) 123-4567",
    lead_source: "Website",
    lead_status: "New",
    street: "123 Tech Avenue",
    city: "San Francisco",
    state: "CA",
    zipcode: "94105",
    country: "USA",
    descr: "Michael showed interest in our enterprise solution during the webinar.",
  },
  {
    id: "2",
    lead_owner: "Sarah Williams",
    first_name: "Emily",
    last_name: "Davis",
    title: "Marketing Director",
    email: "emily.davis@example.com",
    mobile: "+1 (555) 987-6543",
    lead_source: "Partner Referral",
    lead_status: "Contacted",
    street: "456 Marketing Blvd",
    city: "New York",
    state: "NY",
    zipcode: "10001",
    country: "USA",
    descr: "Emily was referred by our partner agency. She's looking for a CRM solution for her marketing team.",
  },
  {
    id: "3",
    lead_owner: "David Wilson",
    first_name: "Robert",
    last_name: "Brown",
    title: "CEO",
    email: "robert.brown@example.com",
    mobile: "+1 (555) 456-7890",
    lead_source: "Phone Inquiry",
    lead_status: "Qualified",
    street: "789 Executive Drive",
    city: "Chicago",
    state: "IL",
    zipcode: "60601",
    country: "USA",
    descr: "Robert called to inquire about our premium plan. His company is expanding and needs a robust CRM system.",
  },
]

// Mock database for users
let users: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Admin",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    createdAt: "2023-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    role: "Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    createdAt: "2023-02-20T00:00:00.000Z",
  },
  {
    id: "3",
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "User",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "inactive",
    createdAt: "2023-03-10T00:00:00.000Z",
  },
]

// Lead actions
export async function getLeads(): Promise<Lead[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return leads
}

export async function getLeadById(id: string): Promise<Lead | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return leads.find((lead) => lead.id === id) || null
}

export async function createLead(leadData: Omit<Lead, "id">): Promise<Lead> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Ensure all required fields are present
  const newLead: Lead = {
    ...leadData,
    id:"",
    lead_owner: leadData.lead_owner || "Unassigned",
    lead_status: leadData.lead_status || "New",
    lead_source: leadData.lead_source || "",
    street: leadData.street || "",
    city: leadData.city || "",
    state: leadData.state || "",
    zipcode: leadData.zipcode || "",
    country: leadData.country || "",
    descri: leadData.descri || "",
  }

  leads = [...leads, newLead]
  await ApiService.post("/leads/new",newLead)
  return newLead
}

export async function updateLead(id: string, leadData: Partial<Omit<Lead, "id">>): Promise<Lead | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const leadIndex = leads.findIndex((lead) => lead.id === id)
  if (leadIndex === -1) return null

  const updatedLead = {
    ...leads[leadIndex],
    ...leadData,
  }

  leads = [...leads.slice(0, leadIndex), updatedLead, ...leads.slice(leadIndex + 1)]

  return updatedLead
}

export async function deleteLeadById(id: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const leadIndex = leads.findIndex((lead) => lead.id === id)
  if (leadIndex === -1) return false

  leads = [...leads.slice(0, leadIndex), ...leads.slice(leadIndex + 1)]

  return true
}

// User actions
export async function getUsers(): Promise<User[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return users
}

export async function getUserById(id: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return users.find((user) => user.id === id) || null
}

export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newUser: User = {
    ...userData,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  }

  users = [...users, newUser]
  return newUser
}

export async function updateUser(id: string, userData: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  const updatedUser = {
    ...users[userIndex],
    ...userData,
  }

  users = [...users.slice(0, userIndex), updatedUser, ...users.slice(userIndex + 1)]

  return updatedUser
}

export async function deleteUserById(id: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return false

  users = [...users.slice(0, userIndex), ...users.slice(userIndex + 1)]

  return true
}
