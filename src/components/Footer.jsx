import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Logo from "./Logo.jsx";

const quickLinks = [
  { to: "/listings", label: "All Listings" },
  { to: "/listings?status=For+Sale", label: "Buy" },
  { to: "/listings?status=For+Rent", label: "Rent" },
  { to: "/agents", label: "Our Agents" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

const socials = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Twitter, label: "Twitter" },
];

export default function Footer() {
  return (
    <footer className="mt-24 bg-charcoal text-white/80">
      <div className="container-luxe grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            SwissProperty curates Switzerland's most exceptional homes,
            apartments, and investment properties — presented with the elegance
            they deserve.
          </p>
          <div className="flex gap-3">
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:bg-gold hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-luxe text-gold">
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-white/60 transition hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-luxe text-gold">
            Contact
          </h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              Bahnhofstrasse 42, 8001 Zurich, Switzerland
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              +41 44 123 45 67
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              hello@swissproperty.ch
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-sm font-semibold uppercase tracking-luxe text-gold">
            Newsletter
          </h4>
          <p className="mb-4 text-sm text-white/60">
            Receive new luxury listings before anyone else.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex overflow-hidden rounded-full border border-white/15 bg-white/5 p-1"
          >
            <input
              type="email"
              placeholder="Your email"
              className="w-full bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-white transition hover:bg-gold-light">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} SwissProperty. All rights reserved.</p>
          <p className="flex gap-5">
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-white">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
