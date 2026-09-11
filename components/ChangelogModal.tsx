"use client";

import { useState, useEffect, useCallback } from "react";
import posthog from "posthog-js";

// Bump this whenever a new release batch ships so the changelog shows again
const CHANGELOG_VERSION = "1.1.0";

interface ChangelogModalProps {
  isDarkMode: boolean;
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

export function ChangelogModal({ isDarkMode, externalOpen, onExternalClose }: ChangelogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seenVersion = localStorage.getItem("radar-changelog-version");
      if (seenVersion !== CHANGELOG_VERSION) {
        setIsOpen(true);
        posthog.capture("changelog_shown", { version: CHANGELOG_VERSION });
      }
    }
  }, []);

  const effectiveOpen = isOpen || !!externalOpen;

  // Handle animation states
  useEffect(() => {
    if (effectiveOpen) {
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
  }, [effectiveOpen]);

  const handleClose = useCallback(() => {
    // Mark as seen
    if (typeof window !== "undefined") {
      localStorage.setItem("radar-changelog-version", CHANGELOG_VERSION);
    }
    setIsOpen(false);
    onExternalClose?.();
    posthog.capture("changelog_dismissed", { version: CHANGELOG_VERSION });
  }, [onExternalClose]);

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
            {/* v1.1 */}
            <div>
              <h3 className="text-2xl font-semibold mb-1">Radar v1.1</h3>
              <p className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                September 2026
              </p>
              <div className="space-y-8 mt-6">
                <div>
                  <h4 className="text-xl font-medium mb-3">Voice Callouts</h4>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Radar speaks alerts out loud - &quot;Police reported in 0.4 miles&quot; - so your eyes stay on the road. Toggle it in Settings.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Speed Camera Alerts</h4>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Fixed speed and red-light cameras now trigger the same heads-up banner and chime as you approach them.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Hold to Re-Report</h4>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Press and hold the Report button to instantly drop another report of your last type - no menu, one motion.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Auto-Zoom</h4>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    The map zooms in when you slow down and out when you speed up, just like the built-in Tesla nav.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Awake &amp; Up to Date</h4>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Radar keeps the screen on while it&apos;s open, and updates itself the moment a new version ships - no refresh needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Version Header */}
            <div>
              <h3 className="text-2xl font-semibold mb-1">Radar v1.0</h3>
              <p className={`text-base ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                September 2026
              </p>
            </div>

            {/* Changelog Items */}
            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-medium mb-3">Meet Radar</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Real-time cop, hazard, and closure alerts from drivers on the road, right in your Tesla&apos;s browser. No app to install, nothing to sign up for.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-medium mb-3">Report in One Tap</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  See something? Tap the red Report button and it drops at your exact spot - hidden cop, visible cop, hazard, crash, or closure. Every driver with Radar open sees it instantly.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-medium mb-3">Alerts That Stay Fresh</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Stale reports fade away on their own. Drive past one and answer &quot;Still there?&quot; - a yes keeps it live, enough &quot;gone&quot; votes clear it for everyone.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-medium mb-3">Built for the Tesla Browser</h4>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Big touch targets, high contrast, and a map-first layout made for glancing at a stoplight, not reading.
                </p>
              </div>

              <p className={`pt-2 text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
                Credits: built on the{" "}
                <a href="https://teslanav.com" target="_blank" rel="noopener noreferrer" className="underline">
                  open-source TeslaNav project
                </a>.
              </p>
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
