/* 3D scenes for the project stages: a crystal and a neural network that rotate with scroll */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cl = function (v) { return Math.min(1, Math.max(0, v)); };

  function crystal() {
    var V = [], F = [], E = [], P = [], i, x, y, z, R = .62, H = 1.1, n = 3, m = 4;
    for (i = 0; i < 12; i++) { var a = (i % 6) * Math.PI / 3; V.push([R * Math.cos(a), i < 6 ? -H : H, R * Math.sin(a)]); }
    V.push([0, H + .9, 0], [0, -H - .9, 0]);
    for (i = 0; i < 6; i++) { var j = (i + 1) % 6; F.push([i, j, 6 + j, 6 + i], [6 + i, 6 + j, 12], [j, i, 13]); }
    var b = V.length, id = function (x, y, z) { return b + (x * m + y) * n + z; };
    for (x = 0; x < n; x++) for (y = 0; y < m; y++) for (z = 0; z < n; z++) { V.push([(x - 1) * .3, (y - 1.5) * .5, (z - 1) * .3]); P.push(id(x, y, z)); }
    for (x = 0; x < n; x++) for (y = 0; y < m; y++) for (z = 0; z < n; z++) {
      if (x < n - 1) E.push([id(x, y, z), id(x + 1, y, z)]);
      if (y < m - 1) E.push([id(x, y, z), id(x, y + 1, z)]);
      if (z < n - 1) E.push([id(x, y, z), id(x, y, z + 1)]);
    }
    return { V: V, F: F, E: E, P: P };
  }

  function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }

  /* Image classifier: a robot scans an image, rays follow the scroll, then a box locks on */
  function robot(s, p, t) {
    var g = s.g, W = s.cv.clientWidth, H = s.cv.clientHeight, mob = W < 800;
    var U = mob ? W * .2 : Math.min(W, H) * .3, cy = mob ? H * .68 : H / 2, rx = mob ? W * .26 : W * .54, fx = mob ? W * .72 : W * .82;
    var fw = 1.5 * U, fh = 1.1 * U, fl = fx - fw / 2, ft = cy - fh / 2, cols = 12, rows = 9, cw = fw / cols, ch = fh / rows;
    var sp = cl(p / .75), lock = cl((p - .78) / .2), pulse = Math.sin(t * 40) * .5 + .5;
    var sy = ft + fh * sp, C = lock > 0 ? '255,210,122' : '182,156,255';
    var hx = rx - .45 * U, hy = cy - .75 * U, ey = hy + .3 * U, ex = rx + .2 * U;
    g.clearRect(0, 0, W, H);
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var u = (c + .5) / cols - .5, v = (r + .5) / rows - .5, obj = u * u / .09 + v * v / .12 < 1, seen = ft + (r + 1) * ch <= sy, base = .1 + ((c * 7 + r * 13) % 5) * .03;
      g.fillStyle = obj ? 'rgba(255,210,122,' + (.22 + (seen ? .55 : 0)) + ')' : seen ? 'rgba(182,156,255,' + (base + .12) + ')' : 'rgba(255,255,255,' + base + ')';
      g.fillRect(fl + c * cw + 1, ft + r * ch + 1, cw - 2, ch - 2);
    }
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.25)'; rr(g, fl - 6, ft - 6, fw + 12, fh + 12, 10); g.stroke();
    if (p > .01) {
      g.fillStyle = 'rgba(' + C + ',.14)'; g.strokeStyle = 'rgba(' + C + ',.55)';
      g.beginPath(); g.moveTo(ex, ey); g.lineTo(fl, sy); g.lineTo(fl + fw, sy); g.closePath(); g.fill(); g.stroke();
      g.shadowColor = 'rgb(' + C + ')'; g.shadowBlur = 14; g.lineWidth = 2.5; g.strokeStyle = 'rgb(' + C + ')';
      g.beginPath(); g.moveTo(fl - 6, sy); g.lineTo(fl + fw + 6, sy); g.stroke(); g.shadowBlur = 0;
    }
    if (lock > 0) {
      var k = 1.12 - .12 * lock, bw = fw * .6 * k, bh = fh * .7 * k, bx = fx - bw / 2, by = cy - bh / 2, L = .12 * U;
      g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,210,122,' + lock + ')';
      [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(function (q) {
        g.beginPath(); g.moveTo(q[0], q[1] + q[3] * L); g.lineTo(q[0], q[1]); g.lineTo(q[0] + q[2] * L, q[1]); g.stroke();
      });
      g.fillStyle = 'rgba(255,210,122,' + lock + ')'; g.fillRect(bx, by - 24, 104, 22);
      g.fillStyle = '#000'; g.font = '600 13px system-ui,sans-serif'; g.fillText('Object  ' + Math.round(97 * lock) + '%', bx + 8, by - 8);
    }
    g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.28)'; g.fillStyle = '#0c0c0f';
    rr(g, rx - .38 * U, cy - .1 * U, .76 * U, .7 * U, 12); g.fill(); g.stroke();
    g.fillStyle = '#111116'; rr(g, hx, hy, .9 * U, .6 * U, 14); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(rx, hy); g.lineTo(rx, hy - .2 * U); g.stroke();
    g.fillStyle = 'rgba(' + C + ',' + (.4 + .6 * pulse) + ')'; g.beginPath(); g.arc(rx, hy - .22 * U, .04 * U, 0, 7); g.fill();
    var ang = Math.atan2(sy - ey, fl + fw / 2 - rx);
    [-.2, .2].forEach(function (o) {
      g.fillStyle = '#000'; g.strokeStyle = 'rgb(' + C + ')'; g.beginPath(); g.arc(rx + o * U, ey, .1 * U, 0, 7); g.fill(); g.stroke();
      g.fillStyle = 'rgba(' + C + ',' + (.6 + .4 * pulse) + ')'; g.beginPath(); g.arc(rx + o * U + Math.cos(ang) * .04 * U, ey + Math.sin(ang) * .04 * U, .05 * U, 0, 7); g.fill();
    });
    g.fillStyle = 'rgba(' + C + ',.9)'; g.fillRect(rx - .15 * U, cy + .1 * U, .3 * U, 3);
    g.fillStyle = '#8e8e9a'; g.font = '13px system-ui,sans-serif';
    g.fillText(lock > 0 ? 'Classified' : 'Scanning ' + Math.round(sp * 100) + '%', fl, ft + fh + 28);
  }

  function draw(s, p, t) {
    if (s.rb) return robot(s, p, t);
    var g = s.g, W = s.cv.clientWidth, H = s.cv.clientHeight, m = s.m, mob = W < 800;
    var cx = mob ? W / 2 : W * .68, cy = mob ? H * .68 : H / 2, S = Math.min(W, H) * (mob ? .2 : .3) * (.8 + .3 * p);
    var ay = p * 6.283 + t, ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(.4), sb = Math.sin(.4);
    g.clearRect(0, 0, W, H);
    var R = m.V.map(function (v) {
      var x = v[0] * ca + v[2] * sa, z = -v[0] * sa + v[2] * ca, y = v[1] * cb - z * sb; z = v[1] * sb + z * cb;
      var k = 4 / (4 - z); return [cx + x * k * S, cy - y * k * S, z, k, x, y];
    });
    if (m.F) {
      g.strokeStyle = 'rgba(143,216,255,.2)';
      m.E.forEach(function (e) { g.beginPath(); g.moveTo(R[e[0]][0], R[e[0]][1]); g.lineTo(R[e[1]][0], R[e[1]][1]); g.stroke(); });
      g.fillStyle = 'rgba(255,255,255,.85)';
      m.P.forEach(function (i) { g.beginPath(); g.arc(R[i][0], R[i][1], 2 * R[i][3], 0, 7); g.fill(); });
      m.F.map(function (f) {
        var a = R[f[0]], b = R[f[1]], c = R[f[2]], ux = b[4] - a[4], uy = b[5] - a[5], uz = b[2] - a[2], vx = c[4] - a[4], vy = c[5] - a[5], vz = c[2] - a[2];
        var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
        return { f: f, d: f.reduce(function (q, i) { return q + R[i][2]; }, 0) / f.length, sh: Math.abs((nx * .3 + ny * .6 + nz * .75) / l) };
      }).sort(function (a, b) { return a.d - b.d; }).forEach(function (o) {
        g.beginPath(); o.f.forEach(function (i, n) { g[n ? 'lineTo' : 'moveTo'](R[i][0], R[i][1]); }); g.closePath();
        g.fillStyle = 'rgba(143,216,255,' + (.06 + .32 * o.sh).toFixed(3) + ')'; g.fill();
        g.strokeStyle = 'rgba(210,240,255,' + (.25 + .5 * o.sh).toFixed(2) + ')'; g.stroke();
      });
    }
  }

  var scenes = [].map.call(document.querySelectorAll('.track'), function (tr) {
    var cv = tr.querySelector('canvas');
    return { tr: tr, cv: cv, g: cv.getContext('2d'), rb: tr.dataset.scene === 'scan', m: tr.dataset.scene === 'scan' ? null : crystal() };
  });
  function size(s) {
    var d = Math.min(window.devicePixelRatio || 1, 2);
    s.cv.width = s.cv.clientWidth * d; s.cv.height = s.cv.clientHeight * d; s.g.setTransform(d, 0, 0, d, 0, 0);
  }
  function frame(t) {
    scenes.forEach(function (s) {
      var r = s.tr.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      draw(s, cl(-r.top / (r.height - innerHeight)), reduce ? 0 : t * .00015);
    });
    requestAnimationFrame(frame);
  }
  scenes.forEach(size);
  addEventListener('resize', function () { scenes.forEach(size); });
  requestAnimationFrame(frame);
})();
