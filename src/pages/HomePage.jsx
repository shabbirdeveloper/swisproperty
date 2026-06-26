import { Link } from "react-router-dom";
import {
  Building2,
  Home,
  Castle,
  Briefcase,
  Trees,
  Gem,
  BadgeCheck,
  Sparkles,
  Users,
  Search,
  FileText,
  ShieldCheck,
  ArrowRight,
  Star,
  ChevronDown,
} from "lucide-react";
import SearchBar from "../components/SearchBar.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import CTASection from "../components/CTASection.jsx";
import Reveal from "../components/Reveal.jsx";
import { useProperties } from "../hooks/useProperties.js";

const categories = [
  { icon: Building2, label: "Apartments", count: 48, type: "Apartment" },
  { icon: Castle, label: "Villas", count: 22, type: "Villa" },
  { icon: Home, label: "Houses", count: 31, type: "House" },
  { icon: Briefcase, label: "Commercial", count: 14, type: "Commercial" },
  { icon: Trees, label: "Land", count: 9, type: "Land" },
  { icon: Gem, label: "Luxury Properties", count: 17, type: "Penthouse" },
];

const reasons = [
  {
    icon: BadgeCheck,
    title: "Verified Listings",
    text: "Every property is vetted and verified by our team for complete peace of mind.",
  },
  {
    icon: Sparkles,
    title: "Premium Presentation",
    text: "Magazine-quality photography and presentation for every home we list.",
  },
  {
    icon: Users,
    title: "Trusted Agents",
    text: "Work with experienced advisors who know the Swiss market intimately.",
  },
  {
    icon: Search,
    title: "Easy Property Search",
    text: "Powerful filters help you find the right property in seconds.",
  },
  {
    icon: FileText,
    title: "Professional Brochure",
    text: "Download an elegant brochure for any property, ready to share.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Communication",
    text: "Connect with agents safely and privately, on your terms.",
  },
];

const stats = [
  { value: "1,200+", label: "Properties Listed" },
  { value: "CHF 4.8B", label: "Property Value" },
  { value: "32", label: "Expert Agents" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function HomePage() {
  const { properties, loading } = useProperties();
  const featured = properties.filter((p) => p.featured).slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Swiss property"
            className="h-full w-full animate-kenburns object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/75 via-charcoal/55 to-charcoal/80" />
        </div>

        <div className="container-luxe relative flex flex-col items-center justify-center py-24 text-center sm:py-32 lg:py-40">
          <span className="mb-5 inline-flex animate-fadeUp items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-luxe text-white backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            Premium Real Estate
          </span>
          <h1
            className="max-w-4xl animate-fadeUp text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Discover Premium Properties with{" "}
            <span className="text-gold">SwissProperty</span>
          </h1>
          <p
            className="mt-6 max-w-2xl animate-fadeUp text-base leading-relaxed text-white/80 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Luxury homes, apartments, villas, and investment properties —
            beautifully presented.
          </p>

          <div
            className="mt-10 w-full max-w-5xl animate-fadeUp"
            style={{ animationDelay: "240ms" }}
          >
            <SearchBar />
          </div>

          <a
            href="#featured"
            aria-label="Scroll to featured properties"
            className="mt-12 hidden animate-floaty text-white/60 transition hover:text-gold sm:block"
          >
            <ChevronDown className="h-7 w-7" />
          </a>
        </div>
      </section>

      {/* FEATURED */}
      <section id="featured" className="container-luxe scroll-mt-24 py-20">
        <Reveal className="mb-12 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Curated Selection"
            title="Featured Properties"
            subtitle="A handpicked collection of Switzerland's most distinguished residences."
            align="left"
            className="!mx-0"
          />
          <Link to="/listings" className="btn-outline shrink-0">
            View All Listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))
            : featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 90}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-cloud py-20">
        <div className="container-luxe">
          <Reveal>
            <SectionHeading
              eyebrow="Browse by Type"
              title="Property Categories"
              subtitle="Explore our portfolio across every category of premium real estate."
            />
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(({ icon: Icon, label, count, type }, i) => (
              <Reveal key={label} delay={(i % 6) * 70}>
                <Link
                  to={`/listings?propertyType=${encodeURIComponent(type)}`}
                  className="group flex h-full flex-col items-center rounded-2xl border border-charcoal/[0.06] bg-white p-6 text-center shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold transition duration-300 group-hover:bg-gold group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="mt-4 text-sm font-semibold text-charcoal">
                    {label}
                  </span>
                  <span className="mt-1 text-xs text-charcoal/45">
                    {count} listings
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="container-luxe py-20">
        <Reveal>
          <SectionHeading
            eyebrow="The SwissProperty Difference"
            title="Why Choose SwissProperty"
            subtitle="A premium experience built on trust, presentation, and expertise."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 3) * 90}>
              <div className="card-luxe group h-full p-7 transition duration-300 hover:-translate-y-1 hover:shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition duration-300 group-hover:bg-gold group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-charcoal">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  {text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-charcoal py-16">
        <div className="container-luxe grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={(i % 4) * 80} className="text-center">
              <p className="text-3xl font-bold text-gold sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-white/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Reveal>
          <CTASection />
        </Reveal>
      </section>
    </>
  );
}
