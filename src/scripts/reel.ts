// Showreel behaviour: the page scroll drives the playhead through the stops; dragging the
// playhead, picking a clip, the keyboard and the play button all move the page scroll, so there is one source of truth.
type Stop = { at: number; clips: string[] };
type Data = { stops: Stop[]; labels: string[]; T0: number; TB: number; T1: number; SPLIT: number; monthLabels: Record<string, string> };

const HEADER = 60;
const HOLD = 0.3; // share of each step, at both ends, where the playhead rests on a stop
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);

export function initReel() {
  const root = document.querySelector<HTMLElement>("[data-reel]");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";
  const d: Data = JSON.parse(root.querySelector("[data-reel-data]")!.textContent || "{}");
  const html = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const stage = $("[data-stage]");
  const area = $("[data-area]");
  const head = $("[data-playhead]");
  const tc = $("[data-tc]");
  const playBtn = $<HTMLButtonElement>("[data-play]");
  const frames = [...root.querySelectorAll<HTMLElement>("[data-frame]")];
  const clipEls = [...root.querySelectorAll<HTMLAnchorElement>("[data-clip]")];
  const N = d.stops.length;
  html.classList.add("reel-on");

  const monthAt = (f: number) => {
    const m = f <= d.SPLIT ? d.T0 + (f / d.SPLIT) * (d.TB - d.T0) : d.TB + ((f - d.SPLIT) / (1 - d.SPLIT)) * (d.T1 - d.TB);
    return d.monthLabels[String(clamp(Math.floor(m), d.T0, d.T1 - 1))];
  };
  const startY = () => root.getBoundingClientRect().top + window.scrollY - HEADER;
  const range = () => Math.max(1, root.offsetHeight - stage.offsetHeight);

  /* ---- scroll → playhead ---- */
  let active = -1;
  function render() {
    const s = clamp((window.scrollY - startY()) / range(), 0, 1);
    const f = s * (N - 1);
    const i = Math.min(N - 2, Math.floor(f));
    const t = f - i;
    const tt = t < HOLD ? 0 : t > 1 - HOLD ? 1 : ease((t - HOLD) / (1 - 2 * HOLD));
    const x = d.stops[i].at + (d.stops[i + 1].at - d.stops[i].at) * tt;
    head.style.left = `${(x * 100).toFixed(3)}%`;
    tc.textContent = monthAt(x);
    const k = clamp(Math.round(f), 0, N - 1);
    if (k === active) return;
    active = k;
    frames.forEach((el, n) => {
      const on = n === k;
      el.classList.toggle("on", on);
      el.inert = !on;
      if (on) el.removeAttribute("aria-hidden"); else el.setAttribute("aria-hidden", "true");
    });
    const live = new Set(d.stops[k].clips);
    clipEls.forEach((c) => c.classList.toggle("live", live.has(c.dataset.clip!)));
    head.setAttribute("aria-valuenow", String(k));
    head.setAttribute("aria-valuetext", d.labels[k]);
  }
  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);

  /* ---- everything else → page scroll ---- */
  const scrollToProgress = (s: number, smooth: boolean) =>
    window.scrollTo({ top: startY() + clamp(s, 0, 1) * range(), behavior: smooth && !reduced ? "smooth" : "auto" });
  const goTo = (k: number, smooth = true) => scrollToProgress(clamp(k, 0, N - 1) / (N - 1), smooth);

  function scrubTo(clientX: number) {
    const r = area.getBoundingClientRect();
    const x = clamp((clientX - r.left) / r.width, 0, 1);
    let i = 0;
    while (i < N - 2 && x > d.stops[i + 1].at) i++;
    const a = d.stops[i].at, b = d.stops[i + 1].at;
    const u = b > a ? clamp((x - a) / (b - a), 0, 1) : 0;
    // Invert the resting curve so the playhead lands under the pointer.
    const t = u <= 0 ? 0 : u >= 1 ? 1 : HOLD + (1 - 2 * HOLD) * invEase(u);
    scrollToProgress((i + t) / (N - 1), false);
  }
  const invEase = (y: number) => { let lo = 0, hi = 1; for (let n = 0; n < 20; n++) { const m = (lo + hi) / 2; if (ease(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; };

  let dragging = false;
  area.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-clip]")) return;
    dragging = true;
    stopPlay();
    html.classList.add("reel-dragging");
    area.setPointerCapture(e.pointerId);
    scrubTo(e.clientX);
    head.focus({ preventScroll: true });
  });
  area.addEventListener("pointermove", (e) => { if (dragging) scrubTo(e.clientX); });
  const endDrag = () => { dragging = false; html.classList.remove("reel-dragging"); };
  area.addEventListener("pointerup", endDrag);
  area.addEventListener("pointercancel", endDrag);

  clipEls.forEach((c) => c.addEventListener("click", (e) => {
    const k = Number(c.dataset.stop);
    if (k < 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    stopPlay();
    goTo(k);
  }));

  head.addEventListener("keydown", (e) => {
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 };
    if (e.key in step) goTo(active + step[e.key]);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(N - 1);
    else return;
    e.preventDefault();
    stopPlay();
  });

  /* ---- play: step through the stops until the end or until the visitor takes over ---- */
  let timer = 0;
  function stopPlay() {
    if (!timer) return;
    clearInterval(timer);
    timer = 0;
    html.classList.remove("reel-playing");
    playBtn.setAttribute("aria-label", "Play the reel");
  }
  playBtn.addEventListener("click", () => {
    if (timer) return stopPlay();
    if (active >= N - 1) goTo(0, false);
    html.classList.add("reel-playing");
    playBtn.setAttribute("aria-label", "Pause the reel");
    const tick = () => (active >= N - 1 ? stopPlay() : goTo(active + 1));
    tick();
    timer = window.setInterval(tick, reduced ? 2600 : 2200);
  });
  ["wheel", "touchstart"].forEach((ev) => window.addEventListener(ev, stopPlay, { passive: true }));

  render();
  intro();

  /* ---- one-time intro: the assistant types a request, then the clips drop onto the tracks ---- */
  function intro() {
    if (reduced || window.scrollY > 10) return;
    const ask = $("[data-ask]");
    const name = document.querySelector<HTMLElement>("[data-name]");
    const text = ask.textContent || "";
    html.classList.add("reel-typing", "reel-assembling");
    if (name) name.style.setProperty("font-stretch", "70%");
    ask.textContent = "";
    let n = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(typer);
      window.removeEventListener("scroll", finish);
      ask.textContent = text;
      html.classList.remove("reel-typing");
      clipEls.forEach((c, i) => (c.style.transitionDelay = `${i * 70}ms`));
      requestAnimationFrame(() => {
        html.classList.remove("reel-assembling");
        if (name) name.style.removeProperty("font-stretch");
        setTimeout(() => clipEls.forEach((c) => (c.style.transitionDelay = "")), 1400);
      });
    };
    const typer = window.setInterval(() => {
      ask.textContent = text.slice(0, ++n);
      if (n >= text.length) finish();
    }, 34);
    window.addEventListener("scroll", finish, { once: true, passive: true });
  }
}
