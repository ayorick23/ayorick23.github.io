import type { TimelineEntry, UICopy } from "../content/i18n/types";
import type { Locale } from "./i18n";
import { certificates, type Certificate } from "../data/certificates";
import { educationMilestones, type EducationMilestone } from "../data/education";
import { formatYearMonth, monthIndex } from "./dates";

export function currentMonth(): number {
  const now = new Date();
  return now.getUTCFullYear() * 12 + now.getUTCMonth();
}

export interface Role extends TimelineEntry {
  from: number;
  to: number;
  isCurrent: boolean;
}

export function toRoles(entries: TimelineEntry[]): Role[] {
  const now = currentMonth();
  return entries.map((entry) => ({
    ...entry,
    from: monthIndex(entry.start),
    to: entry.end ? monthIndex(entry.end) : now,
    isCurrent: !entry.end,
  }));
}

export function formatDuration(months: number, units: UICopy["experience"]["chart"]["units"]): string {
  const total = Math.max(1, months);
  const years = Math.floor(total / 12);
  const rest = total % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? units.year : units.years}`);
  if (rest) parts.push(`${rest} ${rest === 1 ? units.month : units.months}`);
  return parts.join(" ");
}

export function formatRange(role: Role, locale: Locale, present: string): string {
  return `${formatYearMonth(role.start, locale)} – ${role.end ? formatYearMonth(role.end, locale) : present}`;
}

export const studyStart = monthIndex(educationMilestones[0].date);
export const studyEnd = monthIndex(educationMilestones[educationMilestones.length - 1].date);

/** Both programs start with the degree: the técnico is earned halfway through it. */
export interface StudyProgram {
  id: "technician" | "engineering";
  start: string;
  end: string;
  yearOnly?: boolean;
  from: number;
  to: number;
}

export const studyPrograms: StudyProgram[] = educationMilestones
  .filter((m): m is EducationMilestone & { id: StudyProgram["id"] } => m.id !== "start")
  .map((m) => ({
    id: m.id,
    start: educationMilestones[0].date,
    end: m.date,
    yearOnly: m.yearOnly,
    from: studyStart,
    to: monthIndex(m.date),
  }));

/** A role "owns" the months [from, to): the month a role ends is the month the next one starts. */
function inRole(month: number, role: Role): boolean {
  return month >= role.from && (role.isCurrent ? month <= role.to : month < role.to);
}

export function certificatesDuring(role: Role): Certificate[] {
  return certificates.filter((cert) => inRole(monthIndex(cert.issued), role));
}

export function milestonesDuring(role: Role): EducationMilestone[] {
  return educationMilestones.filter((m) => inRole(monthIndex(m.date), role));
}

export function studyOverlaps(role: Role): boolean {
  return role.to >= studyStart && role.from <= studyEnd;
}
