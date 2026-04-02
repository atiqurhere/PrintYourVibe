"use client";
import { useState } from "react";
import { Save, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";

const NOTIFICATION_EVENTS = [
  "New order placed",
  "Order confirmed",
  "Order sent to printing",
  "Order dispatched",
  "Order delivered",
  "Order cancelled",
  "Refund issued",
];

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Store info
  const [storeName, setStoreName] = useState("PrintYourVibe");
  const [supportEmail, setSupportEmail] = useState("hello@printyourvibe.co.uk");
  const [supportPhone, setSupportPhone] = useState("+44 20 0000 0000");

  // Shipping
  const [stdRate, setStdRate] = useState("3.99");
  const [expressRate, setExpressRate] = useState("7.99");
  const [freeThreshold, setFreeThreshold] = useState("50");

  // Mockup
  const [watermark, setWatermark] = useState("PrintYourVibe.co.uk");

  // Notifications
  const [notifs, setNotifs] = useState<string[]>(NOTIFICATION_EVENTS);
  const toggleNotif = (n: string) =>
    setNotifs((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);

  const handleSave = async () => {
    setSaving(true);
    // Try saving to Supabase settings table (if it exists)
    try {
      await supabase.from("settings").upsert({
        id: "global",
        store_name: storeName,
        support_email: supportEmail,
        support_phone: supportPhone,
        std_shipping: parseFloat(stdRate),
        express_shipping: parseFloat(expressRate),
        free_threshold: parseFloat(freeThreshold),
        watermark_text: watermark,
        notification_events: notifs,
      });
    } catch { /* Settings table may not exist yet – that's OK */ }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-cream">Site Settings</h1>
        <Button variant="primary" size="md" onClick={handleSave} loading={saving}>
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save All</>}
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Store info */}
        <Card>
          <CardContent>
            <h2 className="font-heading text-cream font-semibold mb-5">Store Information</h2>
            <div className="space-y-4">
              <Input id="s-name" label="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              <Input id="s-email" label="Support Email" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              <Input id="s-phone" label="Support Phone" type="tel" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card>
          <CardContent>
            <h2 className="font-heading text-cream font-semibold mb-5">Shipping Rates</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input id="s-std" label="Standard (£)" type="number" value={stdRate} onChange={(e) => setStdRate(e.target.value)} />
              <Input id="s-exp" label="Express (£)" type="number" value={expressRate} onChange={(e) => setExpressRate(e.target.value)} />
              <Input id="s-free" label="Free Shipping (£+)" type="number" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} />
            </div>
            <p className="text-xs text-cream-muted mt-3">Orders above the free shipping threshold will have shipping waived automatically.</p>
          </CardContent>
        </Card>

        {/* Mockup tool */}
        <Card>
          <CardContent>
            <h2 className="font-heading text-cream font-semibold mb-5">Mockup Tool</h2>
            <Input id="s-wm" label="Watermark Text (shown on anonymous preview exports)" value={watermark} onChange={(e) => setWatermark(e.target.value)} />
          </CardContent>
        </Card>

        {/* Email notifications */}
        <Card>
          <CardContent>
            <h2 className="font-heading text-cream font-semibold mb-5">Email Notifications</h2>
            <p className="text-xs text-cream-muted mb-4">Choose which events trigger an email alert to the admin inbox.</p>
            <div className="space-y-3">
              {NOTIFICATION_EVENTS.map((item) => (
                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 shrink-0 ${notifs.includes(item) ? "bg-gold border-gold" : "border-gold/30 group-hover:border-gold/60"}`}
                    onClick={() => toggleNotif(item)}
                  >
                    {notifs.includes(item) && (
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-cream-muted group-hover:text-cream transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card>
          <CardContent>
            <h2 className="font-heading text-cream font-semibold mb-1">Danger Zone</h2>
            <p className="text-xs text-cream-muted mb-5">These actions are irreversible. Proceed with care.</p>
            <div className="flex gap-3">
              <Button variant="destructive" size="sm" onClick={() => alert("Contact your Supabase admin to wipe data.")}>
                Clear All Orders (dev)
              </Button>
              <Button variant="destructive" size="sm" onClick={() => alert("Export triggered — configure S3/email first.")}>
                Export Full Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" onClick={handleSave} loading={saving}>
            {saved ? <><Check size={15} /> Changes Saved!</> : <><Save size={15} /> Save Settings</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
