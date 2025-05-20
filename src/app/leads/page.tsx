"use client";
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialLeads = {
  New: [
    {
      id: "1",
      name: "Haritha Beduduru",
      email: "haritha@example.com",
      phone: "+91-9876543210",
      source: "Website Contact Form",
      status: "New",
      createdDate: "2025-05-01",
      probability: 10,
      expectedRevenue: 10000,
    },
    {
      id: "2",
      name: "Sanjay Kumar",
      email: "sanjay.kumar@gmail.com",
      phone: "+91-9812345678",
      source: "LinkedIn Outreach",
      status: "New",
      createdDate: "2025-05-02",
      probability: 10,
      expectedRevenue: 15000,
    },
  ],
  Active: [
    {
      id: "3",
      name: "Aishwarya Menon",
      email: "aishwary@example.com",
      phone: "+91-9123456789",
      source: "Referral",
      status: "Active",
      createdDate: "2025-04-28",
      probability: 30,
      expectedRevenue: 20000,
    },
    {
      id: "4",
      name: "Ravi Teja",
      email: "raviteja@example.com",
      phone: "+91-9988776655",
      source: "Cold Call",
      status: "Active",
      createdDate: "2025-04-30",
      probability: 25,
      expectedRevenue: 12000,
    },
  ],
  "Follow Up": [
    {
      id: "5",
      name: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      phone: "+91-9090909090",
      source: "Webinar Signup",
      status: "Follow Up",
      createdDate: "2025-04-20",
      probability: 45,
      expectedRevenue: 25000,
    },
  ],
  Success: [
    {
      id: "6",
      name: "Manoj Sharma",
      email: "manoj.sharma@example.com",
      phone: "+91-9000011111",
      source: "Inbound Email",
      status: "Success",
      createdDate: "2025-03-15",
      probability: 100,
      expectedRevenue: 50000,
    },
  ],
  Loss: [
    {
      id: "7",
      name: "Priya Desai",
      email: "priya.desai@example.com",
      phone: "+91-8123456789",
      source: "Event Booth",
      status: "Loss",
      createdDate: "2025-04-05",
      probability: 0,
      expectedRevenue: 0,
    },
  ],
};


const columnMeta = {
  New: { color: "bg-red-200 text-red-800", label: "New" },
  Active: { color: "bg-purple-200 text-purple-800", label: "Active" },
  "Follow Up": { color: "bg-green-200 text-green-800", label: "Follow Up" },
  Success: { color: "bg-blue-200 text-blue-800", label: "Success" },
  Loss: { color: "bg-yellow-200 text-yellow-800", label: "Loss" },
};

function CreateLeadModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    location: "",
    status: "New",
    createdDate: new Date().toISOString().slice(0, 10),
  });

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onCreate(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30">
      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Create Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border px-4 py-3 rounded text-base" required />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full border px-4 py-3 rounded text-base" type="email" required />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border px-4 py-3 rounded text-base" required />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">Lead Source</label>
            <input name="source" value={form.source} onChange={handleChange} className="w-full border px-4 py-3 rounded text-base" />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full border px-4 py-3 rounded text-base" />
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" className="px-6 py-2 rounded border bg-gray-50 text-base" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-6 py-2 rounded bg-gray-900 text-white font-semibold text-base">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeadsKanban() {
  const [leads, setLeads] = useState(initialLeads);
  const [modalOpen, setModalOpen] = useState(false);

  function onDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const sourceCol = Array.from(leads[source.droppableId]);
    const destCol = Array.from(leads[destination.droppableId]);
    const [removed] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, removed);
    setLeads({
      ...leads,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    });
  }

  function handleCreateLead(newLead) {
    setLeads((prev) => ({
      ...prev,
      New: [
        {
          id: Date.now().toString(),
          ...newLead,
        },
        ...prev.New,
      ],
    }));
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads Board</h1>
        <button
          className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg shadow cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          Create Lead
        </button>
      </div>
      <CreateLeadModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateLead} />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-1">
          {Object.keys(leads).map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 min-w-[260px] max-w-xs bg-gray-50 rounded-lg p-3"
                >
                  <div className={`mb-3 px-2 py-1 rounded text-base font-semibold text-black ${columnMeta[col].color}`}>{columnMeta[col].label}</div>
                  {leads[col].map((lead, idx) => (
                    <Draggable draggableId={lead.id} index={idx} key={lead.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white rounded shadow p-4 mb-4 border-l-4 ${columnMeta[col].color.replace('bg', 'border')}`}
                          style={{ ...provided.draggableProps.style, minHeight: 110 }}
                        >
                          <div className="text-lg font-semibold mb-1 text-black">{lead.name}</div>
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="bg-gray-50 rounded px-2 py-1 text-black flex items-center gap-1 break-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <path d="M3 5l9 7 9-7" stroke="currentColor" strokeWidth="2" fill="none"/>
                              </svg>
                              <span className="break-all">{lead.email}</span>
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1 text-black flex items-center gap-1 break-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2A19.72 19.72 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.13.81.36 1.6.68 2.34a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="break-all">{lead.phone}</span>
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1 text-black">Source: {lead.source}</div>
                            <div className="bg-gray-50 rounded px-2 py-1 text-black">Created: {lead.createdDate}</div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
} 