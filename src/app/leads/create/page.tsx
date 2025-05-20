"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
  leadOwner: "",
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  title: "",
  phone: "",
  mobile: "",
  leadSource: "",
  industry: "",
  annualRevenue: "",
  leadStatus: "",
  employees: "",
  rating: "",
  fax: "",
  website: "",
};

const leadSources = ["None", "Advertisement", "Cold Call", "Employee Referral", "External Referral", "Partner", "Public Relations", "Trade Show", "Web Download", "Web Research", "Other"];
const industries = ["None", "Apparel", "Banking", "Biotechnology", "Chemicals", "Communications", "Construction", "Consulting", "Education", "Electronics", "Energy", "Engineering", "Entertainment", "Environmental", "Finance", "Food & Beverage", "Government", "Healthcare", "Hospitality", "Insurance", "Machinery", "Manufacturing", "Media", "Not For Profit", "Recreation", "Retail", "Shipping", "Technology", "Telecommunications", "Transportation", "Utilities", "Other"];
const leadStatuses = ["None", "Attempted to Contact", "Contact in Future", "Contacted", "Junk Lead", "Lost Lead", "Not Contacted", "Pre Qualified", "Not Qualified"];
const ratings = ["None", "Hot", "Warm", "Cold"];

export default function CreateLeadPage() {
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => router.push("/leads"), 1200);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 text-gray-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Create Lead</h1>
          <a href="#" className="text-blue-600 text-sm hover:underline">Edit Page Layout</a>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-5 py-2 rounded-lg border font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200" onClick={() => router.push('/leads')}>Cancel</button>
          <button type="button" className="px-5 py-2 rounded-lg border font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">Save and New</button>
          <button type="submit" form="lead-form" className="px-5 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700">Save</button>
        </div>
      </div>
      <hr className="mb-8" />
      <form id="lead-form" onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 border border-gray-200">
        <div className="flex gap-8">
          {/* Lead Image */}
          <div className="w-48 flex flex-col items-center mr-8">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-300">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118A7.5 7.5 0 0112 15.75a7.5 7.5 0 017.5 4.368" /></svg>
            </div>
            <span className="text-sm text-gray-500">Lead Image</span>
          </div>
          {/* Form Fields */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4">Lead Information</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block font-semibold mb-1">Lead Owner</label>
                <input name="leadOwner" value={form.leadOwner} onChange={handleChange} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-200" placeholder="Lead Owner" required />
              </div>
              <div>
                <label className="block font-semibold mb-1">Company <span className="text-red-500">*</span></label>
                <input name="company" value={form.company} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>
              <div>
                <label className="block font-semibold mb-1">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Last Name <span className="text-red-500">*</span></label>
                <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
              </div>
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="w-full border px-3 py-2 rounded" type="email" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Fax</label>
                <input name="fax" value={form.fax} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mobile</label>
                <input name="mobile" value={form.mobile} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Website</label>
                <input name="website" value={form.website} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lead Source</label>
                <select name="leadSource" value={form.leadSource} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  {leadSources.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Lead Status</label>
                <select name="leadStatus" value={form.leadStatus} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  {leadStatuses.map((stat) => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Industry</label>
                <select name="industry" value={form.industry} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">No. of Employees</label>
                <input name="employees" value={form.employees} onChange={handleChange} className="w-full border px-3 py-2 rounded" type="number" min="0" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Annual Revenue</label>
                <input name="annualRevenue" value={form.annualRevenue} onChange={handleChange} className="w-full border px-3 py-2 rounded" type="number" min="0" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Rating</label>
                <select name="rating" value={form.rating} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  {ratings.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        {success && <div className="mt-6 text-green-600 font-semibold">Lead created! Redirecting...</div>}
      </form>
    </div>
  );
} 