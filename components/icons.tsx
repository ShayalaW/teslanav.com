// Radar icon set - minimal stroke icons, currentColor, Tesla-clean geometry
import React from "react";

interface IconProps {
  className?: string;
}

function Svg({ className, children, filled }: IconProps & { children: React.ReactNode; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 13.2A8 8 0 1 1 10.8 4a6.5 6.5 0 0 0 9.2 9.2Z" />
    </Svg>
  );
}

export function AutoThemeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function SatelliteIcon({ className }: IconProps) {
  // Globe with an orbit arc and a satellite dot
  return (
    <Svg className={className}>
      <circle cx="11" cy="13" r="6.5" />
      <path d="M3 18.5C6 12.5 12 8.5 17.8 7.2" />
      <circle cx="18.5" cy="6" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function CubeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2.5l8 4.5v9l-8 4.5-8-4.5V7z" />
      <path d="M12 11.5l8-4.5M12 11.5L4 7M12 11.5v9" />
    </Svg>
  );
}

export function LayersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 12.5l9 5 9-5" />
    </Svg>
  );
}

export function TrafficLightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="8" y="2.5" width="8" height="19" rx="3" />
      <circle cx="12" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PoliceIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2.8l7 2.6v6.1c0 4.6-3 7.6-7 9.7-4-2.1-7-5.1-7-9.7V5.4z" />
      <path d="M12 8l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.3-2.3 1.3.5-2.5-1.8-1.7 2.5-.3z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 3l18 18" />
      <path d="M10.5 5.2A9.8 9.8 0 0 1 21 12a13 13 0 0 1-2.2 2.9M6 6.4A12.7 12.7 0 0 0 3 12a13 13 0 0 0 4.5 4.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
  );
}

export function SwapIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </Svg>
  );
}

export function ConeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 3h4l2.5 14.5h-9z" />
      <path d="M9.2 9h5.6M8.4 13.5h7.2" />
      <path d="M5 17.5h14l1.5 3.5h-17z" />
    </Svg>
  );
}

export function CarStopIcon({ className }: IconProps) {
  // Two vertical road lines with a car dot sitting on the shoulder line
  return (
    <Svg className={className}>
      <path d="M8 3v18" />
      <path d="M16.5 3v18" strokeDasharray="3.5 3" />
      <circle cx="8" cy="12" r="3.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function HazardIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.5L22 20H2z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PotholeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 9h7M14 9h7" />
      <path d="M10 9a2 2 0 0 0 4 0" />
      <path d="M3 15h5M16 15h5" />
      <path d="M8 15a4 4 0 0 0 8 0" />
    </Svg>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </Svg>
  );
}

export function CloudRainIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6.5 14a4 4 0 0 1 .6-7.9A5.5 5.5 0 0 1 17.8 8 3.5 3.5 0 0 1 17.5 15H7" />
      <path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5" />
    </Svg>
  );
}

export function CrashIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2.5l1.8 4.2 4.2-1.5-1.5 4.2 4.2 1.8-4.2 1.8 1.5 4.2-4.2-1.5L12 20l-1.8-4.3-4.2 1.5 1.5-4.2L3.3 11l4.2-1.8L6 5l4.2 1.5z" />
    </Svg>
  );
}

export function ClosureIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 6l12 12" />
    </Svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8 7l1.5-3h5L16 7" />
      <circle cx="12" cy="13.5" r="3.2" />
    </Svg>
  );
}

export function SpeakerIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </Svg>
  );
}

export function PulseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="9.5" opacity="0.45" />
    </Svg>
  );
}

// Report picker icon lookup - keyed by the icon field in REPORT_PICKER
export function ReportIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "police": return <PoliceIcon className={className} />;
    case "eye-off": return <EyeOffIcon className={className} />;
    case "swap": return <SwapIcon className={className} />;
    case "traffic-light": return <TrafficLightIcon className={className} />;
    case "cone": return <ConeIcon className={className} />;
    case "car-stop": return <CarStopIcon className={className} />;
    case "hazard": return <HazardIcon className={className} />;
    case "pothole": return <PotholeIcon className={className} />;
    case "box": return <BoxIcon className={className} />;
    case "cloud-rain": return <CloudRainIcon className={className} />;
    case "crash": return <CrashIcon className={className} />;
    case "closure": return <ClosureIcon className={className} />;
    case "dot-amber": return <span className={`inline-block rounded-full bg-amber-400 ${className ?? ""}`} style={{ width: "0.9em", height: "0.9em" }} />;
    case "dot-orange": return <span className={`inline-block rounded-full bg-orange-500 ${className ?? ""}`} style={{ width: "0.9em", height: "0.9em" }} />;
    case "dot-red": return <span className={`inline-block rounded-full bg-red-500 ${className ?? ""}`} style={{ width: "0.9em", height: "0.9em" }} />;
    default: return <HazardIcon className={className} />;
  }
}

// Approach banner icon by Waze alert type
export function ApproachAlertIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "ACCIDENT": return <CrashIcon className={className} />;
    case "ROAD_CLOSED": return <ClosureIcon className={className} />;
    case "JAM": return <TrafficLightIcon className={className} />;
    default: return <HazardIcon className={className} />;
  }
}
