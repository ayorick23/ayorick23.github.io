import type { ConstellationNodeId } from "../../data/constellation";

export interface TimelineEntry {
  period: string;
  role: string;
  org: string;
  description: string;
  tags: string[];
}

export interface CapabilityItem {
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
    placeholderBadge: string;
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
    description: string;
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
  };
  footer: {
    tagline: string;
    subtitle: string;
    rights: string;
  };
}
