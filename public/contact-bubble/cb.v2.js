/* Contactbubbel: rond knopje rechtsonder dat Sten's contactkaart opent.
   Gebruik: <script src="/contact-bubble/cb.v1.js" data-bottom="16" defer></script> */
(function () {
  "use strict";
  if (document.getElementById("fcb")) return;
  var me = document.currentScript;
  var bottom = (me && me.getAttribute("data-bottom")) || "16";
  var PHOTO = "/img/sten-bossong.jpg";
  var TEL = "+31640881169", TEL_SHOW = "06 40 88 11 69";

  var css =
    "#fcb{position:fixed;right:16px;bottom:calc(max(" + bottom + "px,env(safe-area-inset-bottom)) );z-index:45;font-family:Inter,system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:flex-end;gap:10px}" +
    "#fcb .fcb-btn{position:relative;width:52px;height:52px;border-radius:50%;border:0;padding:0;cursor:pointer;background:#E7255A;color:#fff;display:grid;place-items:center;box-shadow:0 10px 26px rgba(231,37,90,.32);transition:transform .2s cubic-bezier(.2,.8,.2,1),background .2s}" +
    "#fcb .fcb-btn:hover{background:#D01C4E}" +
    "#fcb .fcb-btn>svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}" +
    "#fcb .fcb-btn:hover{transform:translateY(-2px)}" +
    "#fcb .fcb-btn:focus-visible{outline:2px solid #E7255A;outline-offset:4px}" +
    "#fcb .fcb-card{width:min(300px,calc(100vw - 32px));background:#FBFAF7;color:#171717;border-radius:18px;padding:16px;box-shadow:0 18px 50px rgba(23,23,23,.18),0 0 0 1px rgba(23,23,23,.06);transform-origin:bottom right;animation:fcb-in .28s cubic-bezier(.2,.8,.2,1)}" +
    "#fcb .fcb-card[hidden]{display:none}" +
    "#fcb .fcb-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}" +
    "#fcb .fcb-head img{width:52px;height:52px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #fff,0 0 0 3px rgba(231,37,90,.35)}" +
    "#fcb .fcb-head strong{display:block;font-size:16px;line-height:1.2}" +
    "#fcb .fcb-head a{font-size:13px;color:#8B887E;text-decoration:none}" +
    "#fcb .fcb-head a:hover{color:#E7255A}" +
    "#fcb .fcb-x{margin-left:auto;align-self:flex-start;width:28px;height:28px;border:0;background:none;border-radius:50%;cursor:pointer;color:#8B887E;display:grid;place-items:center}" +
    "#fcb .fcb-x:hover{background:rgba(23,23,23,.06);color:#171717}" +
    "#fcb .fcb-x svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}" +
    "#fcb .fcb-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;text-decoration:none;color:#171717;font-size:14px;background:#fff;box-shadow:inset 0 0 0 1px rgba(23,23,23,.07);transition:box-shadow .2s}" +
    "#fcb .fcb-row+.fcb-row{margin-top:8px}" +
    "#fcb .fcb-row:hover{box-shadow:inset 0 0 0 1px #E7255A}" +
    "#fcb .fcb-row svg{width:18px;height:18px;flex:none}" +
    "#fcb .fcb-row span{display:block;font-size:12px;color:#8B887E;line-height:1.2}" +
    "#fcb .fcb-row b{display:block;font-weight:600;line-height:1.3}" +
    "@keyframes fcb-in{from{opacity:0;transform:translateY(8px) scale(.96)}}" +
    "@media (prefers-reduced-motion:reduce){#fcb .fcb-card{animation:none}#fcb .fcb-btn{transition:none}}";

  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.2c-.5.4-1.3 0-1.3-.6V17A2.5 2.5 0 0 1 4 14.5z"/></svg>';
  var PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#E7255A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.2 2 2 0 016.5 3z"/></svg>';
  var WA = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="#25D366"><path d="M12 2.2A9.7 9.7 0 0 0 3.7 16.9L2.3 21.8l5-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';
  var WEB = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#E7255A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></svg>';

  var wrap = document.createElement("div");
  wrap.id = "fcb";
  wrap.innerHTML =
    '<section class="fcb-card" id="fcb-card" role="dialog" aria-label="Contact met Sten Bossong" hidden>' +
      '<div class="fcb-head"><img src="' + PHOTO + '" alt="" width="52" height="52"><div><strong>Sten Bossong</strong>' +
      '<a href="https://flii.nl" target="_blank" rel="noopener">Flii Media</a></div>' +
      '<button class="fcb-x" type="button" aria-label="Sluiten">' + X + "</button></div>" +
      '<a class="fcb-row" href="tel:' + TEL + '">' + PHONE + "<div><span>Bellen</span><b>" + TEL_SHOW + "</b></div></a>" +
      '<a class="fcb-row" href="https://wa.me/' + TEL.slice(1) + '" target="_blank" rel="noopener">' + WA + "<div><span>WhatsApp</span><b>Stuur een bericht</b></div></a>" +
      '<a class="fcb-row" href="https://flii.nl" target="_blank" rel="noopener">' + WEB + "<div><span>Website</span><b>flii.nl</b></div></a>" +
    "</section>" +
    '<button class="fcb-btn" type="button" aria-label="Contact met Sten Bossong" aria-expanded="false" aria-controls="fcb-card">' +
      CHAT + "</button>";
  document.body.appendChild(wrap);

  var card = wrap.querySelector(".fcb-card"), btn = wrap.querySelector(".fcb-btn");
  function set(open) {
    card.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) card.querySelector(".fcb-row").focus({ preventScroll: true });
  }
  btn.addEventListener("click", function () { set(card.hidden); });
  wrap.querySelector(".fcb-x").addEventListener("click", function () { set(false); btn.focus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !card.hidden) { set(false); btn.focus(); } });
  document.addEventListener("pointerdown", function (e) { if (!card.hidden && !wrap.contains(e.target)) set(false); });
})();
