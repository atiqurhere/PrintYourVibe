"use client";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";

const contactInfo = [
  { icon: <Mail size={18} />,   label: "Email",  value: "hello@printyourvibe.co.uk", sub: "We reply within 24 hours" },
  { icon: <Phone size={18} />,  label: "Phone",  value: "+44 20 0000 0000",           sub: "Mon–Fri, 9am–5pm GMT" },
  { icon: <MapPin size={18} />, label: "Studio", value: "PrintYourVibe Ltd, London, UK", sub: "Appointments by request" },
  { icon: <Clock size={18} />,  label: "Hours",  value: "Monday – Friday",            sub: "9:00am – 5:30pm GMT" },
];

export function ContactForm() {
  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <Card>
        <CardContent className="pt-8">
          <h2 className="font-heading text-cream font-semibold text-xl mb-6">Send a Message</h2>
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <Input id="c-fname" label="First Name" placeholder="Jane" required />
              <Input id="c-lname" label="Last Name" placeholder="Smith" required />
            </div>
            <Input id="c-email" label="Email" type="email" placeholder="you@example.com" required />
            <Input id="c-subject" label="Subject" placeholder="How can we help?" required />
            <Textarea id="c-message" label="Message" placeholder="Tell us more…" rows={5} />
            <Button type="submit" size="lg" variant="primary" className="w-full">Send Message</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {contactInfo.map((item) => (
          <div key={item.label} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 text-gold">
              {item.icon}
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-gold mb-1">{item.label}</p>
              <p className="font-heading text-cream font-semibold">{item.value}</p>
              <p className="text-sm text-cream-muted">{item.sub}</p>
            </div>
          </div>
        ))}
        <div className="pt-6 border-t border-gold/10">
          <p className="text-sm text-cream-muted mb-4">Looking to track your order?</p>
          <Link href="/track-order">
            <Button variant="secondary" size="md">Track Your Order →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
