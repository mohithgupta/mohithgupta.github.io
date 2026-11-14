// Showreel behaviour. The playhead moves only when the visitor asks it to: dragging it, picking a clip,
// the arrow keys or the play button. Page scroll is left alone (founder, 2026-11-14).
type Stop = { at: number; clips: string[] };
type Data = { stops: Stop[]; labels: string[]; T0: number; TB: number; T1: number; SPLIT: number; monthLabels: Record<string, string> };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function initReel() {
  const root = document.querySelector<HTMLElement>("[data-reel]");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";
  const d: Data = JSON.parse(root.querySelector("[data-reel-data]")!.textContent || "{}");
  const html = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
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
  // The frame for a playhead position is the last stop at or before it.
  const stopAt = (x: number) => { let k = 0; for (let i = 0; i < N; i++) if (d.stops[i].at <= x + 0.004) k = i; return k; };

  let x = 0;
  let active = -1;
  function show(k: number) {
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
  function place(nx: number) {
    x = clamp(nx, 0, 1);
    head.style.left = `${(x * 100).toFixed(3)}%`;
    tc.textContent = monthAt(x);
  }

  /* ---- move to a stop with a short glide ---- */
  let anim = 0;
  function goTo(k: number) {
    k = clamp(k, 0, N - 1);
    cancelAnimationFrame(anim);
    show(k);
    const from = x, to = d.stops[k].at;
    if (reduced) return place(to);
    const t0 = performance.now(), dur = 650;
    const step = (now: number) => {
      const t = clamp((now - t0) / dur, 0, 1);
      place(from + (to - from) * ease(t));
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  /* ---- drag the playhead anywhere on the tracks ---- */
  function scrubTo(clientX: number) {
    const r = area.getBoundingClientRect();
    cancelAnimationFrame(anim);
    place((clientX - r.left) / r.width);
    show(stopAt(x));
  }
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

  /* ---- play: step through the stops until the end, or until the visitor takes over ---- */
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
    if (active >= N - 1) { show(0); place(0); }
    html.classList.add("reel-playing");
    playBtn.setAttribute("aria-label", "Pause the reel");
    const tick = () => (active >= N - 1 ? stopPlay() : goTo(active + 1));
    tick();
    timer = window.setInterval(tick, reduced ? 3000 : 2400);
  });

  show(0);
  place(0);
  intro();

  /* ---- one-time intro: the assistant types a request, then the clips drop onto the tracks ---- */
  function intro() {
    if (reduced) return;
    const ask = $("[data-ask]");
    const text = ask.textContent || "";
    html.classList.add("reel-typing", "reel-assembling");
    ask.textContent = "";
    let n = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(typer);
      ask.textContent = text;
      html.classList.remove("reel-typing");
      clipEls.forEach((c, i) => (c.style.transitionDelay = `${i * 70}ms`));
      requestAnimationFrame(() => {
        html.classList.remove("reel-assembling");
        setTimeout(() => clipEls.forEach((c) => (c.style.transitionDelay = "")), 1400);
      });
    };
    const typer = window.setInterval(() => {
      ask.textContent = text.slice(0, ++n);
      if (n >= text.length) finish();
    }, 34);
  }
}
