// Everything the site says about Mohith lives here and in projects.ts.
// Dates are "YYYY-MM"; `end: null` means ongoing.

export const profile = {
  name: "Mohith Korangi",
  short: "MK",
  role: "Software engineer, frontend and agentic AI",
  location: "Bengaluru, India",
  email: "mohithguptak@gmail.com",
  links: {
    github: "https://github.com/mohithgupta",
    linkedin: "https://www.linkedin.com/in/mohithgupta/",
    medium: "https://mohithgupta.medium.com/",
    resume: "/Mohith_Korangi_Resume.pdf",
  },
  statement:
    "I build frontends that feel finished: design systems, video editors and AI products, shipped end to end with agentic workflows and no drop in quality.",
  available: "Open to freelance projects",
};

export type Track = "work" | "study" | "project" | "writing";

export interface Clip {
  id: string;
  track: Track;
  title: string;
  sub: string;
  start: string;
  end: string | null;
  blurb: string;
  href?: string;
}

export interface Initiative {
  title: string;
  metric?: string;
  problem: string;
  did: string;
  outcome: string;
  link?: { label: string; href: string };
}

export interface Role {
  id: string;
  company: string;
  place: string;
  start: string;
  end: string | null;
  titles: { title: string; start: string; end: string | null }[];
  mode: string;
  summary: string;
  initiatives: Initiative[];
  stack: string[];
}

export const FIGMA_POST = "https://www.linkedin.com/feed/update/urn:li:activity:7492991221657886720/";

export const roles: Role[] = [
  {
    id: "trupeer",
    company: "Trupeer.ai",
    place: "Bengaluru",
    start: "2026-07",
    end: null,
    titles: [{ title: "Software Engineer, Full Stack", start: "2026-07", end: null }],
    mode: "Every initiative here was built and owned solo.",
    summary:
      "Trupeer turns screen recordings into polished product videos and guides with AI. I joined to own the frontend and ended up owning everything from the design system to the backend, using agentic coding to move at the speed of a small team.",
    initiatives: [
      {
        title: "Revamped the entire product UI",
        metric: "45 days",
        problem: "The product had grown screen by screen, with no shared components, so every new feature looked and behaved a little differently.",
        did: "Built a design system and component library from scratch, then moved the whole app onto it.",
        outcome: "A consistent product in my first 45 days, and a base that new features now start from instead of reinventing.",
      },
      {
        title: "Re-architected the API layer",
        metric: "40% → 95% error coverage",
        problem: "Requests, auth and error handling were spread across the codebase, so failures were inconsistent and many never reached Sentry.",
        did: "Centralized every request, auth flow, success path and error path into one layer, then rebuilt Sentry reporting and logging on top of it.",
        outcome: "Sentry error coverage went from 40% to 95%, so problems surface before users report them.",
      },
      {
        title: "Revamped the core video editing experience",
        problem: "The editor is where users spend most of their time, and it had to feel as fast and predictable as a desktop tool.",
        did: "Reworked the editing experience end to end and shipped AI-generated process-flow diagrams from uploaded videos, with version history for later edits.",
        outcome: "A calmer, more capable editor, plus a new way to turn a recording into documentation.",
      },
      {
        title: "Enforced the design system across repos",
        problem: "A design system only helps if every repo actually uses it.",
        did: "Added robust rules, tests and CI checks that catch off-system styles and components before they merge.",
        outcome: "Consistency that holds without anyone policing pull requests by hand.",
      },
      {
        title: "Built a Figma-to-code agent harness",
        metric: "98–99% accuracy",
        problem: "Turning Figma designs into components by hand was slow and drifted from the design in small ways.",
        did: "Built an agent harness with a visual feedback loop: it generates the component, renders it, compares it with the design and corrects itself.",
        outcome: "Reusable components at 98–99% visual accuracy, and much faster UI development across the team.",
        link: { label: "LinkedIn post about it", href: FIGMA_POST },
      },
      {
        title: "Live testing and a post-release sanity suite",
        metric: "0 P0 · 0 P1",
        problem: "There is no dedicated QA team, so quality had to be built into how I ship.",
        did: "Built a live-testing agent skill that verifies each change in the running app, and a sanity and smoke suite that sweeps every page after each release.",
        outcome: "Zero P0 and zero P1 incidents while owning frontend and backend delivery.",
      },
    ],
    stack: ["React", "TypeScript", "Design systems", "Sentry", "Figma", "Claude Code", "Agent skills", "MCP"],
  },
  {
    id: "mastercard",
    company: "Mastercard Data & Services",
    place: "Pune",
    start: "2022-07",
    end: "2026-06",
    titles: [
      { title: "Software Engineer II", start: "2024-03", end: "2026-06" },
      { title: "Software Engineer", start: "2022-07", end: "2024-02" },
    ],
    mode: "Team work: I co-led the UI and QA teams.",
    summary:
      "Four years on data-intensive analytics products for banks: a founding engineer on a brand-new anomaly detection platform, and a core contributor to two platforms that won Mastercard's CEO Award.",
    initiatives: [
      {
        title: "Founding engineer on anomaly detection",
        problem: "Mastercard had no near real-time way for banks to spot unusual transaction patterns.",
        did: "Joined as a founding engineer and built the data-intensive insights UI for analytics and alerting on banking transactions.",
        outcome: "Mastercard's first near real-time anomaly detection platform.",
      },
      {
        title: "Core contributor to two CEO Award-winning platforms",
        metric: "$50M opportunity",
        problem: "Two global platforms for banks, built by large cross-functional teams on tight timelines.",
        did: "Contributed UI features to both as part of large teams, working closely with product and backend engineers.",
        outcome: "Both won the CEO Award, Mastercard's highest honour, unlocking a $50M revenue opportunity projected to drive $100M a year.",
      },
      {
        title: "Fake-backend and micro-frontend architecture",
        metric: "~30% faster delivery",
        problem: "UI work kept waiting for backend APIs to be ready.",
        did: "Led the move to a fake-backend architecture that decoupled the UI from API readiness, and maintained a micro-frontend setup for hosting parent and child apps.",
        outcome: "Features shipped about 30% faster, and modular parent and child apps could live in one shell.",
      },
      {
        title: "Data-driven QA",
        metric: "−70% manual testing",
        problem: "Setting up test data by hand made every QA cycle slow.",
        did: "Automated test-data setup with PL/SQL DML scripts.",
        outcome: "Manual testing time dropped by 70%, saving 5–6 days per release cycle.",
      },
      {
        title: "Co-led UI and QA teams of 9+",
        metric: "+50% performance",
        problem: "A large team needed shared standards to ship quickly without rework.",
        did: "Co-led the UI and QA teams alongside 7+ backend engineers and PMs, ran stress and load testing, and tightened PR reviews and the release process.",
        outcome: "App performance improved by about 50%, and rework and bugs fell by about 30%.",
      },
    ],
    stack: ["React", "Redux", "TypeScript", "Webpack", "Micro-frontends", "PL/SQL", "Python", "JMeter"],
  },
];

export const education = {
  school: "National Institute of Technology, Warangal",
  degree: "B.Tech",
  start: "2018-08",
  end: "2022-05",
};

export const writing = [
  { title: "Do you really know the exact differences between innerHTML, innerText and textContent?", date: "2023-12-30", href: "https://mohithgupta.medium.com/do-you-really-know-the-exact-differences-between-innerhtml-vs-innertext-vs-textcontent-3fdbe859e6fd" },
  { title: "useState hook: some points I feel everyone should know", date: "2023-12-22", href: "https://javascript.plainenglish.io/usestate-hook-some-points-i-feel-everyone-should-know-learn-react-hooks-de8f534f3247" },
  { title: "useState hook: Learn React Hooks", date: "2023-12-15", href: "https://blog.stackademic.com/usestate-hook-learn-react-hooks-1a5995d65070" },
  { title: "Do you know the difference between an Object and a Map in JavaScript?", date: "2023-12-08", href: "https://mohithgupta.medium.com/do-you-know-the-difference-between-an-object-and-a-map-in-javascript-c5c629fbe6e0" },
  { title: "useEffect in function components vs class component methods", date: "2023-12-01", href: "https://blog.stackademic.com/useeffect-in-functional-component-vs-class-component-methods-also-starting-a-learn-react-hooks-626923fac5b5" },
  { title: "So what's new in ECMAScript 2023?", date: "2023-07-02", href: "https://javascript.plainenglish.io/so-whats-new-in-ecma-2023-afafcb50f1d9" },
  { title: "Did you know x === x can return false?", date: "2023-04-20", href: "https://javascript.plainenglish.io/did-you-know-x-x-can-return-false-9c48ec84c572" },
  { title: "What does typeof null return in JavaScript?", date: "2023-04-19", href: "https://javascript.plainenglish.io/guess-what-typeof-null-returns-in-javascript-90cb86d2379d" },
  { title: "map(), filter() and reduce() in JavaScript with simple examples", date: "2023-04-18", href: "https://mohithgupta.medium.com/map-filter-reduce-in-javascript-with-simple-examples-fab48e23c086" },
  { title: "parseInt(0.000005) is 0 but parseInt(0.0000005) is 5. How?", date: "2023-04-17", href: "https://javascript.plainenglish.io/parseint-0-000005-0-whereas-parseint-0-0000005-5-but-how-6e661b0fb99b" },
];

export const mediumViews = "70K+";

// The home page shows the five most-viewed articles, without dates (Medium stats, 2026-11-14).
// The two Google Drive "download restricted" posts (14.4K and 3.8K views) are left out on purpose:
// a recruiter-facing page shouldn't lead with getting around a file owner's download block.
export const topWriting = [
  { title: "The Best Readme Generators for Your GitHub Profile", views: "21K", href: "https://plainenglish.io/github/the-best-readme-generators-for-your-github-profile-ea4f50559d87" },
  { title: "How to Handle Unsuccessful Fetch API Calls in JavaScript", views: "11.2K", href: "https://javascript.plainenglish.io/handling-unsuccessful-calls-of-fetch-api-7eef551b74c8" },
  { title: "I Hacked the Chrome Dinosaur Game. Here's How I Did It.", views: "2.8K", href: "https://javascript.plainenglish.io/an-immortal-dinosaur-and-the-fastest-too-hack-the-dino-game-7c5716c53e8b" },
  { title: "Data Structures: MULTI_SET vs SET vs UNORDERED_SET", views: "2.2K", href: "https://medium.com/geekculture/data-structures-multi-set-vs-set-vs-unordered-set-bcc4f6609ac9" },
  { title: "All You Need to Know About the Fetch API in JavaScript", views: "1.7K", href: "https://javascript.plainenglish.io/all-you-need-to-know-about-the-fetch-api-6929930572a8" },
];

/* ---------- date helpers ---------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtMonth = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};
export const fmtRange = (start: string, end: string | null) =>
  end === start ? fmtMonth(start) : `${fmtMonth(start)} – ${end ? fmtMonth(end) : "now"}`;
export const monthsBetween = (start: string, end: string | null, now = "2026-11") => {
  const [ay, am] = start.split("-").map(Number);
  const [by, bm] = (end ?? now).split("-").map(Number);
  return (by - ay) * 12 + (bm - am) + 1;
};
export const duration = (start: string, end: string | null) => {
  const n = monthsBetween(start, end);
  const y = Math.floor(n / 12), m = n % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo`].filter(Boolean).join(" ") || "1 mo";
};
