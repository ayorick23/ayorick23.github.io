export type EducationMilestoneId = "start" | "technician" | "engineering";

export interface EducationMilestone {
  id: EducationMilestoneId;
  /** YYYY-MM */
  date: string;
  /** Show only the year: the exact month of the engineering degree isn't set yet. */
  yearOnly?: boolean;
}

// The progress bar runs from the first milestone to the last one.
export const educationMilestones: EducationMilestone[] = [
  { id: "start", date: "2025-01" },
  { id: "technician", date: "2026-12" },
  { id: "engineering", date: "2028-12", yearOnly: true },
];
