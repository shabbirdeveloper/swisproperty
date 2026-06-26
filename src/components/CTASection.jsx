import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";

export default function CTASection() {
  return (
    <section className="container-luxe">
      <div className="relative overflow-hidden rounded-3xl bg-charcoal px-6 py-16 text-center sm:px-12 sm:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <span className="eyebrow">Let's Begin</span>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Ready to find your next premium property?
          </h2>
          <p className="mt-4 text-white/60">
            Our advisors are ready to guide you through Switzerland's finest
            homes — discreetly and with absolute attention to detail.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/listings" className="btn-gold px-8 py-4">
              Browse Listings
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="btn px-8 py-4 border border-white/20 text-white hover:border-gold hover:text-gold"
            >
              <Phone className="h-5 w-5" />
              Contact Agent
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
