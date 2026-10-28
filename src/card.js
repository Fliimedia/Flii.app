import "./card.css";

// Old links (#/prijzen, #loop, ...) all land on this one page now.
if (location.hash) history.replaceState(null, "", location.pathname + location.search);

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- drifting clouds: soft puffs pre-rendered once, layered for depth ---------- */
const canvas = document.querySelector(".sky");
const ctx = canvas.getContext("2d");
const hl = document.querySelector(".hl");
const dpr = Math.min(devicePixelRatio || 1, 2);
let W = 0, H = 0, clouds = [];
const lean = { x: 0, y: 0, tx: 0, ty: 0 }; // eased -1..1 from pointer or device tilt

function puffCloud(w) {
  const h = Math.round(w * 0.5), pad = Math.round(w * 0.32);
  const c = document.createElement("canvas");
  c.width = w + pad * 2; c.height = h + pad * 2;
  const g = c.getContext("2d");
  const base = pad + h * 0.78;
  const n = 7 + Math.floor(Math.random() * 6);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = pad + w * (0.12 + 0.76 * t) + (Math.random() - 0.5) * w * 0.06;
    const arch = Math.sin(Math.PI * t); // taller in the middle
    const r = w * (0.11 + 0.13 * arch + Math.random() * 0.05);
    const y = base - r * (0.35 + 0.55 * arch) + (Math.random() - 0.5) * r * 0.2;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, "rgba(255,255,255,1)");
    rg.addColorStop(0.78, "rgba(255,255,255,1)");
    rg.addColorStop(0.9, "rgba(255,255,255,0.55)");
    rg.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  }
  // a flat, soft base like real cumulus
  const bg = g.createRadialGradient(pad + w / 2, base, 0, pad + w / 2, base, w * 0.48);
  bg.addColorStop(0, "rgba(255,255,255,1)"); bg.addColorStop(0.8, "rgba(255,255,255,0.9)"); bg.addColorStop(1, "rgba(255,255,255,0)");
  g.save(); g.translate(pad + w / 2, base); g.scale(1, 0.32); g.translate(-(pad + w / 2), -base);
  g.fillStyle = bg; g.beginPath(); g.arc(pad + w / 2, base, w * 0.48, 0, 6.283); g.fill(); g.restore();
  // warm shade on the underside, tinted with the page colours
  g.globalCompositeOperation = "source-atop";
  const sh = g.createLinearGradient(0, pad, 0, pad + h * 1.05);
  sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.5, "rgba(240,222,225,0.25)"); sh.addColorStop(1, "rgba(205,176,182,0.7)");
  g.fillStyle = sh; g.fillRect(0, 0, c.width, c.height);
  return c;
}

function build() {
  const mobile = W < 760;
  const scale = mobile ? 0.6 : 1;
  // [count, min width, max width, y range (0-1 of height), speed px/s, opacity, depth]
  const layers = [
    [mobile ? 3 : 5, 160, 280, [0.05, 0.45], 5, 0.55, 0.3],
    [mobile ? 3 : 4, 260, 420, [0.15, 0.7], 9, 0.8, 0.6],
    [mobile ? 3 : 5, 380, 640, [0.72, 1.02], 15, 0.97, 1],
  ];
  clouds = [];
  for (const [count, wMin, wMax, [y0, y1], speed, alpha, depth] of layers) {
    for (let i = 0; i < count; i++) {
      const w = Math.round((wMin + Math.random() * (wMax - wMin)) * scale);
      const img = puffCloud(w);
      clouds.push({ img, x: ((i + Math.random() * 0.8) / count) * (W + img.width) - img.width * 0.5,
        y: H * (y0 + Math.random() * (y1 - y0)) - img.height * 0.6, speed: speed * (0.8 + Math.random() * 0.4) * (mobile ? 0.7 : 1), alpha, depth });
    }
  }
}
function size() {
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  build();
  draw(0);
}

let last = 0;
function draw(t) {
  const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
  lean.x += (lean.tx - lean.x) * 0.05; lean.y += (lean.ty - lean.y) * 0.05;
  ctx.clearRect(0, 0, W, H);
  for (const c of clouds) {
    c.x -= c.speed * dt;
    if (c.x < -c.img.width - 40) { c.x = W + 40 + Math.random() * 120; }
    ctx.globalAlpha = c.alpha;
    ctx.drawImage(c.img, c.x - lean.x * 30 * c.depth, c.y - lean.y * 14 * c.depth, c.img.width, c.img.height);
  }
  ctx.globalAlpha = 1;
  // The fluorescent word keeps its slow wave and leans with the pointer or the phone.
  if (hl) hl.style.setProperty("--hl", ((t * 0.04 + lean.x * 40) % 200) + "%");
}

let raf = 0, running = false;
const loop = (t) => { if (!running) return; draw(t); raf = requestAnimationFrame(loop); };
const start = () => { if (!running && !reduce) { running = true; last = 0; raf = requestAnimationFrame(loop); } };
const stop = () => { running = false; cancelAnimationFrame(raf); };

addEventListener("resize", size);
size();
if (!reduce) {
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") { lean.tx = (e.clientX / W) * 2 - 1; lean.ty = (e.clientY / H) * 2 - 1; }
  }, { passive: true });
  document.addEventListener("pointerleave", () => { lean.tx = lean.ty = 0; });
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    lean.tx = Math.max(-1, Math.min(1, e.gamma / 30));
    lean.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  start();
}

/* ---------- contact: the button unfolds into the form ---------- */
const cta = document.querySelector(".cta");
const openBtn = cta.querySelector(".cta-btn");
const panel = cta.querySelector(".panel");
const form = panel.querySelector("form");
const statusEl = panel.querySelector(".status");
const sendBtn = panel.querySelector(".send");
let timer = 0;

function btnWidth() { cta.style.setProperty("--btn-w", openBtn.offsetWidth + "px"); }
function fit() { cta.style.setProperty("--panel-h", Math.min(panel.offsetHeight, innerHeight - 40) + "px"); }
btnWidth();
if (document.fonts) document.fonts.ready.then(btnWidth);
addEventListener("resize", () => { btnWidth(); if (cta.dataset.state !== "closed") fit(); });

function open() {
  if (cta.dataset.state !== "closed") return;
  clearTimeout(timer);
  panel.hidden = false;
  fit();
  cta.dataset.state = "opening";
  openBtn.setAttribute("aria-expanded", "true");
  timer = setTimeout(() => { cta.dataset.state = "open"; // On touch screens focusing a field pops up the keyboard; focus the panel instead.
    const touch = matchMedia("(pointer: coarse)").matches;
    (panel.classList.contains("done") || touch ? panel.querySelector(".close") : form.naam).focus({ preventScroll: true }); }, reduce ? 0 : 260);
}
function close() {
  if (cta.dataset.state === "closed") return;
  clearTimeout(timer);
  cta.dataset.state = "closed";
  openBtn.setAttribute("aria-expanded", "false");
  timer = setTimeout(() => { panel.hidden = true; }, reduce ? 0 : 420);
  openBtn.focus({ preventScroll: true });
}
openBtn.addEventListener("click", () => {
  if (reduce) return open();
  if (openBtn.classList.contains("go")) return;
  // swipe right, arrow turns up, small hop - then the form unfolds
  openBtn.classList.add("go");
  setTimeout(() => { open(); setTimeout(() => openBtn.classList.remove("go"), 350); }, 640);
});
panel.querySelector(".close").addEventListener("click", close);
addEventListener("keydown", (e) => { if (e.key !== "Escape" || !document.getElementById("cc").hidden) return; if (!prefs.hidden) prefsClose(); else close(); });
document.addEventListener("pointerdown", (e) => { if (cta.dataset.state === "open" && !cta.contains(e.target)) close(); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = { naam: form.naam.value.trim(), email: form.email.value.trim(), bericht: form.bericht.value.trim(), website: form.website.value };
  statusEl.className = "status";
  if (!data.naam || !data.bericht || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || /^\+?[0-9][0-9\s().-]{6,}$/.test(data.email))) {
    statusEl.className = "status err";
    statusEl.textContent = "Vul je naam, een geldig e-mailadres of telefoonnummer en een bericht in.";
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
    sendBtn.disabled = false;
    fit();
  }
});

/* ---------- preferences: cookie choices, kept in this browser ---------- */
const PREFKEY = "flii-cookies";
const prefs = document.querySelector(".prefs");
const prefsBack = document.querySelector(".prefs-back");
const prefsBtn = document.querySelector(".prefs-btn");
function readPrefs() { try { return JSON.parse(localStorage.getItem(PREFKEY) || "null") || {}; } catch (e) { return {}; } }
// Other scripts can read the choice here, or listen for "flii:consent".
window.fliiConsent = Object.assign({ noodzakelijk: true, statistieken: true, marketing: false }, readPrefs());
function prefsOpen() {
  const p = readPrefs();
  prefs.querySelector('[name="statistieken"]').checked = "statistieken" in p ? !!p.statistieken : true;
  prefs.querySelector('[name="marketing"]').checked = !!p.marketing;
  prefsBack.hidden = false; prefs.hidden = false;
  prefsBtn.setAttribute("aria-expanded", "true");
  prefs.querySelector('[name="statistieken"]').focus({ preventScroll: true });
}
function prefsClose() {
  prefsBack.hidden = true; prefs.hidden = true;
  prefsBtn.setAttribute("aria-expanded", "false");
  prefsBtn.focus({ preventScroll: true });
}
prefsBtn.addEventListener("click", prefsOpen);
prefsBack.addEventListener("click", prefsClose);
prefs.querySelector(".close").addEventListener("click", prefsClose);
function saveChoice(stat, mkt) {
  const choice = { noodzakelijk: true, statistieken: stat, marketing: mkt, opgeslagen: new Date().toISOString() };
  try { localStorage.setItem(PREFKEY, JSON.stringify(choice)); } catch (e) {}
  window.fliiConsent = choice;
  dispatchEvent(new CustomEvent("flii:consent", { detail: choice }));
}
prefs.querySelector(".prefs-save").addEventListener("click", () => {
  saveChoice(prefs.querySelector('[name="statistieken"]').checked, prefs.querySelector('[name="marketing"]').checked);
  hideCc();
  prefsClose();
});

// Kleine cookiemelding: alleen zolang er nog geen keuze is opgeslagen.
const cc = document.getElementById("cc");
const ccBack = document.getElementById("cc-back");
function hideCc() { cc.hidden = true; ccBack.hidden = true; }
// Eerste bezoek: een keuze is verplicht voordat de site bruikbaar is.
if (!Object.keys(readPrefs()).length) {
  cc.hidden = false; ccBack.hidden = false;
  cc.querySelector(".cc-yes").focus({ preventScroll: true });
  cc.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const b = [...cc.querySelectorAll("button")], i = b.indexOf(document.activeElement);
    e.preventDefault(); b[(i + (e.shiftKey ? b.length - 1 : 1)) % b.length].focus();
  });
}
cc.querySelector(".cc-yes").addEventListener("click", () => { saveChoice(true, true); hideCc(); });
cc.querySelector(".cc-no").addEventListener("click", () => { saveChoice(true, false); hideCc(); });
