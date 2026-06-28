import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Inbox,
  MessageSquare,
  UserCog,
  ExternalLink,
  LogOut,
} from "lucide-react";
import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/agent", label: "My Listings", icon: LayoutDashboard, end: true },
  { to: "/agent/new", label: "Add Listing", icon: PlusCircle },
  { to: "/agent/requests", label: "Requests", icon: Inbox },
  { to: "/agent/messages", label: "Messages", icon: MessageSquare },
  { to: "/agent/profile", label: "My Profile", icon: UserCog },
];

export default function AgentLayout() {
  const { signOut, user, agent } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/agent/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-cloud lg:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-charcoal/[0.06] bg-white lg:w-64 lg:border-b-0 lg:border-r">
        <div className="border-b border-charcoal/[0.06] p-5">
          <Logo />
          <span className="mt-2 inline-block rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
            Agent Portal
          </span>
        </div>
        <nav className="flex flex-1 flex-row gap-1 overflow-x-auto p-3 lg:flex-col">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-charcoal text-white"
                    : "text-charcoal/70 hover:bg-cloud hover:text-gold"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-charcoal/[0.06] p-3">
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-charcoal/70 transition hover:text-gold"
          >
            <ExternalLink className="h-4 w-4" />
            View Website
          </a>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-charcoal/70 transition hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 sm:p-8">
        {(agent?.name || user?.email) && (
          <p className="mb-6 text-sm text-charcoal/50">
            Signed in as{" "}
            <span className="font-medium text-charcoal">
              {agent?.name || user?.email}
            </span>
          </p>
        )}
        <Outlet />
      </main>
    </div>
  );
}
