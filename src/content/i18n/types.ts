import type { ConstellationNodeId } from "../../data/constellation";
import type { ToolGroupKey } from "../../data/tools";
import type { Discipline } from "../../data/disciplines";

export interface TimelineEntry {
  period: string;
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
    scrollHint: string;
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
    kicker: string;
    headingLead: string;
    headingAccent: string;
    description: string;
    viewAll: string;
    caseStudyCta: string;
  };
  tools: {
    kicker: string;
    headingLead: string;
    headingAccent: string;
    filterLabel: string;
    filterAll: string;
    groups: Record<ToolGroupKey, { name: string; short: string; description: string }>;
    exploringLabel: string;
  };
  about: {
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
  };
  experience: {
    kicker: string;
    headingLead: string;
    headingAccent: string;
    headingTail: string;
    note: string;
    viewFull: string;
    timeline: TimelineEntry[];
  };
  capabilities: {
    kicker: string;
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
    headingLead: string;
    headingAccent: string;
    subtitle: string;
    note: string;
    backLabel: string;
    otherLabel: string;
    technologiesLabel: string;
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
