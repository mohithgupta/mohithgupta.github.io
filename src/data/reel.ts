// The home showreel: one editor whose playhead walks through these stops as the page scrolls.
// Stops are chronological. Each one parks the playhead at `at` (YYYY-MM) and shows a frame in the program monitor.
import type { ImageMetadata } from "astro";
import { roles, education, fmtRange, duration } from "./site";
import { projects, bySlug, type Poster } from "./projects";

export interface Frame {
  id: string;
  /** Clip ids on the timeline to highlight while this stop is active. */
  clips: string[];
  at: string;
  track: "intro" | "study" | "work" | "project" | "end";
  title: string;
  sub: string;
  body: string;
  metrics?: { value: string; label: string }[];
  image?: { src: ImageMetadata; alt: string; phone: boolean };
  poster?: Poster;
  href?: string;
  cta?: string;
}

const trupeer = roles.find((r) => r.id === "trupeer")!;
const mc = roles.find((r) => r.id === "mastercard")!;
const mcSE2 = mc.titles[0];
const mcSE = mc.titles[1];

const projectFrame = (slug: string): Frame => {
  const p = bySlug(slug);
  return {
    id: p.slug,
    clips: [p.slug],
    at: p.start,
    track: "project",
    title: p.title,
    sub: `${p.kind}, ${fmtRange(p.start, p.end)}`,
    body: p.tagline,
    metrics: p.stats.slice(0, 1),
    image: p.cover.shot ? { src: p.cover.shot.src, alt: p.cover.shot.alt, phone: p.cover.shot.frame === "phone" } : undefined,
    poster: p.cover.poster,
    href: `/work/${p.slug}`,
    cta: "Read the case study",
  };
};

export const frames: Frame[] = [
  {
    id: "intro", clips: [], at: "2018-06", track: "intro",
    title: "2018 to now, in one reel",
    sub: "Scroll to play",
    body: "Study, four years at Mastercard, a solo run at Trupeer and the products I build on my own time.",
  },
  {
    id: "nitw", clips: ["nitw"], at: education.start, track: "study",
    title: "NIT Warangal",
    sub: `${education.degree}, ${fmtRange(education.start, education.end)}`,
    body: "Engineering at one of India's top NITs, with my first React apps built on the side.",
    href: "/experience#education", cta: "Education",
  },
  {
    id: "mastercard-1", clips: ["mastercard-1"], at: mcSE.start, track: "work",
    title: "Mastercard",
    sub: `${mcSE.title}, ${fmtRange(mcSE.start, mcSE.end)}`,
    body: "Joined out of college and contributed UI to two global platforms that won Mastercard's CEO Award.",
    metrics: [{ value: "$50M", label: "revenue opportunity unlocked" }, { value: "2", label: "CEO Award-winning platforms" }],
    href: "/experience#mastercard", cta: "Read the details",
  },
  {
    id: "mastercard-0", clips: ["mastercard-0"], at: mcSE2.start, track: "work",
    title: "Promoted to Software Engineer II",
    sub: `Mastercard, ${fmtRange(mcSE2.start, mcSE2.end)}`,
    body: "Founding engineer on Mastercard's first near real-time anomaly detection platform, and co-lead of the UI and QA teams.",
    metrics: [{ value: "9+", label: "engineers across UI and QA, co-led" }, { value: "+50%", label: "app performance after load testing" }],
    href: "/experience#mastercard", cta: "Read the details",
  },
  projectFrame("askmychats"),
  projectFrame("endprs"),
  projectFrame("testyourtrade"),
  {
    id: "trupeer-0", clips: ["trupeer-0"], at: trupeer.start, track: "work",
    title: "Trupeer.ai",
    sub: `${trupeer.titles[0].title}, ${fmtRange(trupeer.start, trupeer.end)}. Solo.`,
    body: "Revamped the whole product UI on a design system I built, re-architected the API layer and revamped the video editor.",
    metrics: [{ value: "45 days", label: "to revamp the product UI" }, { value: "40% → 95%", label: "Sentry error coverage" }, { value: "0 P0 · 0 P1", label: "incidents, no QA team" }],
    href: "/experience#trupeer", cta: "Read the details",
  },
  projectFrame("agentic-harness"),
  projectFrame("panelcut"),
  projectFrame("sstitles"),
  {
    id: "end", clips: [], at: "2026-11", track: "end",
    title: "That's the reel so far",
    sub: duration(education.start, null) + " on the timeline",
    body: "Every project has a full case study with its architecture, decisions and measured results.",
    href: "/work", cta: "See all the work",
  },
];

// Sanity: every project appears once, so a new project can't silently miss the reel.
const inReel = new Set(frames.map((f) => f.id));
const missing = projects.filter((p) => !inReel.has(p.slug)).map((p) => p.slug);
if (missing.length) throw new Error(`reel.ts: projects missing from the showreel: ${missing.join(", ")}`);
