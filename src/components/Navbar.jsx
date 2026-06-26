import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  UserPlus,
  UserCog,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import Logo from "./Logo.jsx";
import { useSaved } from "../context/SavedContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/listings", label: "Listings" },
  { to: "/listings?status=For+Sale", label: "Buy" },
  { to: "/listings?status=For+Rent", label: "Rent" },
  { to: "/agents", label: "Agents" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useSaved();
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setAcctOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAcctOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-charcoal/[0.06] bg-white/90 backdrop-blur-md shadow-soft"
          : "bg-white/70 backdrop-blur-sm"
      }`}
    >
      <nav className="container-luxe flex h-20 items-center justify-between">
        <Logo />

        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    isActive && link.end
                      ? "text-charcoal"
                      : "text-charcoal/70 hover:text-gold"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/listings?saved=1"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold"
            aria-label="Saved properties"
          >
            <Heart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {/* Account / Sign in */}
          <div className="relative">
            <button
              onClick={() => setAcctOpen((v) => !v)}
              className="flex h-11 items-center gap-2 rounded-full border border-charcoal/10 px-3 text-charcoal transition hover:border-gold hover:text-gold"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
              <span className="hidden text-sm font-medium sm:inline">
                {user ? "Account" : "Sign In"}
              </span>
            </button>
            {acctOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setAcctOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white py-1.5 shadow-lift">
                  {user ? (
                    <>
                      <Link
                        to={role === "admin" ? "/admin" : "/agent"}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gold" />
                        {role === "admin" ? "Admin Dashboard" : "Agent Dashboard"}
                      </Link>
                      {role === "agent" && (
                        <Link
                          to="/agent/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                        >
                          <UserCog className="h-4 w-4 text-gold" />
                          My Profile
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 transition hover:bg-cloud hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/agent/login"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                      >
                        <LogIn className="h-4 w-4 text-gold" />
                        Agent Sign In
                      </Link>
                      <Link
                        to="/agent/signup"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                      >
                        <UserPlus className="h-4 w-4 text-gold" />
                        Register as Agent
                      </Link>
                      <div className="my-1 border-t border-charcoal/[0.06]" />
                      <Link
                        to="/admin/login"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/60 transition hover:bg-cloud hover:text-gold"
                      >
                        <ShieldCheck className="h-4 w-4 text-charcoal/40" />
                        Admin Login
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 text-charcoal lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-charcoal/[0.06] bg-white lg:hidden">
          <ul className="container-luxe flex flex-col py-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="block rounded-lg px-2 py-3 text-sm font-semibold uppercase tracking-wider text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-charcoal/[0.06] pt-3">
              {user ? (
                <>
                  <Link
                    to={role === "admin" ? "/admin" : "/agent"}
                    className="block rounded-lg px-2 py-3 text-base font-medium text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                  >
                    {role === "admin" ? "Admin Dashboard" : "Agent Dashboard"}
                  </Link>
                  {role === "agent" && (
                    <Link
                      to="/agent/profile"
                      className="block rounded-lg px-2 py-3 text-base font-medium text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                    >
                      My Profile
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full rounded-lg px-2 py-3 text-left text-base font-medium text-charcoal/80 transition hover:bg-cloud hover:text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/agent/login"
                    className="block rounded-lg px-2 py-3 text-base font-medium text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                  >
                    Agent Sign In
                  </Link>
                  <Link
                    to="/agent/signup"
                    className="block rounded-lg px-2 py-3 text-base font-medium text-charcoal/80 transition hover:bg-cloud hover:text-gold"
                  >
                    Register as Agent
                  </Link>
                  <Link
                    to="/admin/login"
                    className="block rounded-lg px-2 py-3 text-base font-medium text-charcoal/50 transition hover:bg-cloud hover:text-gold"
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
