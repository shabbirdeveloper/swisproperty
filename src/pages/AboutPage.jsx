import {
  Target,
  Eye,
  BadgeCheck,
  HeartHandshake,
  ShieldCheck,
  Award,
} from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import CTASection from "../components/CTASection.jsx";
import Reveal from "../components/Reveal.jsx";

const stats = [
  { value: "15+", label: "Years of Experience" },
  { value: "1,200+", label: "Properties Sold" },
  { value: "CHF 4.8B", label: "Total Sales Value" },
  { value: "98%", label: "Client Satisfaction" },
];

const values = [
  {
    icon: BadgeCheck,
    title: "Integrity",
    text: "Every listing is verified and every interaction handled with honesty.",
  },
  {
    icon: HeartHandshake,
    title: "Client First",
    text: "Your goals lead the way. We advise, never pressure.",
  },
  {
    icon: ShieldCheck,
    title: "Discretion",
    text: "Privacy and security at every stage of your property journey.",
  },
  {
    icon: Award,
    title: "Excellence",
    text: "A relentless commitment to premium presentation and service.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Intro */}
      <section className="border-b border-charcoal/[0.06] bg-cloud">
        <div className="container-luxe grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2">
          <div>
            <span className="eyebrow">About SwissProperty</span>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-charcoal sm:text-4xl lg:text-5xl">
              Switzerland's home for premium real estate
            </h1>
            <p className="mt-5 leading-relaxed text-charcoal/65">
              For over fifteen years, SwissProperty has connected discerning
              buyers with Switzerland's most exceptional homes. We combine local
              market mastery with magazine-quality presentation to make every
              property feel like the landmark it is.
            </p>
            <p className="mt-4 leading-relaxed text-charcoal/65">
              From lakeside apartments to alpine chalets, we represent residences
              that define a lifestyle — and the people who aspire to them.
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
              alt="Premium interior"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-charcoal px-6 py-5 text-white shadow-gold sm:block">
              <p className="font-serif text-2xl font-semibold text-gold">15+</p>
              <p className="text-xs text-white/70">Years of excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container-luxe py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-luxe p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Target className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-serif text-2xl font-semibold text-charcoal">
              Our Mission
            </h2>
            <p className="mt-3 leading-relaxed text-charcoal/65">
              To present Switzerland's finest properties with unmatched elegance,
              and to guide every client to the right home with clarity,
              discretion, and care.
            </p>
          </div>
          <div className="card-luxe p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Eye className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-serif text-2xl font-semibold text-charcoal">
              Our Vision
            </h2>
            <p className="mt-3 leading-relaxed text-charcoal/65">
              To be the most trusted name in Swiss luxury real estate — defined by
              the quality of our portfolio and the strength of our relationships.
            </p>
          </div>
        </div>
      </section>

      {/* Why / Values */}
      <section className="bg-cloud py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Why SwissProperty"
            subtitle="The principles behind every property we represent."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }, i) => (
              <Reveal
                key={title}
                delay={(i % 4) * 80}
                className="card-luxe h-full p-6 text-center"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold text-charcoal">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                  {text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="bg-charcoal py-16">
        <div className="container-luxe grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-3xl font-semibold text-gold sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <CTASection />
      </section>
    </>
  );
}
