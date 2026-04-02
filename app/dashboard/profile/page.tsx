"use client";
import { useState, useEffect } from "react";
import { Camera, Save, KeyRound, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import { db } from "@/lib/supabase/queries";
import Image from "next/image";

export default function ProfilePage() {
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("?");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setLoading(false); return; }

      const user = session.user;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
      const avatar = user.user_metadata?.avatar_url || null;
      const parts = name.trim().split(" ");
      const init = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase() || "?";

      // Also fetch from profiles table for phone
      const { data: profile } = await db
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      setForm({
        fullName: (profile as any)?.full_name || name,
        phone: "",
      });
      setEmail(user.email || "");
      setAvatarUrl((profile as any)?.avatar_url || avatar);
      setInitials(init);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setSaving(false); return; }

    await db.from("profiles")
      .update({ full_name: form.fullName })
      .eq("id", session.user.id);

    await supabase.auth.updateUser({
      data: { full_name: form.fullName },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async () => {
    setPwError("");
    if (pwForm.next.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match."); return; }
    setPwLoading(true);

    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) {
      setPwError(error.message);
    } else {
      setPwSaved(true);
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    }
    setPwLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-dark-elevated rounded-xl w-48" />
        <div className="grid xl:grid-cols-3 gap-6">
          <div className="h-48 bg-dark-elevated rounded-2xl" />
          <div className="xl:col-span-2 space-y-5">
            <div className="h-48 bg-dark-elevated rounded-2xl" />
            <div className="h-48 bg-dark-elevated rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

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
                {avatarUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold/30">
                    <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center">
                    <span className="font-display text-3xl font-bold text-gold">{initials}</span>
                  </div>
                )}
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gold text-dark rounded-full flex items-center justify-center hover:bg-gold-light transition-colors shadow-md">
                  <Camera size={14} />
                </button>
              </div>
              <div className="text-center">
                <p className="font-heading text-sm text-cream font-semibold">{form.fullName || "Your Name"}</p>
                <p className="text-xs text-cream-faint mt-0.5">{email}</p>
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
                <Input
                  id="pf-name"
                  label="Full Name"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                />
                <Input
                  id="pf-email"
                  label="Email Address"
                  type="email"
                  value={email}
                  disabled
                  hint="To change your email, contact support."
                />
                {saved && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 size={16} /> Changes saved!
                  </div>
                )}
                <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
                  <Save size={15} /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-heading text-cream font-semibold mb-5">Change Password</h2>
              <div className="space-y-5">
                <Input id="pf-new" label="New Password" type="password" placeholder="Min. 8 characters"
                  value={pwForm.next} onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))} />
                <Input id="pf-confirm" label="Confirm New Password" type="password" placeholder="Repeat new password"
                  value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
                {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
                {pwSaved && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 size={16} /> Password updated!
                  </div>
                )}
                <Button variant="secondary" size="md" loading={pwLoading} onClick={handlePasswordChange}>
                  <KeyRound size={15} /> Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="font-heading text-red-400/80 font-semibold mb-3">Danger Zone</h2>
              <p className="text-sm text-cream-muted mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" size="md" className="flex items-center gap-2"
                onClick={async () => {
                  if (!confirm("Are you sure? This cannot be undone.")) return;
                  // Sign out first, then user can email to delete
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}>
                <Trash2 size={15} /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
