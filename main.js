(function () {
  /* Hero: live K-means clustering on a canvas */
  var hero = document.querySelector('.hero');
  var c = document.getElementById('cluster');
  var g = c.getContext('2d');
  var COLORS = ['#8fd8ff', '#ffd27a', '#b69cff'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, pts = [], cents = [], last = 0, run = true, it = 0;
  var iterEl = document.getElementById("iter"), stateEl = document.getElementById("state");

  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }

  function seed() {
    var blobs = [[.62, .28], [.88, .6], [.58, .8]];
    pts = [];
    for (var i = 0; i < 150; i++) {
      var b = blobs[i % 3];
      pts.push({ x: b[0] + gauss() * .09, y: b[1] + gauss() * .12, k: 0 });
    }
    reseed();
  }

  function reseed() {
    cents = [];
    for (var i = 0; i < 3; i++) {
      var x = .45 + Math.random() * .5, y = .15 + Math.random() * .7;
      cents.push({ x: x, y: y, tx: x, ty: y });
    }
    last = 0; it = 0;
    if (reduce) {
      for (var s = 0; s < 12; s++) step();
      cents.forEach(function (k) { k.x = k.tx; k.y = k.ty; });
      draw();
    }
  }

  // one Lloyd iteration: assign points, then move centroids to the mean
  function step() {
    var b = cents.map(function (k) { return k.tx + k.ty; });
    lloyd();
    var d = 0; cents.forEach(function (k, i) { d += Math.abs(k.tx + k.ty - b[i]); });
    it++;
    if (iterEl) { iterEl.textContent = 'iteration ' + it; stateEl.textContent = d < 1e-3 ? 'converged' : 'clustering'; }
  }

  function lloyd() {
    pts.forEach(function (p) {
      var d = 1e9;
      cents.forEach(function (k, i) {
        var e = Math.pow(p.x - k.tx, 2) + Math.pow(p.y - k.ty, 2);
        if (e < d) { d = e; p.k = i; }
      });
    });
    cents.forEach(function (k, i) {
      var m = pts.filter(function (p) { return p.k === i; });
      if (!m.length) return;
      k.tx = m.reduce(function (s, p) { return s + p.x; }, 0) / m.length;
      k.ty = m.reduce(function (s, p) { return s + p.y; }, 0) / m.length;
    });
  }

  function draw() {
    g.clearRect(0, 0, W, H);
    pts.forEach(function (p) {
      var k = cents[p.k];
      g.strokeStyle = COLORS[p.k] + '22';
      g.beginPath(); g.moveTo(p.x * W, p.y * H); g.lineTo(k.x * W, k.y * H); g.stroke();
    });
    pts.forEach(function (p) {
      g.fillStyle = COLORS[p.k];
      g.beginPath(); g.arc(p.x * W, p.y * H, 3.2, 0, 7); g.fill();
    });
    g.lineWidth = 2; g.strokeStyle = '#e9ecf5';
    cents.forEach(function (k, i) {
      g.fillStyle = COLORS[i];
      g.beginPath(); g.arc(k.x * W, k.y * H, 9, 0, 7); g.fill(); g.stroke();
    });
    g.lineWidth = 1;
  }

  function loop(t) {
    if (run) {
      if (t - last > 800) { step(); last = t; }
      cents.forEach(function (k) { k.x += (k.tx - k.x) * .08; k.y += (k.ty - k.y) * .08; });
      draw();
    }
    requestAnimationFrame(loop);
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) draw();
  }

  window.addEventListener('resize', resize);
  hero.addEventListener('click', function (e) { if (!e.target.closest('a, button')) reseed(); });
  if (!reduce) hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    hero.style.setProperty('--tx', (((e.clientX - r.left) / r.width - .5) * 2).toFixed(2));
    hero.style.setProperty('--ty', (((e.clientY - r.top) / r.height - .5) * 2).toFixed(2));
  });
  new IntersectionObserver(function (es) { run = es[0].isIntersecting; }).observe(hero);
  resize(); seed();
  if (!reduce) requestAnimationFrame(loop);

  /* Nav: highlight the section in view */
  var links = [].slice.call(document.querySelectorAll('.nav nav a'));
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
