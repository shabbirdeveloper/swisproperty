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
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";
import Logo from "./Logo.jsx";
import { useSaved } from "../context/SavedContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function MenuLink({ to, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal/80 transition hover:bg-cloud hover:text-gold"
    >
      <Icon className="h-4 w-4 text-gold" />
      {children}
    </Link>
  );
}

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/listings", label: "Listings" },
  { to: "/listings?status=For+Sale", label: "Buy & Sell" },
  { to: "/listings?status=For+Rent", label: "Rent" },
  { to: "/agents", label: "Agents" },
  { to: "/wishlist", label: "Wishlist" },
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
            to="/wishlist"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold"
            aria-label="Wishlist"
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
                      {role === "customer" && (
                        <>
                          <MenuLink to="/account" icon={UserCog}>My Account</MenuLink>
                          <MenuLink to="/account/wishlist" icon={Heart}>Wishlist</MenuLink>
                          <MenuLink to="/account/messages" icon={MessageSquare}>Messages</MenuLink>
                        </>
                      )}
                      {role === "agent" && (
                        <>
                          <MenuLink to="/agent" icon={LayoutDashboard}>Agent Dashboard</MenuLink>
                          <MenuLink to="/agent/messages" icon={MessageSquare}>Messages</MenuLink>
                          <MenuLink to="/agent/profile" icon={UserCog}>My Profile</MenuLink>
                        </>
                      )}
                      {role === "admin" && (
                        <MenuLink to="/admin" icon={LayoutDashboard}>Admin Dashboard</MenuLink>
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
                      <MenuLink to="/customer/login" icon={LogIn}>Sign In</MenuLink>
                      <MenuLink to="/customer/signup" icon={UserPlus}>Create Account</MenuLink>
                      <div className="my-1 border-t border-charcoal/[0.06]" />
                      <MenuLink to="/agent/login" icon={User}>Agent Portal</MenuLink>
                      <MenuLink to="/admin/login" icon={ShieldCheck}>Admin</MenuLink>
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
              {(() => {
                const cls =
                  "block rounded-lg px-2 py-3 text-base font-medium text-charcoal/80 transition hover:bg-cloud hover:text-gold";
                if (user && role === "customer")
                  return (
                    <>
                      <Link to="/account" className={cls}>My Account</Link>
                      <Link to="/account/wishlist" className={cls}>Wishlist</Link>
                      <Link to="/account/messages" className={cls}>Messages</Link>
                      <button onClick={handleSignOut} className={`${cls} w-full text-left hover:text-red-600`}>Sign Out</button>
                    </>
                  );
                if (user && role === "agent")
                  return (
                    <>
                      <Link to="/agent" className={cls}>Agent Dashboard</Link>
                      <Link to="/agent/messages" className={cls}>Messages</Link>
                      <Link to="/agent/profile" className={cls}>My Profile</Link>
                      <button onClick={handleSignOut} className={`${cls} w-full text-left hover:text-red-600`}>Sign Out</button>
                    </>
                  );
                if (user && role === "admin")
                  return (
                    <>
                      <Link to="/admin" className={cls}>Admin Dashboard</Link>
                      <button onClick={handleSignOut} className={`${cls} w-full text-left hover:text-red-600`}>Sign Out</button>
                    </>
                  );
                return (
                  <>
                    <Link to="/customer/login" className={cls}>Sign In</Link>
                    <Link to="/customer/signup" className={cls}>Create Account</Link>
                    <Link to="/agent/login" className={cls}>Agent Portal</Link>
                    <Link to="/admin/login" className={cls}>Admin</Link>
                  </>
                );
              })()}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
