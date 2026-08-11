import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string(),
  category: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  githubUrl: z.url().optional(),
  demoUrl: z.url().optional(),
  metrics: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .default([]),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        body: z.string(),
      }),
    )
    .default([]),
  featured: z.boolean().default(false),
  status: z.enum(["placeholder", "draft", "published"]).default("placeholder"),
  date: z.coerce.date(),
  order: z.number().default(0),
  coverImage: z.string().optional(),
});

const projectsEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects/en" }),
  schema: projectSchema,
});

const projectsEs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects/es" }),
  schema: projectSchema,
});

export const collections = { projectsEn, projectsEs };
