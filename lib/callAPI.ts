import ApiService from "@/lib/ApiService";

// GET all leads
const leads = await ApiService.get("/leads");

// POST new lead
await ApiService.post("/leads/new", {
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  lead_owner: "Admin",
});

// PATCH lead
await ApiService.patch("/leads/1", { lead_status: "Converted" });

// DELETE lead
await ApiService.delete("/leads/1");
