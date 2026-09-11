import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { PROJECT_SHUTDOWN_ENABLED } from "@/lib/shutdown";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = "https://radar-tesla.vercel.app";
const siteName = "Radar";
const siteDescription = "Radar brings real-time, crowd-sourced police alerts, speed camera warnings, accident reports, and road hazard notifications to your Tesla's browser. Built by drivers, for drivers.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Radar - Cop, Hazard & Speed Camera Alerts for Tesla",
    template: "%s | Radar",
  },
  description: siteDescription,
  keywords: [
    // Primary keywords
    "Waze for Tesla",
    "Tesla Waze alerts",
    "Tesla police alerts",
    "Tesla speed camera alerts",
    "Tesla navigation",
    "Waze alternative Tesla",
    // Feature keywords
    "Tesla traffic alerts",
    "Tesla road hazard warnings",
    "Tesla accident alerts",
    "real-time Tesla alerts",
    "Tesla browser navigation",
    "Tesla in-car browser app",
    // Long-tail keywords
    "how to get Waze on Tesla",
    "Waze integration Tesla",
    "Tesla Model 3 Waze alerts",
    "Tesla Model Y police alerts",
    "Tesla Model S navigation alerts",
    "Tesla Model X speed cameras",
    "free Waze alerts for Tesla",
    "Tesla cop alerts",
    "Tesla radar detector alternative",
    "crowd-sourced Tesla alerts",
    // Brand variations
    "Radar",
    "Radar Tesla app",
    "Tesla navigation app",
    "crowd-sourced cop alerts Tesla",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Radar",
  },
  formatDetection: {
    telephone: false,
  },
  // Open Graph for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "Radar - Cop, Hazard & Speed Camera Alerts for Tesla",
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Radar - crowd-sourced driving alerts for your Tesla",
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Radar - Cop, Hazard & Speed Camera Alerts for Tesla",
    description: "Real-time crowd-sourced police alerts, speed cameras, and road hazards on your Tesla's browser.",
    images: ["/twitter-image.png"],
  },
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Verification (add your own IDs when you have them)
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  //   bing: "your-bing-verification-code",
  // },
  // Alternate languages (if you plan to support multiple languages)
  alternates: {
    canonical: siteUrl,
  },
  // Category for app stores
  category: "navigation",
  // Additional metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Radar",
    "apple-mobile-web-app-title": "Radar",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// JSON-LD structured data for rich search results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#webapp`,
      name: "Radar",
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "NavigationApplication",
      operatingSystem: "Web Browser, Tesla Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Real-time police alerts",
        "Speed camera warnings",
        "Accident reports",
        "Road hazard notifications",
        "Traffic conditions",
        "Turn-by-turn navigation",
        "Tesla browser optimized",
        "Dark mode support",
        "Crowd-sourced alerts",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Radar",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/radar-icon.png`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Radar",
      description: siteDescription,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Can I use Waze on my Tesla?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tesla doesn't officially support Waze, but Radar brings crowd-sourced alerts directly to your Tesla's browser. You get real-time police alerts, speed cameras, accidents, and road hazards reported by other drivers, optimized for Tesla.",
          },
        },
        {
          "@type": "Question",
          name: "How do I get police alerts on my Tesla?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Simply open Radar in your Tesla's browser. Radar shows real-time, crowd-sourced police alerts on your map, with customizable audio and visual notifications when you're approaching a reported location.",
          },
        },
        {
          "@type": "Question",
          name: "Is Radar free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Radar is completely free to use. Just open it in your Tesla's browser and start driving with real-time alerts.",
          },
        },
        {
          "@type": "Question",
          name: "Does Radar work with all Tesla models?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Radar works with any Tesla that has the in-car browser, including Model 3, Model Y, Model S, and Model X. It's also available on desktop browsers for trip planning.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClassName = PROJECT_SHUTDOWN_ENABLED
    ? `${geistSans.variable} antialiased bg-neutral-950 text-white`
    : `${geistSans.variable} antialiased overflow-hidden`;

  const bodyStyle = PROJECT_SHUTDOWN_ENABLED
    ? {
        margin: 0,
        minHeight: "100vh",
      }
    : {
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        position: "fixed" as const,
        inset: 0,
      };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {!PROJECT_SHUTDOWN_ENABLED && (
          <>
            {/* JSON-LD Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {process.env.NODE_ENV === "development" && (
              <Script
                src="//unpkg.com/react-grab/dist/index.global.js"
                crossOrigin="anonymous"
                strategy="beforeInteractive"
              />
            )}
            <Script
              data-website-id="dfid_RO5g2rWwS6cGfyTS7wGGW"
              data-domain="radar-tesla.vercel.app"
              src="/js/script.js"
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body className={bodyClassName} style={bodyStyle}>
        {/* Recover from stale-chunk errors after a redeploy: force one hard reload */}
        <Script id="chunk-error-recovery" strategy="beforeInteractive">{`
          (function () {
            function isChunkError(msg) {
              return typeof msg === "string" && (
                msg.indexOf("ChunkLoadError") !== -1 ||
                msg.indexOf("Loading chunk") !== -1 ||
                msg.indexOf("Failed to fetch dynamically imported module") !== -1
              );
            }
            function recover() {
              try {
                if (sessionStorage.getItem("radar-chunk-reload")) return;
                sessionStorage.setItem("radar-chunk-reload", "1");
              } catch (e) {}
              window.location.reload();
            }
            window.addEventListener("error", function (e) {
              if (isChunkError(e && e.message)) recover();
            }, true);
            window.addEventListener("unhandledrejection", function (e) {
              var r = e && e.reason;
              if (isChunkError(r && (r.message || r.name))) recover();
            });
          })();
        `}</Script>
        {PROJECT_SHUTDOWN_ENABLED ? children : <Providers>{children}</Providers>}
      </body>
    </html>
  );
}
