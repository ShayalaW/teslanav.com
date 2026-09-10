export type ReportType =
  | "police_hidden"
  | "police_visible"
  | "hazard"
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

export const REPORT_TYPES: ReportType[] = [
  "police_hidden",
  "police_visible",
  "hazard",
  "accident",
  "road_closed",
];

export const REPORT_TYPE_META: Record<ReportType, { label: string; shortLabel: string }> = {
  police_hidden: { label: "Hidden cop", shortLabel: "Hidden" },
  police_visible: { label: "Cop (pulled over / visible)", shortLabel: "Cop" },
  hazard: { label: "Hazard", shortLabel: "Hazard" },
  accident: { label: "Accident", shortLabel: "Crash" },
  road_closed: { label: "Road closed", shortLabel: "Closure" },
};

export interface ReportVoteRequest {
  vote: "confirm" | "dismiss";
}

export interface CreateReportRequest {
  type: ReportType;
  lat: number;
  lng: number;
}
