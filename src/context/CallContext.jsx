import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

/**
 * Real 1:1 WebRTC calls (no third-party room).
 * Signaling runs over Supabase Realtime broadcast channels:
 *   each user listens on `signal:<theirId>`; to reach someone you send on
 *   their channel. STUN handles most NATs (a TURN server can be added later
 *   for fully restrictive mobile networks).
 */
const CallContext = createContext(null);

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function CallProvider({ children }) {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState("idle"); // idle | outgoing | incoming | connected
  const [peer, setPeer] = useState({ id: null, name: "" });
  const [withVideo, setWithVideo] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [ringing, setRinging] = useState(false); // callee's device is ringing

  const pcRef = useRef(null);
  const localRef = useRef(null);
  const peerIdRef = useRef(null);
  const sendChannelsRef = useRef({});
  const pendingIceRef = useRef([]);
  const ringRef = useRef(null);

  // --- ringtone (classic dual-tone ringback: ~1s ring, 2s silence) ---
  const startRing = useCallback(() => {
    if (ringRef.current) return;
    const ring = () => {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const now = ctx.currentTime;
        [440, 480].forEach((f) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = f;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.0001, now);
          g.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
          g.gain.setValueAtTime(0.09, now + 0.95);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
          o.start(now);
          o.stop(now + 1.0);
        });
        setTimeout(() => {
          try {
            ctx.close();
          } catch {
            /* ignore */
          }
        }, 1300);
      } catch {
        /* ignore */
      }
    };
    ring();
    ringRef.current = setInterval(ring, 3000);
  }, []);

  const stopRing = useCallback(() => {
    if (ringRef.current) {
      clearInterval(ringRef.current);
      ringRef.current = null;
    }
  }, []);

  // --- signaling helpers ---
  const getSendChannel = useCallback(
    (uid) =>
      new Promise((resolve) => {
        if (sendChannelsRef.current[uid])
          return resolve(sendChannelsRef.current[uid]);
        const ch = supabase.channel(`signal:${uid}`, {
          config: { broadcast: { self: false } },
        });
        ch.subscribe((s) => {
          if (s === "SUBSCRIBED") {
            sendChannelsRef.current[uid] = ch;
            resolve(ch);
          }
        });
      }),
    []
  );

  const signal = useCallback(
    async (toId, type, data = {}) => {
      if (!user) return;
      const ch = await getSendChannel(toId);
      ch.send({
        type: "broadcast",
        event: "sig",
        payload: {
          type,
          from: user.id,
          fromName: profile?.fullName || "Caller",
          ...data,
        },
      });
    },
    [user, profile, getSendChannel]
  );

  // --- media + peer connection ---
  const getMedia = async (video) => {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video });
    } catch (e) {
      if (video) {
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }
      throw e;
    }
  };

  const createPeer = useCallback(() => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pc.onicecandidate = (e) => {
      if (e.candidate && peerIdRef.current)
        signal(peerIdRef.current, "ice", { candidate: e.candidate });
    };
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        stopRing();
        setStatus("connected");
      }
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        // remote/network dropped
      }
    };
    pcRef.current = pc;
    return pc;
  }, [signal, stopRing]);

  const cleanup = useCallback(() => {
    stopRing();
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        /* ignore */
      }
      pcRef.current = null;
    }
    if (localRef.current) {
      localRef.current.getTracks().forEach((t) => t.stop());
      localRef.current = null;
    }
    // leave peer channels
    Object.values(sendChannelsRef.current).forEach((ch) =>
      supabase.removeChannel(ch)
    );
    sendChannelsRef.current = {};
    pendingIceRef.current = [];
    peerIdRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setMuted(false);
    setCamOff(false);
    setSpeakerOff(false);
    setRinging(false);
    setStatus("idle");
    setPeer({ id: null, name: "" });
  }, [stopRing]);

  // --- public actions ---
  const startCall = useCallback(
    async (targetId, targetName, video = true) => {
      if (!isSupabaseConfigured || !user) {
        toast.error("Calling needs you to be signed in.");
        return;
      }
      if (!targetId) return;
      try {
        setWithVideo(video);
        setRinging(false);
        setPeer({ id: targetId, name: targetName || "Contact" });
        peerIdRef.current = targetId;
        const stream = await getMedia(video);
        localRef.current = stream;
        setLocalStream(stream);
        const pc = createPeer();
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        setStatus("outgoing");
        startRing();
        await signal(targetId, "invite", { video });
      } catch (e) {
        toast.error(e.message || "Could not access camera/microphone.");
        cleanup();
      }
    },
    [user, signal, createPeer, startRing, cleanup, toast]
  );

  const accept = useCallback(async () => {
    try {
      stopRing();
      const stream = await getMedia(withVideo);
      localRef.current = stream;
      setLocalStream(stream);
      const pc = createPeer();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      setStatus("connected");
      await signal(peerIdRef.current, "accept");
    } catch (e) {
      toast.error(e.message || "Could not access camera/microphone.");
      if (peerIdRef.current) signal(peerIdRef.current, "decline");
      cleanup();
    }
  }, [withVideo, createPeer, signal, stopRing, cleanup, toast]);

  const decline = useCallback(() => {
    if (peerIdRef.current) signal(peerIdRef.current, "decline");
    cleanup();
  }, [signal, cleanup]);

  const hangup = useCallback(() => {
    if (peerIdRef.current) signal(peerIdRef.current, "hangup");
    cleanup();
  }, [signal, cleanup]);

  const cancel = useCallback(() => {
    if (peerIdRef.current) signal(peerIdRef.current, "cancel");
    cleanup();
  }, [signal, cleanup]);

  // --- incoming signal handler ---
  const handleSignal = useCallback(
    async (p) => {
      const pc = pcRef.current;
      switch (p.type) {
        case "invite": {
          if (status !== "idle") {
            signal(p.from, "decline");
            return;
          }
          peerIdRef.current = p.from;
          setPeer({ id: p.from, name: p.fromName });
          setWithVideo(!!p.video);
          setStatus("incoming");
          startRing();
          // let the caller know we're actually ringing
          signal(p.from, "ringing");
          break;
        }
        case "ringing": {
          if (status === "outgoing") setRinging(true);
          break;
        }
        case "cancel": {
          if (status === "incoming") cleanup();
          break;
        }
        case "accept": {
          // we are the caller; create + send offer
          if (!pc) return;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          signal(peerIdRef.current, "offer", { sdp: pc.localDescription });
          break;
        }
        case "decline": {
          toast.info("Call declined.");
          cleanup();
          break;
        }
        case "offer": {
          if (!pc) return;
          await pc.setRemoteDescription(p.sdp);
          for (const c of pendingIceRef.current) {
            try {
              await pc.addIceCandidate(c);
            } catch {
              /* ignore */
            }
          }
          pendingIceRef.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          signal(peerIdRef.current, "answer", { sdp: pc.localDescription });
          break;
        }
        case "answer": {
          if (!pc) return;
          await pc.setRemoteDescription(p.sdp);
          for (const c of pendingIceRef.current) {
            try {
              await pc.addIceCandidate(c);
            } catch {
              /* ignore */
            }
          }
          pendingIceRef.current = [];
          break;
        }
        case "ice": {
          if (pc && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(p.candidate);
            } catch {
              /* ignore */
            }
          } else {
            pendingIceRef.current.push(p.candidate);
          }
          break;
        }
        case "hangup": {
          cleanup();
          break;
        }
        default:
          break;
      }
    },
    [status, signal, startRing, cleanup, toast]
  );

  // Keep the latest handler in a ref so the realtime channel stays stable
  const handlerRef = useRef(handleSignal);
  useEffect(() => {
    handlerRef.current = handleSignal;
  }, [handleSignal]);

  // Subscribe to my own signal channel for incoming messages (once per user)
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    const ch = supabase.channel(`signal:${user.id}`, {
      config: { broadcast: { self: false } },
    });
    ch.on("broadcast", { event: "sig" }, ({ payload }) =>
      handlerRef.current?.(payload)
    );
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
  };
  const toggleCam = () => {
    const next = !camOff;
    setCamOff(next);
    localRef.current?.getVideoTracks().forEach((t) => (t.enabled = !next));
  };
  const toggleSpeaker = () => setSpeakerOff((v) => !v);

  return (
    <CallContext.Provider value={{ startCall, status }}>
      {children}
      <CallOverlay
        status={status}
        peer={peer}
        withVideo={withVideo}
        ringing={ringing}
        localStream={localStream}
        remoteStream={remoteStream}
        muted={muted}
        camOff={camOff}
        speakerOff={speakerOff}
        onAccept={accept}
        onDecline={decline}
        onCancel={cancel}
        onHangup={hangup}
        onToggleMute={toggleMute}
        onToggleCam={toggleCam}
        onToggleSpeaker={toggleSpeaker}
      />
    </CallContext.Provider>
  );
}

function CallOverlay({
  status,
  peer,
  withVideo,
  ringing,
  localStream,
  remoteStream,
  muted,
  camOff,
  speakerOff,
  onAccept,
  onDecline,
  onCancel,
  onHangup,
  onToggleMute,
  onToggleCam,
  onToggleSpeaker,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream, status]);
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = speakerOff;
    }
  }, [remoteStream, status, speakerOff]);

  if (status === "idle") return null;

  const Avatar = (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/20 text-3xl font-semibold text-gold">
      {(peer.name || "U").slice(0, 1).toUpperCase()}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-charcoal/90 p-4">
      <div className="relative flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-3xl bg-charcoal p-6 text-white">
        {/* Connected video */}
        {status === "connected" && withVideo ? (
          <div className="relative w-full overflow-hidden rounded-2xl bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-[60vh] w-full bg-black object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-3 right-3 h-32 w-24 rounded-xl border border-white/20 object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            {Avatar}
            <div className="text-center">
              <p className="text-xl font-semibold">{peer.name}</p>
              <p className="text-sm text-white/60">
                {status === "outgoing" && (ringing ? "Ringing…" : "Calling…")}
                {status === "incoming" && "Incoming call…"}
                {status === "connected" && "Connected"}
              </p>
            </div>
            {status === "connected" && (
              <>
                <audio ref={remoteVideoRef} autoPlay />
                <audio ref={localVideoRef} autoPlay muted />
              </>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          {status === "incoming" && (
            <>
              <button
                onClick={onDecline}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                aria-label="Decline"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
              <button
                onClick={onAccept}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600"
                aria-label="Accept"
              >
                <Phone className="h-6 w-6" />
              </button>
            </>
          )}

          {status === "outgoing" && (
            <button
              onClick={onCancel}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
              aria-label="Cancel"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          )}

          {status === "connected" && (
            <>
              <button
                onClick={onToggleMute}
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  muted ? "bg-white/20" : "bg-white/10"
                } text-white`}
                aria-label="Mute microphone"
              >
                {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <button
                onClick={onToggleSpeaker}
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  speakerOff ? "bg-white/20" : "bg-white/10"
                } text-white`}
                aria-label="Speaker"
              >
                {speakerOff ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              {withVideo && (
                <button
                  onClick={onToggleCam}
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    camOff ? "bg-white/20" : "bg-white/10"
                  } text-white`}
                  aria-label="Camera"
                >
                  {camOff ? (
                    <VideoOff className="h-5 w-5" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )}
                </button>
              )}
              <button
                onClick={onHangup}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                aria-label="End call"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) return { startCall: () => {}, status: "idle" };
  return ctx;
}
