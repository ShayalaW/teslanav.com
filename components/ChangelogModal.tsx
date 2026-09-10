"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";

// Increment this version whenever you want to show the changelog again
const CHANGELOG_VERSION = "2";

interface ChangelogModalProps {
  isDarkMode: boolean;
}

export function ChangelogModal({ isDarkMode }: ChangelogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seenVersion = localStorage.getItem("teslanav-changelog-version");
      if (seenVersion !== CHANGELOG_VERSION) {
        setIsOpen(true);
        posthog.capture("changelog_shown", { version: CHANGELOG_VERSION });
      }
    }
  }, []);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    // Mark as seen
    if (typeof window !== "undefined") {
      localStorage.setItem("teslanav-changelog-version", CHANGELOG_VERSION);
    }
    setIsOpen(false);
    posthog.capture("changelog_dismissed", { version: CHANGELOG_VERSION });
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-6
        transition-opacity duration-300 ease-out
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 ease-out
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden
          ${isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}
          shadow-2xl flex flex-col
          transition-all duration-300 ease-out
          ${isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`
            flex items-center justify-between px-10 py-6 border-b
            ${isDarkMode ? "border-white/10" : "border-black/10"}
          `}
        >
          <h2 className="text-4xl font-semibold">What&apos;s New</h2>
          <button
            onClick={handleClose}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"}
              transition-colors
            `}
            aria-label="Close changelog"
          >
            <CloseIcon className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="space-y-10">
            {/* Sponsor Section */}
            <a
              href="https://buy.stripe.com/9B68wPg5wavU3Px3Tb7EQ0c"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                posthog.capture("sponsor_link_clicked", { source: "changelog" });
              }}
              className={`
                block p-6 rounded-2xl border-2 border-dashed transition-all
                ${isDarkMode 
                  ? "border-pink-500/50 bg-pink-500/10 hover:border-pink-400 hover:bg-pink-500/20" 
                  : "border-pink-400/50 bg-pink-50 hover:border-pink-500 hover:bg-pink-100"
                }
              `}
            >
              <div className="flex items-center gap-5">
                <span className="text-4xl">❤️</span>
                <div className="flex-1">
                  <div className="text-xl font-semibold mb-1">Help Keep Radar Free</div>
                  <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Radar will always be free and ad-free. Your support helps cover server costs and keeps development going!
                  </p>
                </div>
                <ExternalLinkIcon className={`w-6 h-6 flex-shrink-0 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              </div>
            </a>

            {/* Version Header */}
            <div>
              <h3 className="text-2xl font-semibold mb-1">Radar</h3>
              <p className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                September 2026
              </p>
            </div>

            {/* Changelog Items */}
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-medium mb-3">TeslaNav is now Radar</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  New name, new look. A clean black interface with a single red accent, designed to feel at home in your Tesla.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-medium mb-3">Report Cops &amp; Hazards</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Tap the red Report button and drop a hidden cop, visible cop, hazard, crash, or closure at your location. Every report shows up on the map for every driver instantly.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-medium mb-3">Reports Stay Honest</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Reports expire on their own. When you drive past one, answer &quot;Still there?&quot; to keep it alive - enough &quot;Gone&quot; votes and it disappears for everyone.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-medium mb-3">Why It Matters</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  The Waze data feed is currently blocked, so driver reports are the heartbeat of Radar. More drivers reporting means better coverage for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`
            px-10 py-6 border-t
            ${isDarkMode ? "border-white/10" : "border-black/10"}
          `}
        >
          <button
            onClick={handleClose}
            className={`
              w-full h-16 rounded-xl font-medium text-xl
              bg-[#e82127] text-white hover:bg-[#c11117]
              transition-all active:scale-[0.99]
            `}
          >
            Got it
          </button>
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

