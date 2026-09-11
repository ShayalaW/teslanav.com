export type ReportType =
  | "police_hidden"
  | "police_visible"
  | "police_other_side"
  | "hazard"
  | "hazard_pothole"
  | "hazard_object"
  | "hazard_construction"
  | "hazard_weather"
  | "accident"
  | "road_closed";

export interface UserReport {
  id: string;
  type: ReportType;
  lat: number;
  lng: number;
  createdAt: number;
  expiresAt: number;
  confirms: number;
  dismisses: number;
}

// All accepted types (includes legacy "hazard" for reports already on the map)
export const REPORT_TYPES: ReportType[] = [
  "police_hidden",
  "police_visible",
  "police_other_side",
  "hazard",
  "hazard_pothole",
  "hazard_object",
  "hazard_construction",
  "hazard_weather",
  "accident",
  "road_closed",
];

export const REPORT_TYPE_META: Record<ReportType, { label: string; shortLabel: string }> = {
  police_hidden: { label: "Hidden cop", shortLabel: "Hidden" },
  police_visible: { label: "Cop (pulled over / visible)", shortLabel: "Cop" },
  police_other_side: { label: "Cop (other side)", shortLabel: "Other side" },
  hazard: { label: "Hazard", shortLabel: "Hazard" },
  hazard_pothole: { label: "Pothole", shortLabel: "Pothole" },
  hazard_object: { label: "Object on road", shortLabel: "Object" },
  hazard_construction: { label: "Construction", shortLabel: "Construction" },
  hazard_weather: { label: "Weather hazard", shortLabel: "Weather" },
  accident: { label: "Accident", shortLabel: "Crash" },
  road_closed: { label: "Road closed", shortLabel: "Closure" },
};

// Two-level report picker: top categories, some drill into subtypes
export interface ReportPickerOption {
  type: ReportType;
  label: string;
  emoji: string;
}

export interface ReportPickerCategory {
  key: string;
  label: string;
  emoji: string;
  type?: ReportType; // set when the category reports directly (no drill-down)
  children?: ReportPickerOption[];
}

export const REPORT_PICKER: ReportPickerCategory[] = [
  {
    key: "police",
    label: "Police",
    emoji: "🚔",
    children: [
      { type: "police_visible", label: "Pulled over / visible", emoji: "🚔" },
      { type: "police_hidden", label: "Hidden", emoji: "🕵️" },
      { type: "police_other_side", label: "Other side of road", emoji: "↔️" },
    ],
  },
  {
    key: "hazard",
    label: "Hazard",
    emoji: "⚠️",
    children: [
      { type: "hazard_pothole", label: "Pothole", emoji: "🕳️" },
      { type: "hazard_object", label: "Object on road", emoji: "📦" },
      { type: "hazard_construction", label: "Construction", emoji: "🚧" },
      { type: "hazard_weather", label: "Weather", emoji: "🌧️" },
    ],
  },
  { key: "accident", label: "Crash", emoji: "💥", type: "accident" },
  { key: "road_closed", label: "Road closed", emoji: "⛔", type: "road_closed" },
];

export interface ReportVoteRequest {
  vote: "confirm" | "dismiss";
}

export interface CreateReportRequest {
  type: ReportType;
  lat: number;
  lng: number;
}
