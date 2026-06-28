import { X } from "lucide-react";

/**
 * Real in-app voice/video call via embedded Jitsi Meet (free, no API key).
 * Both participants open the same deterministic room name and connect.
 */
export default function CallModal({ open, onClose, room, displayName }) {
  if (!open) return null;

  const src =
    `https://meet.jit.si/${room}` +
    `#userInfo.displayName=%22${encodeURIComponent(displayName || "Guest")}%22` +
    `&config.prejoinPageEnabled=false&config.startWithVideoMuted=false`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-charcoal/80 p-3 sm:p-6">
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-charcoal shadow-lift">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-white">
            SwissProperty Call
          </span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold"
            aria-label="End call"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe
          title="Call"
          src={src}
          allow="camera; microphone; fullscreen; display-capture; autoplay; speaker"
          className="h-[70vh] w-full border-0"
        />
      </div>
    </div>
  );
}
