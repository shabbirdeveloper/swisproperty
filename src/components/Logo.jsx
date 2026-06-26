import { Link } from "react-router-dom";

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          light ? "bg-white" : "bg-charcoal"
        } transition-transform duration-300 group-hover:scale-105`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 3L20 9.5V20H15V13H9V20H4V9.5L12 3Z"
            fill="#B8924A"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-lg font-semibold tracking-tight ${
            light ? "text-white" : "text-charcoal"
          }`}
        >
          Swiss<span className="text-gold">Property</span>
        </span>
        <span
          className={`mt-0.5 text-[10px] font-medium uppercase tracking-luxe ${
            light ? "text-white/60" : "text-charcoal/50"
          }`}
        >
          Premium Real Estate
        </span>
      </span>
    </Link>
  );
}
