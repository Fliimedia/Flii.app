import "./card.css";

// Old links (#/prijzen, #loop, ...) all land on this one page now.
if (location.hash) history.replaceState(null, "", location.pathname + location.search);

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- living network: layers of nodes that react to pointer and tilt ---------- */
const canvas = document.querySelector(".net");
const ctx = canvas.getContext("2d");
const hl = document.querySelector(".hl");
const BASE = [156, 150, 136], ACC = [231, 37, 90];
const dpr = Math.min(devicePixelRatio || 1, 2);
let W = 0, H = 0, layers = [], edges = [];
const ptr = { x: -9999, y: -9999, on: false };
const lean = { x: 0, y: 0, tx: 0, ty: 0 }; // eased -1..1 from pointer or device tilt

function build() {
  const mobile = W < 760;
  const counts = mobile ? [3, 4, 4, 3] : [3, 5, 6, 5, 3];
  const L = counts.length, x0 = W * (mobile ? 0.06 : 0.07), x1 = W * (mobile ? 0.94 : 0.93);
  const yPad = H * 0.14, ySpan = H - 2 * yPad;
  layers = counts.map((c, li) => {
    const x = x0 + (x1 - x0) * (li / (L - 1));
    return Array.from({ length: c }, (_, ni) => {
      const ty = c === 1 ? 0.5 : ni / (c - 1);
      const ax = x + (Math.random() - 0.5) * 14;
      const ay = yPad + ySpan * ty + (Math.random() - 0.5) * (ySpan / (c * 2.4));
      return { ax, ay, x: ax, y: ay, depth: 0.35 + 0.65 * Math.abs(li - (L - 1) / 2) / ((L - 1) / 2),
        r: 1.5 + Math.random() * 1.2, ph: Math.random() * 6.28, amp: 1 + Math.random() * 1.3,
        dph: Math.random() * 6.28, damp: 5 + Math.random() * 7, gph: Math.random() * 6.28,
        gsp: 0.00035 + Math.random() * 0.0004, accent: li === L - 1 || li === 0 };
    });
  });
  edges = [];
  for (let li = 0; li < layers.length - 1; li++) for (const a of layers[li]) for (const b of layers[li + 1]) edges.push([a, b]);
  edges = edges.filter((_, k) => ((k * 1103515245 + 12345) >>> 8) % 100 >= 35);
}
function size() {
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  build();
  if (reduce) frame(0);
}

function frame(t) {
  lean.x += (lean.tx - lean.x) * 0.06; lean.y += (lean.ty - lean.y) * 0.06;
  ctx.clearRect(0, 0, W, H);
  for (const layer of layers) for (const n of layer) {
    n.x = n.ax + Math.sin(t * 0.00022 + n.ph) * n.amp + Math.sin(t * 0.00007 + n.dph) * n.damp + lean.x * 26 * n.depth;
    n.y = n.ay + Math.cos(t * 0.00018 + n.ph * 1.3) * n.amp * 0.8 + Math.cos(t * 0.00006 + n.dph * 1.1) * n.damp * 0.8 + lean.y * 18 * n.depth;
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(${BASE},0.08)`;
  for (const [a, b] of edges) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  for (const layer of layers) for (const n of layer) {
    const c = n.accent ? ACC : BASE;
    const s = Math.sin(t * n.gsp + n.gph);
    let glow = s > 0 ? Math.pow(s, 6) : 0;
    if (ptr.on) { const d = Math.hypot(ptr.x - n.x, ptr.y - n.y); if (d < 150) glow = Math.max(glow, (1 - d / 150) * 0.8); }
    const hr = n.r * 4 * (0.6 + glow * 2);
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, hr);
    g.addColorStop(0, `rgba(${c},${0.025 + glow * (n.accent ? 0.2 : 0.15)})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, hr, 0, 6.283); ctx.fill();
    ctx.fillStyle = `rgba(${c},${Math.min(0.85, 0.14 + glow * 0.6)})`;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill();
  }
  // The fluorescent word keeps its slow wave and leans with the pointer or the phone.
  if (hl) hl.style.setProperty("--hl", ((t * 0.04 + lean.x * 40) % 200) + "%");
}

let raf = 0, running = false;
const loop = (t) => { if (!running) return; frame(t); raf = requestAnimationFrame(loop); };
const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
const stop = () => { running = false; cancelAnimationFrame(raf); };

addEventListener("resize", size);
size();
if (!reduce) {
  addEventListener("pointermove", (e) => {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true;
    if (e.pointerType === "mouse") { lean.tx = (e.clientX / W) * 2 - 1; lean.ty = (e.clientY / H) * 2 - 1; }
  }, { passive: true });
  document.addEventListener("pointerleave", () => { ptr.on = false; lean.tx = lean.ty = 0; });
  addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") ptr.on = false; });
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    lean.tx = Math.max(-1, Math.min(1, e.gamma / 30));
    lean.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  start();
}

/* ---------- contact: the round button unfolds into the form ---------- */
const fab = document.querySelector(".fab");
const openBtn = fab.querySelector(".fab-btn");
const panel = fab.querySelector(".panel");
const form = panel.querySelector("form");
const statusEl = panel.querySelector(".status");
const sendBtn = panel.querySelector(".send");
let timer = 0;

function fit() { fab.style.setProperty("--panel-h", Math.min(panel.offsetHeight, innerHeight - 40) + "px"); }
function open() {
  if (fab.dataset.state !== "closed") return;
  clearTimeout(timer);
  panel.hidden = false;
  fit();
  fab.dataset.state = "opening";
  openBtn.setAttribute("aria-expanded", "true");
  timer = setTimeout(() => { fab.dataset.state = "open"; (panel.classList.contains("done") ? panel.querySelector(".close") : form.naam).focus({ preventScroll: true }); }, reduce ? 0 : 260);
}
function close() {
  if (fab.dataset.state === "closed") return;
  clearTimeout(timer);
  fab.dataset.state = "closed";
  openBtn.setAttribute("aria-expanded", "false");
  timer = setTimeout(() => { panel.hidden = true; }, reduce ? 0 : 420);
  openBtn.focus({ preventScroll: true });
}
openBtn.addEventListener("click", open);
panel.querySelector(".close").addEventListener("click", close);
addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
document.addEventListener("pointerdown", (e) => { if (fab.dataset.state === "open" && !fab.contains(e.target)) close(); });
addEventListener("resize", () => { if (fab.dataset.state !== "closed") fit(); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = { naam: form.naam.value.trim(), email: form.email.value.trim(), bericht: form.bericht.value.trim(), website: form.website.value };
  statusEl.className = "status";
  if (!data.naam || !data.bericht || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    statusEl.className = "status err";
    statusEl.textContent = "Vul je naam, een geldig e-mailadres en een bericht in.";
    fit();
    return;
  }
  sendBtn.disabled = true; statusEl.textContent = "Versturen…";
  try {
    const r = await fetch("/contact/verstuur.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error("send");
    form.remove();
    const p = document.createElement("p");
    p.className = "thanks"; p.textContent = "Bedankt! We nemen snel contact met je op.";
    panel.querySelector("h2").after(p);
    panel.classList.add("done");
    fit();
  } catch (err) {
    statusEl.className = "status err";
    statusEl.innerHTML = 'Versturen lukt nu niet. Mail ons op <a href="mailto:hello@flii.nl">hello@flii.nl</a>.';
    fit();
    sendBtn.disabled = false;
  }
});
