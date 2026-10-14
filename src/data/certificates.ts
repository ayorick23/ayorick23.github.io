import type { Locale } from "../lib/i18n";

export type CertificateCategory = "certification" | "specialization" | "course" | "diploma";

export const certificateCategories: CertificateCategory[] = [
  "certification",
  "specialization",
  "course",
  "diploma",
];

export interface Certificate {
  /** Also the file name of the PDF in public/certificates/ and the preview in src/assets/certificates/. */
  id: string;
  /** `es` is the title exactly as printed on the certificate; `en` its translation for the English site. */
  title: Record<Locale, string>;
  issuer: string;
  category: CertificateCategory;
  /** YYYY-MM */
  issued: string;
  hours?: number;
  verifyUrl?: string;
  /** Module position inside a multi-certificate program (FEPADE's Python specialization). */
  series?: { name: Record<Locale, string>; part: number; total: number };
  /** Links a preparation course and the certification it prepared for. */
  related?: { id: string; kind: "preparedFor" | "preparedBy" };
}

const fepadeSeries = { es: "Especialización en Programación con Python", en: "Python Programming Specialization" };

// Newest first: the top of the stack is the most recent certificate.
export const certificates: Certificate[] = [
  {
    id: "platzi-fundamentos-ingenieria-datos",
    title: { es: "Fundamentos de Ingeniería de Datos", en: "Data Engineering Fundamentals" },
    issuer: "Platzi",
    category: "course",
    issued: "2026-10",
    hours: 10,
    verifyUrl: "https://platzi.com/p/mayorickhenry/curso/5514-fundamentos-ingenieria-datos/diploma/detalle/",
  },
  {
    id: "platzi-docker-fundamentos",
    title: { es: "Docker: Fundamentos", en: "Docker: Fundamentals" },
    issuer: "Platzi",
    category: "course",
    issued: "2026-10",
    hours: 14,
    verifyUrl: "https://platzi.com/p/mayorickhenry/curso/8781-docker-fundamentos/diploma/detalle/",
  },
  {
    id: "platzi-python-ciencia-datos",
    title: { es: "Python para Ciencia de Datos", en: "Python for Data Science" },
    issuer: "Platzi",
    category: "course",
    issued: "2026-10",
    hours: 13,
    verifyUrl: "https://platzi.com/p/mayorickhenry/curso/10365-python-data-science/diploma/detalle/",
  },
  {
    id: "platzi-regresion-lineal",
    title: { es: "Regresión Lineal con Python y scikit-learn", en: "Linear Regression with Python and scikit-learn" },
    issuer: "Platzi",
    category: "course",
    issued: "2026-07",
    hours: 12,
    verifyUrl: "https://platzi.com/p/mayorickhenry/curso/2739-regresion-lineal/diploma/detalle/",
  },
  {
    id: "cisco-data-analytics-essentials",
    title: { es: "Data Analytics Essentials", en: "Data Analytics Essentials" },
    issuer: "Cisco Networking Academy",
    category: "course",
    issued: "2026-05",
    verifyUrl: "https://www.credly.com/badges/f861c9d7-9c68-474e-8010-0f9742b98350",
  },
  {
    id: "uees-fundamentos-analisis-datos",
    title: { es: "Fundamentos de Análisis de Datos", en: "Data Analysis Fundamentals" },
    issuer: "Universidad Evangélica de El Salvador · Cisco Networking Academy",
    category: "course",
    issued: "2026-05",
  },
  {
    id: "platzi-power-bi-avanzado",
    title: { es: "Power BI Avanzado", en: "Advanced Power BI" },
    issuer: "Platzi",
    category: "course",
    issued: "2026-01",
    hours: 20,
    verifyUrl: "https://platzi.com/p/mayorickhenry/curso/11820-powerbi-avanzado/diploma/detalle/",
  },
  {
    id: "platzi-people-analytics",
    title: { es: "People Analytics para RRHH", en: "People Analytics for HR" },
    issuer: "Platzi",
    category: "course",
    issued: "2025-12",
    hours: 12,
    verifyUrl: "https://platzi.com/p/mayorickhenry/curso/11460-people-analytics-excel/diploma/detalle/",
  },
  {
    id: "udemy-docker",
    title: { es: "Ultimate Docker: guía de cero hasta despliegues", en: "Ultimate Docker: From Zero to Deployments" },
    issuer: "Udemy",
    category: "course",
    issued: "2025-08",
    hours: 5.5,
    verifyUrl: "https://ude.my/UC-6421ce47-a9f8-41e0-82ee-ce355e77d58a",
  },
  {
    id: "udemy-claude",
    title: { es: "IA Generativa Claude. La competencia de ChatGPT. ¿Es Mejor?", en: "Generative AI with Claude: ChatGPT's Competitor. Is It Better?" },
    issuer: "Udemy",
    category: "course",
    issued: "2025-08",
    hours: 3,
    verifyUrl: "https://ude.my/UC-118eb29d-856e-46b7-aff6-0150ce9cc0f0",
  },
  {
    id: "udemy-git-github",
    title: { es: "Git y GitHub desde Cero a Experto", en: "Git and GitHub from Zero to Expert" },
    issuer: "Udemy",
    category: "course",
    issued: "2025-06",
    hours: 16,
    verifyUrl: "https://ude.my/UC-2cf0d942-17f6-4a47-b8f5-e705166f1452",
  },
  {
    id: "fepade-python-mod-4",
    title: { es: "Desarrollo Avanzado en Python", en: "Advanced Python Development" },
    issuer: "FEPADE",
    category: "specialization",
    issued: "2024-12",
    series: { name: fepadeSeries, part: 4, total: 4 },
  },
  {
    id: "fepade-python-mod-3",
    title: { es: "Librerías y Manipulación de Datos", en: "Libraries and Data Manipulation" },
    issuer: "FEPADE",
    category: "specialization",
    issued: "2024-11",
    series: { name: fepadeSeries, part: 3, total: 4 },
  },
  {
    id: "fepade-python-mod-2",
    title: { es: "Programación Orientada a Objetos en Python", en: "Object-Oriented Programming in Python" },
    issuer: "FEPADE",
    category: "specialization",
    issued: "2024-10",
    series: { name: fepadeSeries, part: 2, total: 4 },
  },
  {
    id: "fepade-python-mod-1",
    title: { es: "Fundamentos de Python", en: "Python Fundamentals" },
    issuer: "FEPADE",
    category: "specialization",
    issued: "2024-09",
    series: { name: fepadeSeries, part: 1, total: 4 },
  },
  {
    id: "udemy-power-bi",
    title: { es: "Power BI - Análisis de Datos e Inteligencia de Negocios", en: "Power BI - Data Analysis and Business Intelligence" },
    issuer: "Udemy",
    category: "course",
    issued: "2024-08",
    hours: 30,
    verifyUrl: "https://ude.my/UC-be3c74c1-f7b8-4cad-b970-10ffbc4695be",
  },
  {
    id: "certiport-it-specialist-databases",
    title: { es: "Information Technology Specialist – Databases", en: "Information Technology Specialist – Databases" },
    issuer: "Certiport · Pearson VUE",
    category: "certification",
    issued: "2024-07",
    verifyUrl: "https://www.credly.com/badges/48ee143c-e614-438f-b47c-cf7065e4fe31",
    related: { id: "academia-europea-bases-de-datos", kind: "preparedBy" },
  },
  {
    id: "academia-europea-bases-de-datos",
    title: { es: "Bases de Datos", en: "Databases" },
    issuer: "Academia Europea · Professional Skills Development Program",
    category: "diploma",
    issued: "2024-06",
    hours: 36,
    related: { id: "certiport-it-specialist-databases", kind: "preparedFor" },
  },
  {
    id: "a2-sql",
    title: { es: "SQL desde Cero a Experto", en: "SQL from Zero to Expert" },
    issuer: "A2 Capacitación",
    category: "course",
    issued: "2024-05",
    hours: 15,
  },
];
