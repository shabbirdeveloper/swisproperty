import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import PropertyCard from "../../components/PropertyCard.jsx";
import { useProperties } from "../../hooks/useProperties.js";
import { useSaved } from "../../context/SavedContext.jsx";

export default function CustomerWishlist() {
  const { properties, loading } = useProperties();
  const { saved } = useSaved();
  const wishlisted = properties.filter((p) => saved.includes(p.id));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">My Wishlist</h1>
      {loading ? (
        <p className="text-charcoal/50">Loading…</p>
      ) : wishlisted.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Heart className="h-7 w-7" />
          </span>
          <h3 className="mt-4 font-semibold text-charcoal">
            No saved properties yet
          </h3>
          <Link to="/listings" className="btn-primary mt-5">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {wishlisted.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
