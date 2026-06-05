/* =======================================================================
   OMEINS!! — Thème webradio AzuraCast (JS)  (v10 — lecteur vertical disque)
   À coller dans : Admin → Branding → « Custom JS for Public Pages »
   ======================================================================= */
(function () {

  console.info('[omeins] custom JS chargé');

  var ICON = {
    play:  '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    vol:   '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12z"/></svg>'
  };

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css';
  document.head.appendChild(link);

  var flashUntil = 0;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

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

  /* Garde le lecteur AzuraCast d'origine fonctionnel mais hors écran ------ */
  function hideOriginal() {
    ['.card-title', '.stations.nowplaying', '.stations', '.nowplaying'].forEach(function (sel) {
      document.querySelectorAll('#public-radio-player ' + sel).forEach(function (el) {
        if (el.closest('#omeins-player')) return;
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('left', '-9999px', 'important');
        el.style.setProperty('top', '0', 'important');
        el.style.setProperty('width', '1px', 'important');
        el.style.setProperty('height', '1px', 'important');
        el.style.setProperty('overflow', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      });
    });
  }

  /* Carte extérieure : fond transparent, bordure + halo, badge EN DIRECT -- */
  function styleCard() {
    var root = $('#public-radio-player');
    if (!root) return;

    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === 'IMG' || el.tagName === 'CANVAS') continue;
      if (el.closest('.omeins-keep')) continue;
      if (el.closest('.radio-control-play-button')) continue;
      if (el.matches('progress, .progress, .progress-bar, input[type="range"]')) continue;
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('border-color', 'transparent', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
    }

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
      outer.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      outer.style.setProperty('backdrop-filter', 'none', 'important');
      outer.style.setProperty('position', 'relative', 'important');
      if (Date.now() > flashUntil) outer.style.setProperty('box-shadow', '0 0 30px #bd00ff26', 'important');
      if (!outer.querySelector('.omeins-live')) {
        var badge = document.createElement('div');
        badge.className = 'omeins-keep omeins-live';
        badge.innerHTML = '<span class="dot"></span>EN DIRECT';
        outer.appendChild(badge);
      }
    }
  }

  /* Construit l'interface verticale custom ------------------------------- */
  function buildPlayer() {
    var root = $('#public-radio-player');
    if (!root || document.getElementById('omeins-player')) return;
    var host = $('.card-body', root) || $('.card', root) || root;

    var station = '';
    var ct = $('.card-title', root);
    if (ct) station = ct.textContent.trim();
    if (!station) station = 'RadiOmeins';

    var p = document.createElement('div');
    p.id = 'omeins-player';
    p.className = 'omeins-keep';
    p.innerHTML =
      '<div class="omeins-station">' + station + '</div>' +
      '<div class="omeins-track"></div>' +
      '<div class="omeins-artist"></div>' +
      '<div class="omeins-disc-wrap">' +
        '<div class="omeins-disc"><img class="omeins-disc-img" alt=""><div class="omeins-disc-grooves"></div></div>' +
        '<button class="omeins-play" type="button" aria-label="Lecture / Pause">' + ICON.play + '</button>' +
      '</div>' +
      '<div class="omeins-progress-wrap">' +
        '<span class="omeins-time omeins-time-played">--:--</span>' +
        '<div class="omeins-bar"><div class="omeins-bar-fill"></div></div>' +
        '<span class="omeins-time omeins-time-total">--:--</span>' +
      '</div>' +
      '<div class="omeins-vol-wrap">' +
        '<span class="omeins-mute" role="button" aria-label="Sourdine">' + ICON.vol + '</span>' +
        '<input class="omeins-vol" type="range" min="0" max="100" step="1" aria-label="Volume">' +
      '</div>';
    host.appendChild(p);

    // Play / pause -> on renvoie vers le vrai bouton AzuraCast
    p.querySelector('.omeins-play').addEventListener('click', function () {
      var real = $('.radio-control-play-button');
      if (real) real.click();
    });

    // Volume -> on renvoie vers le vrai slider AzuraCast (et fallback audio)
    var vol = p.querySelector('.omeins-vol');
    var realRange = $('.radio-control-volume-slider input[type="range"]');
    vol.value = realRange ? realRange.value : 75;
    vol.addEventListener('input', function () {
      var rr = $('.radio-control-volume-slider input[type="range"]');
      if (rr) {
        var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(rr, vol.value);
        rr.dispatchEvent(new Event('input', { bubbles: true }));
        rr.dispatchEvent(new Event('change', { bubbles: true }));
      }
      var a = $('audio'); if (a) a.volume = vol.value / 100;
    });

    // Icône volume -> mute AzuraCast
    p.querySelector('.omeins-mute').addEventListener('click', function () {
      var m = document.querySelector('.radio-control-volume button');
      if (m) m.click();
    });
  }

  /* Synchronise l'interface custom avec les données d'AzuraCast ---------- */
  function syncPlayer() {
    var p = document.getElementById('omeins-player');
    if (!p) return;

    var ct = $('.card-title');
    if (ct && ct.textContent.trim()) {
      var st = p.querySelector('.omeins-station');
      if (st && st.textContent !== ct.textContent.trim()) st.textContent = ct.textContent.trim();
    }

    var rt = $('.now-playing-title');
    var trackEl = p.querySelector('.omeins-track');
    if (rt && trackEl && trackEl.textContent !== rt.textContent) trackEl.textContent = rt.textContent;

    var ra = $('.now-playing-artist');
    var artEl = p.querySelector('.omeins-artist');
    if (artEl) { var av = ra ? ra.textContent.trim() : ''; if (artEl.textContent !== av) artEl.textContent = av; }

    var cover = $('img.album_art') || $('.now-playing-art img');
    var discImg = p.querySelector('.omeins-disc-img');
    if (cover && discImg && cover.src && discImg.src !== cover.src) discImg.src = cover.src;

    var bar = $('.time-display-progress .progress-bar') || $('.progress-bar');
    var fill = p.querySelector('.omeins-bar-fill');
    if (bar && fill) { var w = bar.style.width || '0%'; if (fill.style.width !== w) fill.style.width = w; }

    var played = $('.time-display-played'), total = $('.time-display-total');
    var pe = p.querySelector('.omeins-time-played'), te = p.querySelector('.omeins-time-total');
    if (played && pe && pe.textContent !== played.textContent) pe.textContent = played.textContent;
    if (total && te && te.textContent !== total.textContent) te.textContent = total.textContent;

    var audio = $('audio');
    var realBtn = $('.radio-control-play-button');
    var label = realBtn ? ((realBtn.getAttribute('aria-label') || realBtn.getAttribute('title') || '')).toLowerCase() : '';
    var playing = (label.indexOf('pause') !== -1) || (audio && !audio.paused && !audio.ended);
    var disc = p.querySelector('.omeins-disc');
    if (disc) disc.classList.toggle('spinning', !!playing);
    var btn = p.querySelector('.omeins-play');
    if (btn) {
      var want = playing ? 'pause' : 'play';
      if (btn.dataset.state !== want) { btn.innerHTML = ICON[want]; btn.dataset.state = want; }
    }
  }

  function watchTitle() {
    var t = $('.now-playing-title');
    if (!t || t.__omeinsWatched) return;
    t.__omeinsWatched = true;
    new MutationObserver(function () {
      var card = $('.radio-player-widget');
      var outer = card ? (card.closest('.card') || card) : null;
      if (!outer) return;
      flashUntil = Date.now() + 650;
      outer.style.transition = 'box-shadow .5s';
      outer.style.setProperty('box-shadow', '0 0 50px #bd00ff99', 'important');
      setTimeout(function () { outer.style.setProperty('box-shadow', '0 0 30px #bd00ff26', 'important'); }, 650);
    }).observe(t, { childList: true, characterData: true, subtree: true });
  }

  /* ---------- LUCIOLES ---------- */
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

  function maintain() {
    clearStaticBackground();
    styleCard();
    buildPlayer();
    hideOriginal();
    watchTitle();
    if (!document.getElementById('omeins-fireflies')) initFireflies();
  }

  function boot() { maintain(); initFireflies(); }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  setInterval(maintain, 800);   // structure : reconstruit / re-cache si Vue redessine
  setInterval(syncPlayer, 250); // contenu : titre, pochette, progression, play/pause

})();
