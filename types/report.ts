export type ReportType =
  | "police_hidden"
  | "police_visible"
  | "police_other_side"
  | "vehicle_stopped"
  | "traffic_slow"
  | "traffic_standstill"
  | "traffic_heavy"
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
  "vehicle_stopped",
  "traffic_slow",
  "traffic_standstill",
  "traffic_heavy",
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
  vehicle_stopped: { label: "Car stopped on shoulder", shortLabel: "Car stopped" },
  traffic_slow: { label: "Slow traffic", shortLabel: "Slow" },
  traffic_standstill: { label: "Standstill traffic", shortLabel: "Standstill" },
  traffic_heavy: { label: "Heavy traffic", shortLabel: "Heavy" },
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
  icon: string;
}

export interface ReportPickerCategory {
  key: string;
  label: string;
  icon: string;
  type?: ReportType; // set when the category reports directly (no drill-down)
  children?: ReportPickerOption[];
}

export const REPORT_PICKER: ReportPickerCategory[] = [
  {
    key: "police",
    label: "Police",
    icon: "police",
    children: [
      { type: "police_visible", label: "Pulled over / visible", icon: "police" },
      { type: "police_hidden", label: "Hidden", icon: "eye-off" },
      { type: "police_other_side", label: "Other side of road", icon: "swap" },
    ],
  },
  {
    key: "traffic",
    label: "Traffic",
    icon: "traffic-light",
    children: [
      { type: "traffic_slow", label: "Slow", icon: "dot-amber" },
      { type: "traffic_heavy", label: "Heavy", icon: "dot-orange" },
      { type: "traffic_standstill", label: "Standstill", icon: "dot-red" },
    ],
  },
  { key: "construction", label: "Construction", icon: "cone", type: "hazard_construction" },
  { key: "vehicle_stopped", label: "Car on shoulder", icon: "car-stop", type: "vehicle_stopped" },
  {
    key: "hazard",
    label: "Hazard",
    icon: "hazard",
    children: [
      { type: "hazard_pothole", label: "Pothole", icon: "pothole" },
      { type: "hazard_object", label: "Object on road", icon: "box" },
      { type: "hazard_weather", label: "Weather", icon: "cloud-rain" },
    ],
  },
  { key: "accident", label: "Crash", icon: "crash", type: "accident" },
  { key: "road_closed", label: "Road closed", icon: "closure", type: "road_closed" },
];

export interface ReportVoteRequest {
  vote: "confirm" | "dismiss";
}

export interface CreateReportRequest {
  type: ReportType;
  lat: number;
  lng: number;
}
