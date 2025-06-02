"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, updateUserProfile, isLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form with user data when user is loaded
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  // Debug logging
  useEffect(() => {
    console.log('Profile page - isLoading:', isLoading, 'user:', user);
  }, [isLoading, user]);

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditing(true);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: any = {
        name: form.name,
        email: form.email,
      };

      if (form.password.trim()) {
        updateData.password = form.password;
      }

      const success = await updateUserProfile(updateData);
      
      if (success) {
        setEditing(false);
        setForm(prev => ({ ...prev, password: "" }));
        alert("Profile updated successfully!"); // Using alert for now, replace with toast later
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
    }
    setEditing(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  // Show error state if no user after loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No User Data</h2>
            <p className="text-muted-foreground mb-4">
              Unable to load user profile. Please try logging in again.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
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
                  <h2 className="text-2xl font-semibold">{form.name || "Unknown User"}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{user.role || "User"}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{form.email || "No email"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                  </p>
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
                      disabled={saving}
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
                      disabled={saving}
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
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to keep your current password.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  {editing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={!editing || saving}
                    className={!editing ? "opacity-70 cursor-not-allowed" : ""}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
