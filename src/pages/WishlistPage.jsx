import { Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PropertyCard from "../components/PropertyCard.jsx";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton.jsx";
import Reveal from "../components/Reveal.jsx";
import { useProperties } from "../hooks/useProperties.js";
import { useSaved } from "../context/SavedContext.jsx";

export default function WishlistPage() {
  const { properties, loading } = useProperties();
  const { saved } = useSaved();

  const wishlisted = properties.filter((p) => saved.includes(p.id));

  return (
    <>
      <section className="border-b border-charcoal/[0.06] bg-cloud">
        <div className="container-luxe py-14 text-center">
          <span className="eyebrow">Your Collection</span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl">
            Wishlist
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal/60">
            {wishlisted.length > 0
              ? `${wishlisted.length} saved ${
                  wishlisted.length === 1 ? "property" : "properties"
                }.`
              : "Properties you save will appear here."}
          </p>
        </div>
      </section>

      <section className="container-luxe py-12">
        {loading ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : wishlisted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-charcoal/15 bg-cloud px-6 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Heart className="h-8 w-8" />
            </span>
            <h3 className="mt-6 text-xl font-semibold text-charcoal">
              No saved properties yet
            </h3>
            <p className="mt-2 max-w-md text-sm text-charcoal/60">
              Tap the heart icon on any property to save it to your wishlist.
            </p>
            <Link to="/listings" className="btn-primary mt-6">
              <Search className="h-4 w-4" />
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {wishlisted.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80}>
                <PropertyCard property={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
