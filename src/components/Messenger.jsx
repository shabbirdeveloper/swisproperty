import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Send,
  ImagePlus,
  Phone,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import {
  getConversations,
  getThread,
  sendMessage,
  markThreadRead,
  uploadChatImage,
  callRoomFor,
} from "../services/messages.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import CallModal from "./CallModal.jsx";

/**
 * Reusable chat. Used by customers, agents and admins.
 * Open a specific conversation via ?to=<userId>&name=<name>.
 */
export default function Messenger() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(params.get("to") || null);
  const [activeName, setActiveName] = useState(params.get("name") || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(() => {
    getConversations()
      .then(setConversations)
      .catch(() => setConversations([]));
  }, []);

  useEffect(loadConversations, [loadConversations]);

  // Load + poll the active thread
  useEffect(() => {
    if (!activeId) return;
    let active = true;
    const load = () =>
      getThread(activeId)
        .then((m) => active && setMessages(m))
        .catch(() => {});
    load();
    markThreadRead(activeId).then(loadConversations);
    const t = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [activeId, loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = (id, name) => {
    setActiveId(id);
    setActiveName(name || "");
    setParams({ to: id, name: name || "" }, { replace: true });
  };

  const doSend = async (body, imageUrl) => {
    if (!activeId) return;
    setSending(true);
    try {
      const msg = await sendMessage({ receiverId: activeId, body, imageUrl });
      setMessages((m) => [...m, msg]);
      setText("");
      loadConversations();
    } catch (e) {
      toast.error(e.message || "Could not send.");
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) doSend(text.trim(), null);
  };

  const onImage = async (file) => {
    if (!file) return;
    try {
      const url = await uploadChatImage(file);
      await doSend(null, url);
    } catch (e) {
      toast.error(e.message || "Image upload failed.");
    }
  };

  const activeConv = conversations.find((c) => c.otherId === activeId);
  const headerName = activeConv?.name || activeName || "Conversation";

  return (
    <div className="grid h-[72vh] grid-cols-1 overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white md:grid-cols-[300px_1fr]">
      {/* Conversation list */}
      <div
        className={`border-r border-charcoal/[0.06] ${
          activeId ? "hidden md:block" : "block"
        }`}
      >
        <div className="border-b border-charcoal/[0.06] px-4 py-3">
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            Messages
          </h2>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(72vh - 53px)" }}>
          {conversations.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-charcoal/50">
              No conversations yet.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.otherId}
                onClick={() => openConversation(c.otherId, c.name)}
                className={`flex w-full items-center gap-3 border-b border-charcoal/[0.04] px-4 py-3 text-left transition hover:bg-cloud ${
                  activeId === c.otherId ? "bg-cloud" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold/10 text-sm font-semibold text-gold">
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (c.name || "U").slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-charcoal">
                      {c.name}
                    </span>
                    {c.unread > 0 && (
                      <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
                        {c.unread}
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-charcoal/50">
                    {c.lastMessage}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={`flex flex-col ${activeId ? "flex" : "hidden md:flex"}`}>
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-charcoal/40">
            <MessageSquare className="h-10 w-10" />
            <p className="mt-3 text-sm">Select a conversation</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-charcoal/[0.06] px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveId(null);
                    setParams({}, { replace: true });
                  }}
                  className="md:hidden"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5 text-charcoal/60" />
                </button>
                <span className="font-semibold text-charcoal">{headerName}</span>
              </div>
              <button
                onClick={() => setCallOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold transition hover:bg-gold hover:text-white"
                aria-label="Call"
              >
                <Phone className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-cloud px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      m.mine
                        ? "bg-charcoal text-white"
                        : "bg-white text-charcoal shadow-soft"
                    }`}
                  >
                    {m.image_url && (
                      <img
                        src={m.image_url}
                        alt=""
                        className="mb-1 max-h-60 rounded-lg object-cover"
                      />
                    )}
                    {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                    <span
                      className={`mt-1 block text-[10px] ${
                        m.mine ? "text-white/50" : "text-charcoal/40"
                      }`}
                    >
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-charcoal/[0.06] px-3 py-3"
            >
              <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-charcoal/10 text-charcoal transition hover:border-gold hover:text-gold">
                <ImagePlus className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onImage(e.target.files?.[0])}
                />
              </label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="field-luxe flex-1"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-white transition hover:bg-gold disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
      </div>

      <CallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        room={user && activeId ? callRoomFor(user.id, activeId) : "swissproperty"}
        displayName={profile?.fullName || "Guest"}
      />
    </div>
  );
}
