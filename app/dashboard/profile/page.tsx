"use client";
import { useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function ProfilePage() {
  const [form, setForm] = useState({ fullName: "Jane Doe", phone: "+44 7700 000000", email: "jane@example.com" });
  const up = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-cream mb-6">Profile Settings</h1>
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Avatar */}
        <Card>
          <CardContent>
            <h2 className="font-heading text-cream font-semibold mb-5">Photo</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-gold">JD</span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gold text-dark rounded-full flex items-center justify-center hover:bg-gold-light transition-colors shadow-md">
                  <Camera size={14} />
                </button>
              </div>
              <p className="text-xs text-cream-faint text-center">PNG or JPG, max 2MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Personal Information</h2>
              <div className="space-y-5">
                <Input id="pf-name" label="Full Name" value={form.fullName} onChange={(e) => up("fullName", e.target.value)} />
                <Input id="pf-phone" label="Phone" type="tel" value={form.phone} onChange={(e) => up("phone", e.target.value)} />
                <Input id="pf-email" label="Email Address" type="email" value={form.email} onChange={(e) => up("email", e.target.value)} hint="Changing your email will require re-verification." />
                <Button variant="primary" size="md">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Change Password</h2>
              <div className="space-y-5">
                <Input id="pf-current" label="Current Password" type="password" placeholder="••••••••" />
                <Input id="pf-new" label="New Password" type="password" placeholder="Min. 8 characters" />
                <Input id="pf-confirm" label="Confirm New Password" type="password" placeholder="Repeat new password" />
                <Button variant="secondary" size="md">Update Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-heading text-red-400/80 font-semibold mb-3">Danger Zone</h2>
              <p className="text-sm text-cream-muted mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <Button variant="destructive" size="md" className="flex items-center gap-2">
                <Trash2 size={15} /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
