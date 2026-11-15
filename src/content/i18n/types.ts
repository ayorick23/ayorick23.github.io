import type { ConstellationNodeId } from "../../data/constellation";
import type { ToolGroupKey } from "../../data/tools";
import type { Discipline } from "../../data/disciplines";
import type { CertificateCategory } from "../../data/certificates";
import type { EducationMilestoneId } from "../../data/education";

export interface TimelineEntry {
  period: string;
  /** YYYY-MM — drives the Gantt bars and the branch graph; `period` is only the label. */
  start: string;
  /** YYYY-MM; omitted while the role is current. */
  end?: string;
  role: string;
  org: string;
  /** ~3-line condensed version of `description`, shown in the home page timeline. */
  summary: string;
  description: string;
  tags: string[];
}

export interface CapabilityItem {
  id: Discipline;
  title: string;
  description: string;
}

export interface StatItem {
  icon: string;
  value: string;
  label: string;
}

export interface UICopy {
  meta: {
    titleSuffix: string;
    description: string;
  };
  nav: {
    work: string;
    tools: string;
    about: string;
    experience: string;
    skills: string;
    contact: string;
    cv: string;
    menu: string;
  };
  common: {
    backToHome: string;
    viewCaseStudy: string;
    viewOnGithub: string;
    liveDemo: string;
    coverPending: string;
    caseStudyLabel: string;
    linkPending: string;
    statusLabel: {
      placeholder: string;
      draft: string;
      published: string;
    };
  };
  theme: {
    toDark: string;
    toLight: string;
  };
  language: {
    switchTo: string;
  };
  hero: {
    kicker: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    constellation: Record<ConstellationNodeId, { label: string; description: string }>;
    constellationPanel: {
      kicker: string;
      tools: string;
      projects: string;
      close: string;
      /** Accessible name for the whole interactive sphere. */
      sphereLabel: string;
    };
  };
  work: {
    headingLead: string;
    headingAccent: string;
    description: string;
    viewAll: string;
    caseStudyCta: string;
  };
  tools: {
    /** "lead **strong** mid **tail**" — same light + bold formula as the other section titles. */
    heading: { lead: string; strong: string; mid: string; tail: string };
    filterLabel: string;
    filterAll: string;
    groups: Record<ToolGroupKey, { name: string; short: string; description: string }>;
    exploringLabel: string;
  };
  about: {
    /** Only on the dedicated page; the home section uses the nav label. */
    kicker: string;
    headingLead: string;
    headingAccent: string;
    previewParagraphs: [string, string];
    moreLink: string;
    photoCaption: string;
    stats: StatItem[];
    full: {
      behindDataHeading: string;
      behindDataParagraphs: string[];
      beyondHeading: string;
      beyondParagraphs: string[];
    };
    education: {
      kicker: string;
      headingLead: string;
      headingAccent: string;
      institution: string;
      degree: string;
      status: string;
      today: string;
      milestones: Record<EducationMilestoneId, { title: string; detail: string }>;
    };
    certificates: {
      kicker: string;
      headingLead: string;
      headingAccent: string;
      intro: string;
      hint: string;
      total: string;
      previous: string;
      next: string;
      /** Accessible name for the scrollable certificate stack. */
      stackLabel: string;
      categories: Record<CertificateCategory, string>;
      issuer: string;
      issued: string;
      hours: string;
      verify: string;
      viewPdf: string;
      close: string;
      /** "{part}" and "{total}" are replaced with the module numbers. */
      module: string;
      preparedFor: string;
      preparedBy: string;
      /** Keyed by certificate id (src/data/certificates.ts). */
      descriptions: Record<string, string>;
    };
  };
  experience: {
    /** Only on the dedicated page; the home section uses the nav label. */
    kicker: string;
    headingLead: string;
    headingAccent: string;
    headingTail: string;
    note: string;
    viewFull: string;
    timeline: TimelineEntry[];
    chart: {
      hint: string;
      workLane: string;
      studyLane: string;
      certLane: string;
      today: string;
      start: string;
      planned: string;
      finished: string;
      /** End of the year range on the current role's badge ("2026 – Actualidad"). */
      present: string;
      period: string;
      company: string;
      duration: string;
      institution: string;
      status: string;
      total: string;
      certificates: string;
      viewAllCertificates: string;
      /** `{n}` is replaced with the number of certificates not listed. */
      moreCertificates: string;
      units: { year: string; years: string; month: string; months: string };
    };
  };
  capabilities: {
    headingLead: string;
    headingAccent: string;
    items: CapabilityItem[];
  };
  contact: {
    headingLead: string;
    headingAccent: string;
    subtitle: string;
    description: string;
    cta: string;
  };
  projects: {
    /** Only on the dedicated /projects page; the home section uses the nav label. */
    kicker: string;
    headingLead: string;
    headingAccent: string;
    subtitle: string;
    note: string;
    backLabel: string;
    otherLabel: string;
    technologiesLabel: string;
    softwareDivider: {
      label: string;
      note: string;
    };
    filter: {
      label: string;
      discipline: string;
      status: string;
      technologies: string;
      allDisciplines: string;
      allStatuses: string;
      clear: string;
      /** `{n}` is replaced with the number of visible projects. */
      resultOne: string;
      resultMany: string;
      empty: string;
      techPlaceholder: string;
      /** `{n}` is replaced with the number of selected technologies. */
      techSelected: string;
      techOther: string;
      techClear: string;
      techRemove: string;
    };
    lightbox: {
      close: string;
      previous: string;
      next: string;
    };
  };
  footer: {
    tagline: string;
    subtitle: string;
    rights: string;
    backToTop: string;
  };
}
