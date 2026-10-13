/* Cursor glow (follows the pointer, changes colour per section) and scroll-driven app showcases.
   Nothing here runs on its own: it only reacts to scrolling and pointer movement. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cl = function (v) { return Math.min(1, Math.max(0, v)); };
  var bg = document.getElementById('bg');
  var tracks = [].slice.call(document.querySelectorAll('.atrack'));
  var nums = [].slice.call(document.querySelectorAll('[data-count]'));
  nums.forEach(function (el) { el._t = el.closest('.atrack'); });

  function apps() {
    tracks.forEach(function (t) {
      var r = t.getBoundingClientRect(), p = reduce ? 1 : cl(-r.top / (r.height - innerHeight));
      t._p = p; t.style.setProperty('--p', p.toFixed(3));
    });
    nums.forEach(function (el) {
      var v = (+el.dataset.count) * cl((el._t._p - .05) / .75), dec = +el.dataset.dec || 0;
      el.textContent = (el.dataset.pre || '') + v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suf || '');
    });
  }

  var tick = false;
  function queue() { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; apps(); }); } }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  apps();
  if (reduce) return;

  addEventListener('pointermove', function (e) {
    bg.style.setProperty('--gx', e.clientX + 'px'); bg.style.setProperty('--gy', e.clientY + 'px');
  });
  tracks.forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.querySelector('.asticky').getBoundingClientRect(), nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      t.style.setProperty('--mx', (nx * 100).toFixed(1) + '%'); t.style.setProperty('--my', (ny * 100).toFixed(1) + '%');
      t.style.setProperty('--tx', ((nx - .5) * 2).toFixed(2)); t.style.setProperty('--ty', ((ny - .5) * 2).toFixed(2));
    });
  });

  var COL = { home: '#8fd8ff', about: '#b69cff', skills: '#8fd8ff', lab: '#ffd27a', contact: '#ffd27a', crystal: '#8fd8ff', scan: '#b69cff', ice: '#8fd8ff', mint: '#6ee7b7', violet: '#b69cff', amber: '#ffd27a' };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) bg.style.setProperty('--glow', COL[e.target.id || e.target.dataset.scene || e.target.dataset.theme] || '#8fd8ff');
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  document.querySelectorAll('#home, #about, #contact, .track, .atrack').forEach(function (el) { io.observe(el); });
})();

/* Pinned stages: trim the empty space above and below each one so content follows content */
(function () {
  var stages = [].slice.call(document.querySelectorAll('.track, .atrack'));
  var isStage = function (el) { return el && el.matches('.track, .atrack'); };
  function fit() {
    var H = window.innerHeight, g = H * .09;
    stages.forEach(function (t) {
      var c = t.querySelector('.acols') || t.querySelector('.copy');
      var e = Math.max(0, (H - c.offsetHeight) / 2), chained = isStage(t.previousElementSibling);
      t.style.marginTop = -Math.max(0, chained ? 2 * e - g : e - g) + 'px';
      t.style.marginBottom = isStage(t.nextElementSibling) ? '' : -Math.max(0, e - g) + 'px';
    });
  }
  addEventListener('resize', fit);
  addEventListener('load', fit);
  if (document.fonts) document.fonts.ready.then(fit);
  fit();
})();

/* Contact popup: every [data-contact] button opens it; each option opens its own app */
(function () {
  var dlg = document.getElementById('contactDialog');
  if (!dlg || !dlg.showModal) return;
  document.querySelectorAll('[data-contact]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); dlg.showModal(); });
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
})();

/* Smooth wheel scrolling: eases toward the target and stops by itself (mouse and trackpad only) */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches) return;
  var target = scrollY, cur = scrollY, raf = 0;
  function step() {
    cur += (target - cur) * .11;
    if (Math.abs(target - cur) < .4) { cur = target; raf = 0; } else raf = requestAnimationFrame(step);
    scrollTo({ top: cur, behavior: 'instant' });
  }
  addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.defaultPrevented || document.querySelector('dialog[open]')) return;
    e.preventDefault();
    if (!raf) { cur = target = scrollY; }
    var dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
    target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target + dy));
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: false });
  addEventListener('scroll', function () { if (!raf) cur = target = scrollY; }, { passive: true });
})();
