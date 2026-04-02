"use client";
import Link from "next/link";

// Inline SVG social icons (lucide-react doesn't include these)
const SvgInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const SvgTwitter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const SvgFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const SvgYoutube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

const footerNav = {
  Shop:    [{ label: "T-Shirts",    href: "/products?cat=t-shirts" }, { label: "Hoodies", href: "/products?cat=hoodies" }, { label: "Sweatshirts", href: "/products?cat=sweatshirts" }, { label: "Tote Bags", href: "/products?cat=tote-bags" }],
  Company: [{ label: "About Us",   href: "/about" }, { label: "Contact",     href: "/contact" }, { label: "Track Order", href: "/track-order" }],
  Help:    [{ label: "Shipping",   href: "/about#shipping" }, { label: "Returns", href: "/about#returns" }, { label: "Size Guide", href: "/about#sizing" }, { label: "FAQ", href: "/about#faq" }],
};

const socials = [
  { icon: <SvgInstagram />, href: "#", label: "Instagram" },
  { icon: <SvgTwitter />,   href: "#", label: "Twitter" },
  { icon: <SvgFacebook />,  href: "#", label: "Facebook" },
  { icon: <SvgYoutube />,   href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-dark-2 border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center shadow-md shadow-gold/30">
                <span className="font-label font-bold text-dark text-sm">PYV</span>
              </div>
              <span className="font-heading font-semibold text-cream text-lg">
                Print<span className="text-gold">Your</span>Vibe
              </span>
            </Link>
            <p className="text-cream-muted text-sm leading-relaxed max-w-xs mb-6">
              Premium custom print-on-demand. Upload your artwork, preview it on real products, and get
              everything printed and delivered in the UK.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg border border-gold/15 flex items-center justify-center text-cream-muted hover:text-gold hover:border-gold/40 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerNav).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-label text-[11px] uppercase tracking-widest text-cream-faint mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-cream-muted hover:text-gold transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-14 pt-10 border-t border-gold/8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="font-heading text-cream font-semibold mb-1">Stay in the loop</h4>
              <p className="text-cream-muted text-sm">New products, special offers, and design inspiration.</p>
            </div>
            <form className="flex gap-0 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-64 bg-dark-elevated border border-gold/15 border-r-0 rounded-l-lg px-4 py-2.5 text-sm text-cream placeholder:text-cream-faint/50 focus:outline-none focus:border-gold/40 transition-colors"
              />
              <button
                type="submit"
                className="bg-gold text-dark font-heading font-semibold text-sm px-5 py-2.5 rounded-r-lg hover:bg-gold-light transition-colors btn-shimmer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gold/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream-faint text-xs font-label">
            © {new Date().getFullYear()} PrintYourVibe Ltd. All rights reserved.
          </p>
          {/* Payment icons */}
          <div className="flex items-center gap-2">
            {["VISA", "MC", "PayPal", "Apple Pay"].map((p) => (
              <span
                key={p}
                className="px-2 py-1 border border-gold/10 rounded text-[10px] font-label text-cream-faint bg-dark-elevated"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
