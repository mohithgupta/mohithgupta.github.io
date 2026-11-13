// Scrubbing, zoom, keyboard control and one-shot playback for every [data-timeline].
type ClipData = { id: string; track: string; title: string; sub: string; s: number; e: number; range: string; blurb: string; href: string };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS: Record<string, string> = { work: "var(--clip-work)", study: "var(--clip-study)", project: "var(--clip-project)", writing: "var(--clip-writing)" };
const ORDER = ["work", "project", "study", "writing"];
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function initTimelines() {
  document.querySelectorAll<HTMLElement>("[data-timeline]").forEach(init);
}

function init(root: HTMLElement) {
  if (root.dataset.ready) return;
  root.dataset.ready = "1";
  const clips: ClipData[] = JSON.parse(root.querySelector("[data-clips]")!.textContent || "[]");
  const total = Number(root.dataset.total);
  const startIdx = Number(root.dataset.start);
  const now = Number(root.dataset.now);
  const inner = root.querySelector<HTMLElement>("[data-inner]")!;
  const scroller = root.querySelector<HTMLElement>("[data-scroll]")!;
  const head = root.querySelector<HTMLElement>("[data-playhead]")!;
  const tc = root.querySelector<HTMLElement>("[data-tc]")!;
  const when = root.querySelector<HTMLElement>("[data-insp-when]")!;
  const list = root.querySelector<HTMLElement>("[data-insp-list]")!;
  const playBtn = root.querySelector<HTMLButtonElement>("[data-play]")!;
  const clipEls = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>("[data-clip]").forEach((el) => clipEls.set(el.dataset.clip!, el));

  let pos = now;
  let lastKey = "";
  let raf = 0;

  const label = (p: number) => {
    const i = startIdx + Math.floor(p);
    return `${MONTHS[i % 12]} ${Math.floor(i / 12)}`;
  };

  function render() {
    const pctv = (pos / total) * 100;
    head.style.left = `${pctv}%`;
    const text = label(pos);
    head.setAttribute("aria-valuenow", pos.toFixed(1));
    head.setAttribute("aria-valuetext", text);
    tc.textContent = text;
    when.textContent = text;
    const active = clips
      .filter((c) => c.s <= pos && pos < c.e)
      .sort((a, b) => ORDER.indexOf(a.track) - ORDER.indexOf(b.track) || b.s - a.s);
    const key = active.map((c) => c.id).join("|");
    root.dispatchEvent(new CustomEvent("timeline:pos", { detail: { progress: pos / now }, bubbles: true }));
    if (key === lastKey) return;
    lastKey = key;
    clipEls.forEach((el, id) => el.classList.toggle("live", active.some((c) => c.id === id)));
    const shown = active.slice(0, 4);
    const extra = active.length - shown.length;
    list.innerHTML = active.length
      ? shown
          .map((c, i) => {
            const blurb = i < 2 ? `<span class="blurb">${esc(c.blurb)}</span>` : "";
            const body = `<span class="ttl">${esc(c.title)}</span><span class="meta">${esc(c.sub)}, ${esc(c.range)}</span>${blurb}`;
            return `<li style="--c:${COLORS[c.track]}">${c.href ? `<a href="${esc(c.href)}">${body}</a>` : body}</li>`;
          })
          .join("") + (extra > 0 ? `<li class="empty">and ${extra} more on the timeline</li>` : "")
      : `<li class="empty">Nothing on the timeline this month. Drag the playhead.</li>`;
  }

  function setPos(p: number, follow = false) {
    pos = Math.min(Math.max(p, 0), total - 0.01);
    render();
    if (follow) {
      const x = (pos / total) * inner.offsetWidth;
      if (x < scroller.scrollLeft + 40 || x > scroller.scrollLeft + scroller.clientWidth - 40) scroller.scrollLeft = x - scroller.clientWidth / 2;
    }
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove("playing");
    playBtn.setAttribute("aria-label", "Play the timeline");
  }

  function play(from = 2, to = now, ms = 3800) {
    stop();
    if (reduced()) { setPos(to); return; }
    root.classList.add("playing");
    playBtn.setAttribute("aria-label", "Pause the timeline");
    const t0 = performance.now();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (t: number) => {
      const k = Math.min((t - t0) / ms, 1);
      setPos(from + (to - from) * ease(k), true);
      if (k < 1) raf = requestAnimationFrame(step);
      else stop();
    };
    raf = requestAnimationFrame(step);
  }

  playBtn.addEventListener("click", () => {
    if (raf) return stop();
    play(pos >= now - 0.6 ? 2 : pos, now, pos >= now - 0.6 ? 3800 : Math.max(800, ((now - pos) / now) * 3800));
  });

  // Scrub by dragging the playhead or anywhere on the ruler.
  const fromEvent = (e: PointerEvent) => {
    const r = inner.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * total;
  };
  const startDrag = (e: PointerEvent) => {
    if (e.button !== 0) return;
    stop();
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setPos(fromEvent(e));
    head.focus({ preventScroll: true });
    const move = (ev: PointerEvent) => setPos(fromEvent(ev));
    const up = () => { target.removeEventListener("pointermove", move); target.removeEventListener("pointerup", up); target.removeEventListener("pointercancel", up); };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };
  head.addEventListener("pointerdown", startDrag);
  root.querySelector<HTMLElement>("[data-ruler]")!.addEventListener("pointerdown", startDrag);

  head.addEventListener("keydown", (e) => {
    const big = e.shiftKey ? 12 : 1;
    const map: Record<string, number> = { ArrowLeft: pos - big, ArrowDown: pos - big, ArrowRight: pos + big, ArrowUp: pos + big, PageDown: pos - 12, PageUp: pos + 12, Home: 0, End: now };
    if (e.key in map) { e.preventDefault(); stop(); setPos(Math.floor(map[e.key]) + 0.5, true); }
    if (e.key === " " || e.key === "k") { e.preventDefault(); playBtn.click(); }
  });

  // Hovering a clip previews it in the inspector by parking the playhead on it.
  clipEls.forEach((el, id) => {
    el.addEventListener("pointerenter", (e) => {
      if (raf || (e as PointerEvent).pointerType !== "mouse") return;
      const c = clips.find((x) => x.id === id)!;
      if (!(c.s <= pos && pos < c.e)) setPos(c.s + 0.5);
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-zoom]").forEach((b) => {
    b.addEventListener("click", () => {
      root.querySelectorAll("[data-zoom]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      inner.style.setProperty("--zoom", b.dataset.zoom!);
      setTimeout(() => setPos(pos, true), 520);
      if (b.dataset.zoom !== "1") setTimeout(() => scroller.scrollTo({ left: scroller.scrollWidth, behavior: reduced() ? "auto" : "smooth" }), 520);
    });
  });

  render();
  // On narrow screens the track area scrolls; start with "now" in view.
  if (scroller.scrollWidth > scroller.clientWidth) scroller.scrollLeft = scroller.scrollWidth;
  if (root.dataset.autoplay === "1" && !reduced()) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { io.disconnect(); setTimeout(() => play(), 350); }
    }, { threshold: 0.4 });
    io.observe(root);
  }
}
