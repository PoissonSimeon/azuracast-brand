/* =======================================================================
   OMEINS!! — Thème webradio AzuraCast (JS)  (v7)
   À coller dans : Admin → Branding → « Custom JS for Public Pages »
   ======================================================================= */
(function () {

  console.info('[omeins] custom JS chargé');

  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css';
  document.head.appendChild(l);

  function clearStaticBackground() {
    if (document.documentElement) document.documentElement.style.setProperty('background-image', 'none', 'important');
    if (document.body) {
      document.body.style.setProperty('background-image', 'none', 'important');
      document.body.style.setProperty('background-color', '#000', 'important');
    }
    ['#page-wrapper', '#main', '#public-radio-player', '.public-page'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.style.setProperty('background', 'transparent', 'important');
        el.style.setProperty('background-image', 'none', 'important');
      });
    });
  }

  /* CŒUR DU FIX : on efface tous les fonds/bordures internes du lecteur,
     puis on ré-applique le look "carte" sur le contour le plus externe.
     Aucune dépendance aux classes internes inconnues. -------------------- */
  function styleCard() {
    var root = document.querySelector('#public-radio-player');
    if (!root) return;

    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === 'IMG') continue;                       // garde le halo de la pochette
      if (el.closest('.radio-control-play-button')) continue;   // garde le bouton play violet
      if (el.matches('progress, .progress, .progress-bar, input[type="range"]')) continue; // garde barre + volume
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('border-color', 'transparent', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
    }

    // Trouve le .card le plus externe (non contenu dans un autre .card)
    var cards = Array.prototype.slice.call(root.querySelectorAll('.card, .radio-player-widget'));
    var outer = null;
    for (var j = 0; j < cards.length; j++) {
      var nested = false;
      for (var k = 0; k < cards.length; k++) {
        if (cards[k] !== cards[j] && cards[k].contains(cards[j])) { nested = true; break; }
      }
      if (!nested) { outer = cards[j]; break; }
    }
    if (outer) {
      outer.style.setProperty('background', 'transparent', 'important');
      outer.style.setProperty('border', '1px solid #bd00ff66', 'important');
      outer.style.setProperty('border-radius', '1.5rem', 'important');
      outer.style.setProperty('box-shadow', '0 0 30px #bd00ff26', 'important');
      outer.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      outer.style.setProperty('backdrop-filter', 'none', 'important');
    }
  }

  function fixProgress() {
    document.querySelectorAll('progress').forEach(function (p) {
      p.style.setProperty('accent-color', '#bd00ff', 'important');
    });
    document.querySelectorAll('.time-display-progress *, .progress *').forEach(function (el) {
      if (/width\s*:/.test(el.getAttribute('style') || '')) {
        el.style.setProperty('background-color', '#bd00ff', 'important');
        el.style.setProperty('background-image', 'none', 'important');
      }
    });
  }

  function initFireflies() {
    if (document.getElementById('omeins-fireflies')) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'omeins-fireflies';
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    console.info('[omeins] lucioles initialisées');
    var pts = [];
    function Pt() {
      this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
      this.s = Math.random() * 1.5 + 0.5;
      this.sx = (Math.random() - 0.5) * 0.12; this.sy = (Math.random() - 0.5) * 0.12;
      this.o = Math.random(); this.fd = Math.random() > 0.5 ? 1 : -1;
    }
    Pt.prototype.update = function () {
      this.x += this.sx; this.y += this.sy; this.o += 0.0025 * this.fd;
      if (this.o >= 0.85) this.fd = -1; if (this.o <= 0.12) this.fd = 1;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
      }
    };
    Pt.prototype.draw = function () {
      ctx.fillStyle = 'rgba(255,255,255,' + this.o + ')';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fill();
    };
    function init() {
      pts = [];
      var n = Math.min(Math.floor(canvas.width * canvas.height * 0.000056), window.innerWidth < 768 ? 20 : 130);
      for (var i = 0; i < n; i++) pts.push(new Pt());
    }
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < pts.length; i++) { pts[i].update(); pts[i].draw(); }
      requestAnimationFrame(loop);
    }
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); }
    resize(); window.addEventListener('resize', resize); loop();
  }

  function boot() { clearStaticBackground(); styleCard(); initFireflies(); fixProgress(); }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  setInterval(function () {
    if (!document.getElementById('omeins-fireflies')) initFireflies();
    clearStaticBackground(); styleCard(); fixProgress();
  }, 800);

})();
