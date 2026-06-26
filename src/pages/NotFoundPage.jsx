import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="container-luxe flex flex-col items-center justify-center py-32 text-center">
      <p className="font-serif text-7xl font-semibold text-gold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-charcoal">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-charcoal/60">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
