import React from "react";
import { FaHome, FaUser, FaCog, FaAddressBook } from "react-icons/fa";

const menuItems = [
  { name: "Home", icon: <FaHome />, href: "/" },
  { name: "Leads", icon: <FaAddressBook />, href: "/leads" },
  { name: "Settings", icon: <FaCog />, href: "/settings" },
  { name: "Profile", icon: <FaUser />, href: "/profile" },
];

export default function Sidebar() {
  return (
    <aside className="bg-gray-900 text-white w-64 h-screen flex flex-col py-8 px-4">
      <div className="mb-10 text-2xl font-bold tracking-wide text-center">CRM</div>
      <nav className="flex-1">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 