/* Scroll experience: progress bar, hero parallax, staggered reveals, tile spotlight */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero'), bar = document.querySelector('.progress');
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };

  document.querySelectorAll('.tile, .cell').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  if (reduce) return;
  root.classList.add('js');

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('in'); io.unobserve(el);
      setTimeout(function () { el.classList.remove('rv', 'in'); el.style.transitionDelay = ''; }, 1300);
    });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('section:not(.hero) h2, .rows li, .cell, .tile, #contact .lead').forEach(function (el) {
    el.classList.add('rv');
    el.style.transitionDelay = Math.min([].indexOf.call(el.parentNode.children, el), 5) * 80 + 'ms';
    io.observe(el);
  });

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight, max = root.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    hero.style.setProperty('--p', clamp(y / (hero.offsetHeight * .8)).toFixed(3));
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
})();
