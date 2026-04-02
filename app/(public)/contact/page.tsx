import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | PrintYourVibe",
  description: "Get in touch with the PrintYourVibe team. We're here to help.",
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 bg-dark min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="font-label text-[11px] uppercase tracking-widest text-gold">Get In Touch</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-cream mt-3 mb-4">Contact Us</h1>
          <p className="text-cream-muted max-w-lg mx-auto">
            Have a question about an order, a custom project, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
