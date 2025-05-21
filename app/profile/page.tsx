"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Shield } from "lucide-react";

const mockUser = {
  name: "Naveen Kumar",
  email: "naveen@example.com",
  role: "Admin",
};

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: mockUser.name,
    email: mockUser.email,
    password: "",
  });
  const [editing, setEditing] = useState(false);

  const initials = form.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditing(true);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save logic here
    setEditing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl p-6">
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{form.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{mockUser.role}</Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{form.email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="inline h-4 w-4 mr-1" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="password">
                  <Shield className="inline h-4 w-4 mr-1" />
                  New Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep your current password.
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!editing}
                  className={!editing ? "opacity-70 cursor-not-allowed" : ""}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
