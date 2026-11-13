// Case studies. Every number here comes from a file in the project's repo (QA reports, decision logs, eval results).
import type { ImageMetadata } from "astro";
import amcInbox from "../assets/askmychats-inbox.png";
import amcLanding from "../assets/askmychats-landing.png";
import pcTiming from "../assets/panelcut-timing.png";
import pcPanels from "../assets/panelcut-panels.png";
import sstPhone from "../assets/sstitles-phone.png";

export type NodeKind = "client" | "service" | "store" | "external" | "ai" | "worker";
export interface GraphNode { id: string; label: string; sub?: string; col: number; row: number; kind: NodeKind }
export interface GraphEdge { from: string; to: string; label?: string }

export type Poster = "endprs" | "harness" | "trade";
export interface Shot { src: ImageMetadata; alt: string; frame: "desktop" | "phone" }

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  kind: string;
  start: string;
  end: string | null;
  links: { label: string; href: string }[];
  access: string;
  stack: string[];
  cover: { shot?: Shot; poster?: Poster };
  gallery?: Shot[];
  overview: string;
  stats: { value: string; label: string }[];
  problem: string;
  graphTitle: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  flow: string;
  decisions: { title: string; why: string }[];
  hard: { title: string; body: string }[];
  quality: string[];
  next: string;
}

export const projects: Project[] = [
  {
    slug: "askmychats",
    title: "AskMyChats",
    tagline: "Save anything from WhatsApp, find it later and ask about it.",
    kind: "AI product",
    start: "2025-12",
    end: null,
    links: [{ label: "Visit allmychats.online", href: "https://allmychats.online" }],
    access: "Live",
    stack: ["React 19", "TypeScript", "TanStack Start", "Postgres", "Drizzle", "pg-boss", "WhatsApp Cloud API", "Cloudflare R2", "Claude, OpenAI, GLM", "Playwright"],
    cover: { shot: { src: amcInbox, alt: "AskMyChats saved inbox in dark mode, showing notes, links and forwarded messages from a demo account", frame: "desktop" } },
    gallery: [{ src: amcLanding, alt: "AskMyChats landing page with a dashboard preview", frame: "desktop" }],
    overview:
      "The link from three months ago, the address someone dropped in a group, who owes whom: important things get buried in busy WhatsApp chats. AskMyChats lets you forward a message to a WhatsApp number or import a whole chat export, then search, organise and ask questions about it.",
    stats: [
      { value: "1.5 s", label: "to store 40,000 imported messages" },
      { value: "0 rows", label: "added when the same chat is imported twice" },
      { value: "574", label: "spec scenarios, each proven by a named test" },
    ],
    problem:
      "I measured the first architecture from India before scaling it: about 220 ms per database query, a 2.4 s cold first byte, and imports at roughly 220 ms per message, because the app ran in US East with the database in Singapore. Re-importing a chat also duplicated every message. The fix was architectural, not a patch.",
    graphTitle: "How a message gets saved, imported and answered",
    nodes: [
      { id: "web", label: "Web app", sub: "React 19, TanStack", col: 0, row: 0, kind: "client" },
      { id: "parse", label: "Parse worker", sub: "export unzipped on device", col: 0, row: 1, kind: "client" },
      { id: "wa", label: "WhatsApp", sub: "Meta Cloud API", col: 0, row: 2, kind: "external" },
      { id: "app", label: "App server", sub: "auth, limits, entitlements", col: 1, row: 0, kind: "service" },
      { id: "hook", label: "Webhook", sub: "signed, stores first", col: 1, row: 2, kind: "service" },
      { id: "pg", label: "Postgres", sub: "data, queue, meters", col: 2, row: 1, kind: "store" },
      { id: "llm", label: "LLM layer", sub: "Claude, OpenAI, GLM", col: 3, row: 0, kind: "ai" },
      { id: "worker", label: "Job worker", sub: "pg-boss queues", col: 3, row: 1, kind: "worker" },
      { id: "r2", label: "Object storage", sub: "media on R2", col: 3, row: 2, kind: "store" },
    ],
    edges: [
      { from: "web", to: "app", label: "server functions" },
      { from: "parse", to: "app", label: "gzip batches" },
      { from: "wa", to: "hook", label: "events" },
      { from: "app", to: "pg" },
      { from: "hook", to: "pg", label: "event + job, one txn" },
      { from: "pg", to: "worker", label: "jobs" },
      { from: "worker", to: "r2", label: "media" },
      { from: "app", to: "llm", label: "summaries, answers" },
    ],
    flow:
      "Messages arrive two ways. A forwarded message hits a signed webhook that stores the event and queues its job in the same transaction, then answers Meta immediately. A chat export is unzipped and parsed in a Web Worker on the user's device, and only the chosen date range is sent, in gzip batches of about 2,000 rows. Every server function and job passes through one middleware chain: auth, rate limits, input validation and an entitlement check.",
    decisions: [
      { title: "One region, one long-running server, Postgres for everything", why: "Queue, search and data all live in Postgres (pg-boss, full-text and trigram search) in a single India region. That removed the cross-continent round trips behind the 220 ms queries, and one database is far less to run than Redis plus a search engine." },
      { title: "Server functions as the only API", why: "The first version had four API styles, so auth and limits lived in four places. Now there is one typed entry point with one middleware chain, and a static check fails the build if any function or job skips its entitlement gate." },
      { title: "Store first, work later", why: "Meta can send the same webhook up to three times. Each item gets one row keyed by a SHA-256 hash and its job is queued in the same transaction, so processing happens exactly once in our database. Replies go out through a transactional outbox because Meta's send API has no idempotency key." },
      { title: "Parse imports on the device", why: "Exports with media can be hundreds of megabytes. Parsing in the browser means no huge upload, the raw file never leaves the phone, and content hashes make a re-import add zero rows." },
      { title: "Entitlements before features", why: "A feature catalog, plans, usage meters and kill switches came straight after auth. A kill switch pauses any feature for everyone within 30 seconds, with no deploy." },
    ],
    hard: [
      { title: "Imports that can't double-count", body: "Each batch runs in one transaction with a fixed lock order, inserts with ON CONFLICT DO NOTHING and records its offset, so a retried batch is a no-op. Storing 40,000 rows takes 1.5 s on the database side, and importing the same 40,000 again inserts nothing in 383 ms." },
      { title: "A memory attack found in audit", body: "One signed-out 512 MiB request pushed the server from 59 MB to 1.47 GB. Every server-function request now has a 2 MiB cap that is checked before the body is read." },
      { title: "A deadlock between two features", body: "Cancelling an import while deleting the account could deadlock Postgres. An audit caught it, and both paths now take locks in the same order." },
      { title: "Privacy by construction", body: "Raw webhook content is erased once processed, WhatsApp identity uses Meta's user id instead of the phone number, logs carry ids only, and every query is scoped to the signed-in user." },
      { title: "AI that treats chat text as data", body: "The LLM layer sits behind one provider interface for Claude, OpenAI and GLM, with a prompt-injection sanitizer, weighted hybrid search for context and a per-call cost log." },
    ],
    quality: [
      "145 Vitest files run against a real Postgres, and 23 Playwright specs run on the production build against a fake Meta server.",
      "10 capability specs with 574 scenarios. A scenario only counts when a running test names it.",
      "Local CI on every pull request: types, lint, tests, production build, semgrep, gitleaks and a dependency audit.",
    ],
    next: "Next is Ask: hybrid keyword and vector search over message windows, answers with citations that are checked against the user's own data, and a per-user AI budget checked before every model call.",
  },
  {
    slug: "panelcut",
    title: "PanelCut",
    tagline: "Turns a comic PDF into a beat-synced music video, entirely on your computer.",
    kind: "Video tool",
    start: "2026-11",
    end: null,
    links: [],
    access: "Private repo",
    stack: ["Python", "PyMuPDF", "OpenCV", "librosa", "FastAPI", "React", "TypeScript", "WebCodecs", "mediabunny", "Remotion"],
    cover: { shot: { src: pcTiming, alt: "PanelCut music and timing step: two tracks with beat counts, reading speed and pace controls, and a summary of 60 shots", frame: "desktop" } },
    gallery: [{ src: pcPanels, alt: "PanelCut panel grid with Impact, Close-up and Skip controls on each detected panel (generated test pages)", frame: "desktop" }],
    overview:
      "Hobbyists cut manga panels by hand in video editors, and creators pay per video for a trailer. PanelCut takes a manga, webtoon or comic PDF and makes the video for you: it finds the panels, orders them, times each shot to its text and the music, and renders an MP4. Your files never leave your computer.",
    stats: [
      { value: "0.28–0.53 s", label: "to render one second of video in the browser (CLI: 1.58–2.43 s)" },
      { value: "5,000", label: "panels in one grid, with edits down from 3–4 s to under 40 ms" },
      { value: "0", label: "network requests outside your own computer" },
    ],
    problem:
      "Comics are not built for video. Panels have slanted gutters, speech bubbles that break the borders, and full-bleed art, and webtoons are one endless strip. A good video also has to hold each panel long enough to read and cut on the beat. All of that had to run locally, because scans are usually copyrighted and \"your files never leave your computer\" is the promise.",
    graphTitle: "From PDF to MP4 without leaving the machine",
    nodes: [
      { id: "app", label: "React app", sub: "127.0.0.1 only", col: 0, row: 0, kind: "client" },
      { id: "engine", label: "Engine API", sub: "FastAPI, one job at a time", col: 1, row: 0, kind: "service" },
      { id: "detect", label: "Panel detection", sub: "PyMuPDF, OpenCV", col: 2, row: 0, kind: "worker" },
      { id: "timing", label: "Timing", sub: "reading time, beats", col: 2, row: 1, kind: "worker" },
      { id: "shots", label: "shots.json", sub: "typed hand-off", col: 3, row: 1, kind: "store" },
      { id: "browser", label: "Browser renderer", sub: "WebCodecs, H.264", col: 4, row: 0, kind: "client" },
      { id: "remotion", label: "Remotion CLI", sub: "reference renderer", col: 4, row: 2, kind: "service" },
      { id: "mp4", label: "MP4", sub: "made on device", col: 5, row: 1, kind: "store" },
    ],
    edges: [
      { from: "app", to: "engine", label: "PDF, music" },
      { from: "engine", to: "detect" },
      { from: "detect", to: "timing", label: "panels" },
      { from: "timing", to: "shots" },
      { from: "shots", to: "browser" },
      { from: "shots", to: "remotion" },
      { from: "browser", to: "remotion", label: "parity tests" },
      { from: "browser", to: "mp4" },
      { from: "remotion", to: "mp4" },
    ],
    flow:
      "The app talks only to a local engine on 127.0.0.1. The engine reads the PDF one page at a time in a worker process it can kill, detects and orders the panels, then turns reading time and the music's beats into a typed shots file. The browser renderer draws every frame on an OffscreenCanvas and encodes H.264 and AAC with WebCodecs. The Remotion command-line renderer stays as the reference that the browser output is tested against.",
    decisions: [
      { title: "Render in the browser", why: "A spike rendered 116.5 s of video in 34 s in Chrome, against about 118 s in Remotion. The product renderer now takes 0.28–0.53 s per second of video, against 1.58–2.43 s for the command line, on four real chapters." },
      { title: "Files never leave the device", why: "No upload surface exists, the content security policy allows only the app and the local engine, logs carry counts only, and tests use generated fixtures. Golden files store numbers, never page images." },
      { title: "Test the renderer against Remotion with numbers", why: "Committed goldens hold per-frame cell brightness and audio RMS windows recorded from Remotion. The browser renderer must stay within a mean of 3 and a worst cell of 8, so any regression shows up as a number." },
      { title: "A constant-quality encoder", why: "A fixed 1.4 Mbit/s bitrate failed the frame rule on 5 of 7 halftone frames. A constant quantizer with a 2.5 Mbit/s fallback fixed it, at about 37% of the command-line file size." },
      { title: "Detected panels are immutable", why: "Edits (move, merge, split, skip) are stored as an arrangement beside the detection, so re-running detection never destroys the user's work." },
    ],
    hard: [
      { title: "Finding panels in real comics", body: "Gutters are found as background connected to the page edge, so white panel interiors are not mistaken for gutter. Cuts may slant up to 8%, bubbles that break borders are re-attached, slivers are dropped, and webtoon strips are stitched and split on blank bands." },
      { title: "Reading order", body: "Panels are grouped into tiers by vertical overlap, then read right to left for manga or left to right for western comics." },
      { title: "Timing that feels edited", body: "Each shot lasts its motion time or its reading time, whichever is longer, where reading time grows with bubbles and characters. Cuts snap to the nearest beat, playlists that mix tracks with and without a beat only snap inside the beat tracks, and an impact cut appears at most once in six shots." },
      { title: "Memory on big files", body: "The engine predicts peak memory per layout and caps its worker at the smaller of 4 GiB and 60% of free RAM. The renderer decodes images on demand and holds at most two large panels. A 1,426-page file rendered in 15 parts." },
    ],
    quality: [
      "323 engine tests, 54 Vitest files including Chrome-driven renderer and preview tests on a production build, and 18 script test files.",
      "Engine output is pinned by a golden recorded from the original command-line tool, so the API and the CLI provably agree.",
      "Local CI runs semgrep, gitleaks, npm audit and pip-audit, and reports skipped scanners as skipped, never as passed.",
    ],
    next: "Next is a 9:16 vertical output for short-form video, and moving the engine itself into the browser so there is nothing to install.",
  },
  {
    slug: "sstitles",
    title: "ssTitles",
    tagline: "Turns screenshots of recommendations into a verified watch list.",
    kind: "AI app",
    start: "2026-11",
    end: "2026-11",
    links: [{ label: "Open sstitles.vercel.app", href: "https://sstitles.vercel.app" }],
    access: "Live",
    stack: ["React 19", "TypeScript", "PWA", "Gemini vision", "TMDB", "AniList", "IndexedDB", "Vitest", "Playwright"],
    cover: { shot: { src: sstPhone, alt: "ssTitles home screen on a phone: paste your Gemini key, paste your TMDB token, add screenshots", frame: "phone" } },
    overview:
      "Screenshots of \"you have to watch this\" comments pile up in the gallery and the titles never get written down. ssTitles reads them with a vision model and gives back a de-duplicated list of the films, series, anime and comics they name, each checked against a real catalogue.",
    stats: [
      { value: "0", label: "wrong titles allowed by the release gate" },
      { value: "3.2 s", label: "median time per screenshot" },
      { value: "0 / 29", label: "decoy screenshots given a title" },
    ],
    problem:
      "A vision model will happily invent a title, and its own confidence was always 0.9 to 1.0, so it told me nothing. The app had to be honest about what it doesn't know, work on a free API tier with tight rate limits, and keep people's screenshots private without a backend.",
    graphTitle: "From a screenshot to a verified title",
    nodes: [
      { id: "pick", label: "Screenshots", sub: "up to 100 a batch", col: 0, row: 0, kind: "client" },
      { id: "prep", label: "Prepare", sub: "resize, strip metadata", col: 1, row: 0, kind: "client" },
      { id: "queue", label: "IndexedDB queue", sub: "survives reloads", col: 2, row: 0, kind: "store" },
      { id: "gemini", label: "Gemini vision", sub: "12 a minute, retries", col: 3, row: 0, kind: "ai" },
      { id: "verify", label: "TMDB + AniList", sub: "verify every title", col: 4, row: 0, kind: "external" },
      { id: "list", label: "Watch list", sub: "de-duplicated by id", col: 4, row: 1, kind: "client" },
      { id: "check", label: "Check these", sub: "doubtful matches", col: 3, row: 1, kind: "client" },
    ],
    edges: [
      { from: "pick", to: "prep" },
      { from: "prep", to: "queue" },
      { from: "queue", to: "gemini", label: "one image" },
      { from: "gemini", to: "verify", label: "candidates" },
      { from: "verify", to: "list", label: "verified" },
      { from: "verify", to: "check", label: "in doubt" },
    ],
    flow:
      "Everything runs in the browser. Each screenshot is re-encoded at 1280 px with its metadata stripped, queued in IndexedDB, and sent to Gemini with a strict JSON schema. Each candidate title is then searched on TMDB, or on AniList for comics, and ranked by exact title, year and popularity. Anything that doesn't verify cleanly goes to a \"Check these\" screen instead of the list.",
    decisions: [
      { title: "Pick the model with a measured spike", why: "On 28 real screenshots, Gemini Flash-Lite found 21 of 21 titles with 0 wrong and rejected 9 of 9 decoys at 3.2 s each. A local model also found 21 but got 2 wrong at 11.2 s, and a larger model failed 27 of 28 calls with 503s." },
      { title: "Verify instead of trusting the model", why: "Every title must match a real TMDB or AniList entry. If the catalogue is unreachable the title is marked unverified, never guessed." },
      { title: "An eval harness as the merge gate", why: "A labelled set of 74 screenshots runs three times per change, and the bar is 95% found, zero wrong and zero decoys with a title. A prompt change that cost two decoys was shelved even though it fixed other cases." },
      { title: "No backend at all", why: "Users paste their own keys, which stay in IndexedDB and never in the bundle. Nothing is stored on a server, so there is nothing to breach and nothing to pay for." },
    ],
    hard: [
      { title: "Free-tier rate limits", body: "A throttle of 12 requests a minute, exponential backoff with jitter, a fallback model, and a queue that pauses, resumes and survives a reload. AniList's 30-a-minute limit is paced request by request." },
      { title: "Generalising, not overfitting", body: "Search variants (text before a colon, singular and plural, joined words) lifted the gate from 49 to 52 or more of 54 titles. A separate held-out set of 100 screenshots keeps the score honest." },
      { title: "Untrusted text from images", body: "Model output is parsed against a strict schema and rendered as plain text. The content security policy only allows Gemini, TMDB and AniList, and denies everything else." },
    ],
    quality: [
      "About 189 test files: unit, eval and Playwright, including offline, install and axe accessibility specs.",
      "End-to-end tests block every outside origin, so a test can't quietly leak data.",
      "Local CI with 11 steps, including semgrep, gitleaks and a header check against the live site.",
    ],
    next: "Next is better same-name disambiguation, which needs to win without costing a single decoy.",
  },
  {
    slug: "endprs",
    title: "EndPRs",
    tagline: "An agent that turns pull request review comments into commits.",
    kind: "AI agent",
    start: "2026-02",
    end: "2026-02",
    links: [{ label: "View on GitHub", href: "https://github.com/mohithgupta/EndPRs" }],
    access: "Open source",
    stack: ["TypeScript", "Claude Agent SDK", "Next.js", "Fastify", "BullMQ", "Redis", "Postgres", "pgvector", "Docker"],
    cover: { poster: "endprs" },
    overview:
      "\"Rename this\", \"handle the null case\", \"fix this type\": most review comments are mechanical, but each one costs a context switch. EndPRs watches your pull requests, writes the fix with Claude and pushes it back as a commit, so you only review the result.",
    stats: [
      { value: "0", label: "GitHub API quota used while nothing changes" },
      { value: "2", label: "ways to generate a fix: agent edits or patches" },
      { value: "21", label: "test files across the worker and API" },
    ],
    problem:
      "An agent like this lives or dies on three things: it must not burn the GitHub rate limit by polling, it must not process the same comment twice, and it needs enough of the codebase in context to make a correct change.",
    graphTitle: "From a review comment to a pushed fix",
    nodes: [
      { id: "gh", label: "GitHub", sub: "review comments", col: 0, row: 0, kind: "external" },
      { id: "poll", label: "Poller", sub: "ETag requests", col: 1, row: 0, kind: "worker" },
      { id: "dash", label: "Dashboard", sub: "Next.js", col: 1, row: 1, kind: "client" },
      { id: "queue", label: "BullMQ", sub: "priority, de-duplicated", col: 2, row: 0, kind: "store" },
      { id: "api", label: "API", sub: "Fastify", col: 2, row: 1, kind: "service" },
      { id: "pool", label: "Worker pool", sub: "rate-limited", col: 3, row: 0, kind: "worker" },
      { id: "rag", label: "pgvector", sub: "code embeddings", col: 3, row: 1, kind: "store" },
      { id: "agent", label: "Claude", sub: "Agent SDK or API", col: 4, row: 0, kind: "ai" },
    ],
    edges: [
      { from: "gh", to: "poll", label: "304 if unchanged" },
      { from: "poll", to: "queue", label: "jobs" },
      { from: "queue", to: "pool" },
      { from: "pool", to: "agent", label: "fix request" },
      { from: "rag", to: "pool", label: "context" },
      { from: "dash", to: "api" },
      { from: "api", to: "queue", label: "settings" },
    ],
    flow:
      "A poller checks open pull requests every 10 seconds with conditional requests and queues a job when a new comment appears. A worker pool picks jobs up by priority, gives Claude the comment plus relevant code, applies the fix and commits and pushes it with git. A Next.js dashboard shows jobs, generation modes and token usage.",
    decisions: [
      { title: "ETag polling instead of webhooks", why: "It works for any repo without installing an app. Every request sends If-None-Match, and a 304 response costs no quota, so polling every 10 seconds stays inside GitHub's limits." },
      { title: "Deterministic job ids", why: "Each job id is built from the repo, PR number and update time, so re-polling an unchanged pull request can never queue a duplicate fix." },
      { title: "Two ways to generate a fix", why: "Agent SDK mode lets Claude read and edit the checkout directly with a restricted tool set. API mode generates a patch with retrieved code context. A flag switches between them, so they can be compared on cost and quality." },
      { title: "Priority queue", why: "Priority comes from keywords in the comment and the PR's age, plus a per-repo boost, so urgent fixes jump ahead." },
    ],
    hard: [
      { title: "Rate limits everywhere", body: "GitHub rate-limit responses become typed errors with a reset time and exponential backoff. The worker pool runs at most 100 jobs a minute, and embedding calls back off on their own limits." },
      { title: "Context that fits", body: "Code is chunked, embedded and stored in pgvector with a cosine index. Retrieval is filtered by similarity and trimmed to a token budget before it goes into the prompt." },
      { title: "Secrets at rest", body: "Secrets stored by the API are encrypted with AES-256-GCM, using keys derived with PBKDF2." },
    ],
    quality: [
      "21 test files and about 500 test cases across the worker and the API.",
      "A Docker sandbox module with CPU, memory, process and time limits is built and unit-tested.",
    ],
    next: "Next is wiring that sandbox into the pipeline, so every fix runs the repo's own tests before it is pushed.",
  },
  {
    slug: "agentic-harness",
    title: "Local Agentic Harness",
    tagline: "The workspace I use to build with AI agents without lowering the bar.",
    kind: "Developer tooling",
    start: "2026-09",
    end: null,
    links: [],
    access: "Private",
    stack: ["Claude Code", "Agent skills", "Subagents", "Hooks", "MCP", "Playwright", "lefthook", "semgrep", "gitleaks"],
    cover: { poster: "harness" },
    overview:
      "Agents start every session with no memory, and rules written in prose are only advice. This harness puts the rules in files, hooks, scripts and gates, so a one-line idea becomes merged, tested pull requests, and the agents stop only for decisions that are genuinely mine.",
    stats: [
      { value: "11", label: "reusable skills, from spec to post-release smoke" },
      { value: "8", label: "specialist subagents per project" },
      { value: "3", label: "products built on it so far" },
    ],
    problem:
      "Fast agents are easy. Agents that don't skip tests, don't leak secrets, don't approve their own specs and don't force-push to main are the hard part, and that only works when the rules can't be skipped.",
    graphTitle: "How one change moves through the harness",
    nodes: [
      { id: "spec", label: "Spec", sub: "scenario ids", col: 0, row: 0, kind: "ai" },
      { id: "audit", label: "Audit", sub: "claims checked in code", col: 1, row: 0, kind: "ai" },
      { id: "tests", label: "Tests first", sub: "named by scenario", col: 2, row: 0, kind: "ai" },
      { id: "build", label: "Build", sub: "guarded edits", col: 3, row: 0, kind: "ai" },
      { id: "review", label: "Review", sub: "code, security, privacy", col: 4, row: 0, kind: "ai" },
      { id: "qa", label: "Live QA", sub: "real Chrome, evidence", col: 4, row: 1, kind: "service" },
      { id: "ci", label: "PR + local CI", sub: "on the head commit", col: 3, row: 1, kind: "service" },
      { id: "merge", label: "Merge", sub: "merge commit only", col: 2, row: 1, kind: "service" },
      { id: "smoke", label: "Smoke", sub: "every route after release", col: 1, row: 1, kind: "client" },
    ],
    edges: [
      { from: "spec", to: "audit" },
      { from: "audit", to: "tests", label: "approved" },
      { from: "tests", to: "build" },
      { from: "build", to: "review" },
      { from: "review", to: "qa" },
      { from: "qa", to: "ci" },
      { from: "ci", to: "merge", label: "green" },
      { from: "merge", to: "smoke" },
    ],
    flow:
      "Each change starts as a spec with scenario ids. An auditor agent checks every claim against the code, and the spec can only be approved by a script that refuses while questions are open. Tests are written first and named by scenario, the builder can't edit them, and one combined review covers code, security and privacy. Live QA in a real browser keeps screenshots as evidence, local CI runs on the exact head commit, and after release a smoke sweep opens every route.",
    decisions: [
      { title: "Rules live in hooks, not prose", why: "Two blocking hooks per project stop pushes to main, force-pushes, skipped git hooks, reads of .env files, secret-looking text in edits and self-written approval lines. Each rule has its own tests." },
      { title: "Coverage is proven, not claimed", why: "A scenario counts as covered only when a test that actually runs names it. Skipped or focused tests don't count." },
      { title: "Generic skills, project overrides", why: "Eleven skills live once in the workspace and load everywhere, and a project's own version of a skill always wins." },
      { title: "Ask the human only what's theirs", why: "Money, legal promises, accounts, production and brand decisions are batched into one message with a recommendation. Everything else is decided, logged and reported." },
    ],
    hard: [
      { title: "Honest results", body: "Skipped steps report as skipped, never as passed, and QA failures are labelled as product, fixture or harness problems." },
      { title: "Agents working in parallel", body: "Each change gets its own worktree, a lock allows one heavy job at a time, and agents never share files." },
      { title: "Learning from mistakes", body: "A retro step turns each real mistake into a written lesson and, where possible, into a hook or a test." },
    ],
    quality: [
      "Used to build AskMyChats, PanelCut and ssTitles.",
      "Local CI on every pull request runs secret scanning with gitleaks and semgrep.",
    ],
    next: "Next is caching passed results per tree hash, so a failing suite reruns only what failed.",
  },
  {
    slug: "testyourtrade",
    title: "TestYourTrade",
    tagline: "Paper trading on live Indian market prices.",
    kind: "Real-time app",
    start: "2026-01",
    end: "2026-01",
    links: [],
    access: "Private repo",
    stack: ["React", "TypeScript", "Zustand", "Socket.io", "Fastify", "Redis", "Postgres", "Supabase"],
    cover: { poster: "trade" },
    overview:
      "Learning to trade shouldn't cost real money. TestYourTrade gives you a virtual ₹10,00,000, live NSE prices, market and limit orders, short selling, a portfolio and a leaderboard.",
    stats: [
      { value: "1", label: "upstream feed per symbol, shared by every user" },
      { value: "6", label: "tables with row-level security" },
      { value: "100", label: "symbols a client can watch at once" },
    ],
    problem:
      "Live prices have to reach every viewer instantly, and every limit order has to fill the moment the price crosses it, without opening one market-data connection per user.",
    graphTitle: "From a market tick to a filled order",
    nodes: [
      { id: "feed", label: "Market feed", sub: "Angel One WebSocket", col: 0, row: 0, kind: "external" },
      { id: "bcast", label: "Tick broadcast", sub: "fan-out service", col: 1, row: 0, kind: "service" },
      { id: "reg", label: "Subscriptions", sub: "reference counted", col: 1, row: 1, kind: "service" },
      { id: "rooms", label: "Socket.io rooms", sub: "one per symbol", col: 2, row: 0, kind: "service" },
      { id: "match", label: "Order matcher", sub: "runs on every tick", col: 2, row: 1, kind: "worker" },
      { id: "ui", label: "Trading UI", sub: "React, live charts", col: 3, row: 0, kind: "client" },
      { id: "book", label: "Redis order book", sub: "sorted sets by price", col: 3, row: 1, kind: "store" },
      { id: "pg", label: "Postgres", sub: "orders, trades", col: 3, row: 2, kind: "store" },
    ],
    edges: [
      { from: "feed", to: "bcast", label: "ticks" },
      { from: "bcast", to: "reg" },
      { from: "bcast", to: "rooms" },
      { from: "rooms", to: "ui", label: "prices" },
      { from: "reg", to: "match", label: "last price" },
      { from: "match", to: "book", label: "range query" },
      { from: "match", to: "pg", label: "fills" },
    ],
    flow:
      "One upstream subscription per symbol feeds a broadcast service that pushes ticks into a Socket.io room per symbol. On every tick, the matcher queries the Redis order book for limit orders the new price has crossed and fills them, including partial fills at a weighted average price.",
    decisions: [
      { title: "Redis sorted sets as the order book", why: "Orders are scored by price in separate buy and sell sets per symbol, so finding every order a tick has crossed is one range query." },
      { title: "A shared, reference-counted feed", why: "The first viewer of a symbol opens its upstream subscription and the last one to leave closes it, which keeps the app inside the market-data provider's limits." },
      { title: "Rooms per symbol", why: "Fan-out cost grows with the viewers of one symbol, not with every connected user. A Redis adapter lets the socket layer scale across servers." },
      { title: "Postgres with row-level security", why: "Orders, trades and balances live in Postgres with per-user policies on all six tables, plus Redis locks around balance changes." },
    ],
    hard: [
      { title: "Partial fills", body: "A partly filled order is re-queued with its remaining quantity, and its average price is updated by weight." },
      { title: "Upstream drops", body: "The market-data client reconnects automatically, and the socket layer falls back to in-memory mode when Redis isn't configured." },
    ],
    quality: [
      "Playwright specs for limit orders, short positions and live order updates, plus unit tests for balances, portfolio maths and the subscription registry.",
    ],
    next: "Next is making fills and settlement one atomic step, and authenticating socket connections with the same JWT as the REST API.",
  },
];

export const featured = ["askmychats", "panelcut", "sstitles", "endprs"];
export const bySlug = (slug: string) => projects.find((p) => p.slug === slug)!;
