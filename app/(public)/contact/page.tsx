"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Mail, MapPin, Clock, MessageSquare, CheckCircle } from "lucide-react";

const contactInfo = [
  { icon: <Mail size={18} />,    label: "Email", value: "hello@printyourvibe.co.uk", href: "mailto:hello@printyourvibe.co.uk" },
  { icon: <MapPin size={18} />,  label: "Location", value: "United Kingdom", href: null },
  { icon: <Clock size={18} />,   label: "Response Time", value: "Within 24 hours", href: null },
];

export default function ContactPage() {
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Something went wrong. Please try again or email us directly.");
      }
    } catch {
      setError("Failed to send. Please email us directly at hello@printyourvibe.co.uk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark">
        {/* Hero */}
        <section className="pt-32 pb-16 bg-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gold opacity-40" />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <span className="font-label text-[11px] uppercase tracking-widest text-gold">Get in Touch</span>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-cream mt-4 mb-4">Contact Us</h1>
            <p className="text-cream-muted">Have a question, bulk order enquiry, or feedback? We'd love to hear from you.</p>
          </div>
        </section>

        {/* Contact */}
        <section className="pb-24 bg-dark">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-10">
              {/* Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="font-heading text-cream font-semibold text-xl mb-4">We're here to help</h2>
                  <p className="text-cream-muted text-sm leading-relaxed">
                    Whether you have a question about an order, need help with the mockup tool, or want to discuss a large custom print run — get in touch.
                  </p>
                </div>
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-start gap-4 p-4 bg-dark-card border border-gold/12 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <p className="font-label text-[10px] uppercase tracking-widest text-cream-faint mb-1">{info.label}</p>
                        {info.href ? (
                          <a href={info.href} className="text-cream text-sm hover:text-gold transition-colors">{info.value}</a>
                        ) : (
                          <p className="text-cream text-sm">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gold/5 border border-gold/15 rounded-xl p-4">
                  <p className="font-label text-[10px] uppercase tracking-widest text-gold mb-2">📦 Order Issues?</p>
                  <p className="text-cream-muted text-xs leading-relaxed">
                    For existing order support, include your order number (#PYV-YYYYMMDD-XXXX) in the subject line for a faster response.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3">
                {sent ? (
                  <div className="bg-dark-card border border-green-400/20 rounded-2xl p-10 text-center">
                    <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
                    <h3 className="font-display font-bold text-2xl text-cream mb-2">Message Sent!</h3>
                    <p className="text-cream-muted">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                    <button onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
                      className="mt-6 text-sm text-gold hover:text-gold-light transition-colors">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-dark-card border border-gold/12 rounded-2xl p-8 space-y-5">
                    <h2 className="font-heading text-cream font-semibold text-lg mb-2">Send a Message</h2>
                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input id="c-name"  label="Name *"  placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required />
                      <Input id="c-email" label="Email *" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <Input id="c-subject" label="Subject" placeholder="e.g. Bulk order enquiry" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    <Textarea id="c-message" label="Message *" rows={6} placeholder="Tell us how we can help…" value={message} onChange={(e) => setMessage(e.target.value)} />
                    <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                      <MessageSquare size={16} /> Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
