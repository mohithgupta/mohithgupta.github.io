import { roles, education, type Clip } from "./site";
import { projects } from "./projects";

// Every clip on the career timeline, built from the same data the pages use.
export const clips: Clip[] = [
  {
    id: "nitw", track: "study", title: "NIT Warangal", sub: "B.Tech", start: education.start, end: education.end,
    blurb: "Four years of engineering, and my first React apps on the side.", href: "/experience#education",
  },
  ...roles.flatMap((r) =>
    r.titles.map((t, i) => ({
      id: `${r.id}-${i}`,
      track: "work" as const,
      title: r.company.replace(" Data & Services", ""),
      sub: t.title,
      start: t.start,
      end: t.end,
      blurb: r.id === "trupeer" ? "Revamped the product UI, re-architected the API layer, zero P0 and P1 incidents." :
        t.title.endsWith("II") ? "Founding engineer on anomaly detection; co-led UI and QA teams of 9+." :
        "Joined out of college; contributed UI to two CEO Award-winning platforms.",
      href: `/experience#${r.id}`,
    })),
  ),
  ...projects.map((p) => ({
    id: p.slug, track: "project" as const, title: p.title, sub: p.kind, start: p.start, end: p.end,
    blurb: p.tagline, href: `/work/${p.slug}`,
  })),
];
