"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";
import { APP_VERSION } from "@/lib/version";

// Web3Forms relays submissions to the feedback inbox. The access key is
// public by design (their model: static sites embed it in forms) - it can
// only send mail to the registered inbox, nothing else. Honeypot + their
// spam filtering handle abuse.
const WEB3FORMS_ACCESS_KEY = "d692c615-1f14-4134-a5f9-c8f30df90193";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function FeedbackModal({ isOpen, onClose, isDarkMode }: FeedbackModalProps) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      setState("idle");
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (state === "sending") return;
    setMessage("");
    setContact("");
    setState("idle");
    onClose();
  }, [onClose, state]);

  const handleSubmit = async () => {
    if (!message.trim() || state === "sending") return;
    // Honeypot filled = bot; silently pretend success
    if (honeypot) {
      setState("sent");
      return;
    }
    setState("sending");
    try {
      // FormData = CORS "simple request" (no preflight). A JSON content-type
      // triggers an OPTIONS preflight that Web3Forms' edge answers with 403.
      const form = new FormData();
      form.append("access_key", WEB3FORMS_ACCESS_KEY);
      form.append("subject", `[Radar feedback] v${APP_VERSION}`);
      form.append("from_name", "Radar App");
      form.append("message", message.trim());
      form.append("contact", contact.trim() || "(none given)");
      form.append("app_version", APP_VERSION);
      form.append("user_agent", navigator.userAgent);
      form.append("page_url", window.location.href);
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "send failed");
      setState("sent");
      posthog.capture("feedback_sent");
    } catch (err) {
      console.error("Feedback send error:", err);
      setState("error");
      posthog.capture("feedback_failed");
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6
        transition-opacity duration-300 ease-out
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`
          relative w-full max-w-lg rounded-2xl overflow-hidden
          ${isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}
          shadow-2xl
          transition-all duration-300 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 translate-y-4"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? "border-white/10" : "border-black/10"}`}>
          <h2 className="text-xl font-semibold">Report a Bug / Feature Idea</h2>
          <button
            onClick={handleClose}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"} transition-colors`}
            aria-label="Close feedback"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="px-5 py-5">
          {state === "sent" ? (
            <div className="py-6 text-center">
              <div className="text-2xl mb-2">Thanks!</div>
              <p className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Your feedback was sent. It helps make Radar better.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-3 rounded-xl bg-blue-500 text-white text-base font-medium hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's broken, or what would you love to see?"
                rows={5}
                maxLength={2000}
                className={`
                  w-full rounded-xl px-4 py-3 text-base resize-none outline-none
                  ${isDarkMode ? "bg-white/10 text-white placeholder-gray-500" : "bg-black/5 text-black placeholder-gray-400"}
                  focus:ring-2 focus:ring-blue-500
                `}
              />
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email (optional - only if you want a reply)"
                maxLength={200}
                className={`
                  w-full mt-3 rounded-xl px-4 py-3 text-base outline-none
                  ${isDarkMode ? "bg-white/10 text-white placeholder-gray-500" : "bg-black/5 text-black placeholder-gray-400"}
                  focus:ring-2 focus:ring-blue-500
                `}
              />
              {/* Honeypot: hidden from humans, bots fill it */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 pointer-events-none h-0 w-0"
                name="botcheck"
              />
              <p className={`text-xs mt-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                App version and browser info are included automatically. No other personal info is collected.
              </p>
              {state === "error" && (
                <p className="text-sm mt-2 text-red-500">
                  Couldn&apos;t send - check your connection and try again.
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || state === "sending"}
                className={`
                  w-full mt-4 py-3.5 rounded-xl text-base font-medium transition-colors
                  ${!message.trim() || state === "sending"
                    ? "bg-gray-400/40 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"}
                `}
              >
                {state === "sending" ? "Sending..." : "Send Feedback"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
