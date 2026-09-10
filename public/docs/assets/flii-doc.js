/* Flii Media documentspeler: tabs, pijlen, toetsenbord, vegen en schalen. */
/* Slidebediening: tabs, pijlen, toetsenbord en vegen. */
(function () {
  var slides = [].slice.call(document.querySelectorAll('.sheet'));
  var tabs   = [].slice.call(document.querySelectorAll('.nd-tab'));
  var vorige = document.getElementById('nd-vorige');
  var volgende = document.getElementById('nd-volgende');
  var teller = document.getElementById('nd-tel');
  var pos = 0;

  function toon(i) {
    pos = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, k) { s.classList.toggle('actief', k === pos); });
    tabs.forEach(function (t, k) { t.classList.toggle('actief', k === pos);
      t.setAttribute('aria-current', k === pos ? 'true' : 'false'); });
    vorige.disabled = pos === 0;
    volgende.disabled = pos === slides.length - 1;
    teller.textContent = (pos + 1) + ' / ' + slides.length;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (history.replaceState) history.replaceState(null, '', '#s' + (pos + 1));
  }

  tabs.forEach(function (t, k) { t.addEventListener('click', function () { toon(k); }); });
  vorige.addEventListener('click', function () { toon(pos - 1); });
  volgende.addEventListener('click', function () { toon(pos + 1); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); toon(pos + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); toon(pos - 1); }
    if (e.key === 'Home') { e.preventDefault(); toon(0); }
    if (e.key === 'End') { e.preventDefault(); toon(slides.length - 1); }
  });

  var startX = null;
  document.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var d = e.changedTouches[0].clientX - startX;
    if (Math.abs(d) > 60) toon(pos + (d < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });

  var uit = (location.hash.match(/^#s(\d+)$/) || [])[1];
  toon(uit ? parseInt(uit, 10) - 1 : 0);
})();
/* Slides schalen op de helft van de beschikbare ruimte. */
(function () {
  function fit() {
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight - 128;
    /* Passend maken volstaat: de hoogte begrenst al tot ruim onder ware grootte. */
    var s = Math.min((w - 28) / 1240, h / 877);
    document.documentElement.style.setProperty('--scale', Math.min(1, Math.max(0.22, s)));
  }
  fit(); window.addEventListener('resize', fit);
})();
