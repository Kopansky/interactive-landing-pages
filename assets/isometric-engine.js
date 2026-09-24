/* ═════════ ISO — a tiny flat isometric engine ═════════
   Solids are flat profiles extruded along one axis (prisms), plus domes and balls.
   Every face gets one of three tones of its hue: top (light), left (mid), right (dark),
   chosen relative to the viewer, so a scene can turn between two isometric angles and
   still read as the same flat, toy-like drawing. Pure functions: the same code bakes the
   static SVG at build time and redraws the scene in the browser. */
var ISO = (function(){
  var C30 = Math.cos(Math.PI / 6), SQ2 = Math.SQRT2, PI = Math.PI;
  var PAL = {
    base:  ['#EAFBF7', '#B4F0EE', '#86D8D5'],
    paper: ['#FFFFFF', '#EDEDF1', '#D8D8DF'],
    road:  ['#DCE7EA', '#C3D2D7', '#A9BBC1'],
    mint:  ['#D6F8F6', '#B4F0EE', '#86D8D5'],
    aqua:  ['#A4F2F3', '#5CE3E6', '#2EBFC5'],
    sea:   ['#43BADB', '#0F9CC2', '#0A7898'],
    navy:  ['#3E6699', '#274A78', '#18325A'],
    lime:  ['#EAFBA6', '#D6F36B', '#ADC943'],
    lilac: ['#E4DBFF', '#CDBDFF', '#A791F0'],
    coral: ['#FFB6A3', '#FF8A6B', '#DE6548'],
    peach: ['#FFE9DE', '#FFD3BE', '#F1B393'],
    sun:   ['#FFF3B3', '#FFE270', '#EEC444'],
    ink:   ['#3B3B46', '#202029', '#0B0B10'],
    grey:  ['#D9D9DF', '#BDBDC6', '#9E9EA9'],
    night: ['#3A5F92', '#223F69', '#15294A']
  };
  function hex(c){ c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function h2(n){ n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? '0' : '') + n.toString(16); }
  function mix(a, b, t){ if (t <= 0) return a; if (t >= 1) return b; var A = hex(a), B = hex(b); return '#' + h2(A[0] + (B[0] - A[0]) * t) + h2(A[1] + (B[1] - A[1]) * t) + h2(A[2] + (B[2] - A[2]) * t); }
  function pal(c){ return typeof c === 'string' ? PAL[c] : c; }
  function mixPal(a, b, t){ a = pal(a); b = pal(b); return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }

  /* ── profiles (u right, v up; always counter-clockwise) ── */
  function area(p){ var s = 0; for (var i = 0; i < p.length; i++){ var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  function ccw(p){ return area(p) < 0 ? p.slice().reverse() : p; }
  function arc(cx, cy, r, a0, a1, n, out){ for (var i = 0; i <= n; i++){ var a = a0 + (a1 - a0) * i / n; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return out; }
  var P = {
    rect: function(w, h){ return [[0, 0], [w, 0], [w, h], [0, h]]; },
    rrect: function(w, h, r, n){ n = n || 6; var o = [];
      arc(w - r, r, r, -PI / 2, 0, n, o); arc(w - r, h - r, r, 0, PI / 2, n, o); arc(r, h - r, r, PI / 2, PI, n, o); arc(r, r, r, PI, PI * 1.5, n, o); return o; },
    circle: function(cx, cy, r, n){ var o = []; n = n || 44; for (var i = 0; i < n; i++){ var a = i / n * PI * 2; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; },
    sector: function(cx, cy, r, a0, a1, n){ var o = [[cx, cy]]; return arc(cx, cy, r, a0, a1, n || 16, o); },
    /* a door / window: rectangle with a round top */
    tomb: function(w, h, n){ var r = w / 2, o = [[0, 0], [w, 0]]; arc(r, h - r, r, 0, PI, n || 16, o); return o; },
    arch: function(w, h, t, n){ var R = w / 2, s = h - R, o = [[0, 0], [t, 0], [t, s]]; n = n || 16;
      arc(R, s, R - t, PI, 0, n, o); o.push([w - t, 0], [w, 0], [w, s]); arc(R, s, R, 0, PI, n, o); o.push([0, s]); return ccw(o); },
    star: function(cx, cy, R, r){ var o = []; for (var k = 0; k < 8; k++){ var a = PI / 2 + k * PI / 4, q = k % 2 ? r : R; o.push([cx + q * Math.cos(a), cy + q * Math.sin(a)]); } return o; },
    plus: function(s, t){ var a = (s - t) / 2, b = a + t; return [[a, 0], [b, 0], [b, a], [s, a], [s, b], [b, b], [b, s], [a, s], [a, b], [0, b], [0, a], [a, a]]; },
    bubble: function(w, h, r, tx, tw, th, n){ n = n || 5; var o = [[tx + tw, 0], [tx, -th], [tx, 0]];
      /* start at the tail, walk counter-clockwise: bottom edge leftwards is clockwise, so build and fix */
      o = [];
      o.push([r, 0]); o.push([tx, 0]); o.push([tx, -th]); o.push([tx + tw, 0]); o.push([w - r, 0]);
      arc(w - r, r, r, -PI / 2, 0, n, o); arc(w - r, h - r, r, 0, PI / 2, n, o); arc(r, h - r, r, PI / 2, PI, n, o); arc(r, r, r, PI, PI * 1.5, n, o);
      return ccw(o); },
    shield: function(w, h, n){ n = n || 12; var o = [[w / 2, 0]], k = h * .56;
      for (var i = 1; i <= n; i++){ var t = i / n; o.push([w / 2 + (w / 2) * Math.sin(t * PI / 2), k * (1 - Math.cos(t * PI / 2)) ]); }
      o.push([w, h], [0, h]);
      for (i = n; i >= 1; i--){ t = i / n; o.push([w / 2 - (w / 2) * Math.sin(t * PI / 2), k * (1 - Math.cos(t * PI / 2))]); }
      return ccw(o); },
    crescent: function(R, dx, dy, R2, n){ n = n || 40; var d = Math.hypot(dx, dy), al = Math.atan2(dy, dx);
      var be = Math.acos((R * R + d * d - R2 * R2) / (2 * R * d)), o = [];
      arc(0, 0, R, al + be, al + 2 * PI - be, n, o);
      var q = o[o.length - 1], p = o[0];
      var gq = Math.atan2(q[1] - dy, q[0] - dx), gp = Math.atan2(p[1] - dy, p[0] - dx);
      if (gp > gq) gp -= 2 * PI;
      arc(dx, dy, R2, gq, gp, n, o); o.pop(); return ccw(o); },
    /* convex clip (Sutherland–Hodgman) */
    clip: function(poly, by){ var out = poly;
      for (var i = 0; i < by.length; i++){ var A = by[i], B = by[(i + 1) % by.length], inp = out; out = [];
        var inside = function(p){ return (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]) >= 0; };
        for (var j = 0; j < inp.length; j++){ var c = inp[j], pr = inp[(j + inp.length - 1) % inp.length], ci = inside(c), pi = inside(pr);
          if (ci){ if (!pi) out.push(cross(pr, c, A, B)); out.push(c); } else if (pi) out.push(cross(pr, c, A, B)); } }
      return out;
      function cross(p, q, a, b){ var x1 = p[0], y1 = p[1], x2 = q[0], y2 = q[1], x3 = a[0], y3 = a[1], x4 = b[0], y4 = b[1];
        var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4), t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
        return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]; } },
    move: function(p, dx, dy){ return p.map(function(q){ return [q[0] + dx, q[1] + dy]; }); }
  };

  /* ── easing ── */
  function clamp(v, a, b){ a = a == null ? 0 : a; b = b == null ? 1 : b; return v < a ? a : v > b ? b : v; }
  function smooth(a, b, v){ var t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); }
  function backOut(t){ var s = 1.9; t = t - 1; return t * t * ((s + 1) * t + s) + 1; }
  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
  function easeIO(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  /* entrance: 'rise' grows the solid up out of the ground (and overshoots a hair, then settles);
     'drop' lowers it onto whatever it stacks on, with a tiny hop */
  function enter(s, p, d, kind, len){
    var t = clamp((p - d) / (len || .3));
    if (t <= 0){ s.a = 0; return s; }
    if ((kind || s.en || 'rise') === 'rise'){ s.g = Math.max(.001, backOut(t)); }
    else { var k = .72, h = s.drop || 2.4;
      s.dz = t < k ? h * (1 - easeOut(t / k) ) * (1 - t / k * .15) : .22 * Math.sin(PI * (t - k) / (1 - k));
      s.a = clamp(t / .18); }
    return s;
  }

  /* ── rendering ── */
  var VIEW = 1 / Math.sqrt(3);
  function Ctx(S, phi, cx, cy){ this.S = S; this.c = Math.cos(phi); this.s = Math.sin(phi); this.cx = cx; this.cy = cy; }
  Ctx.prototype.rot = function(x, y){ var dx = x - this.cx, dy = y - this.cy; return [this.cx + dx * this.c - dy * this.s, this.cy + dx * this.s + dy * this.c]; };
  Ctx.prototype.rn = function(n){ return [n[0] * this.c - n[1] * this.s, n[0] * this.s + n[1] * this.c, n[2]]; };
  Ctx.prototype.pr = function(x, y, z){ var r = this.rot(x, y); return [(r[0] - r[1]) * C30 * this.S, ((r[0] + r[1]) * .5 - z) * this.S, r[0] + r[1] + z]; };
  function toneOf(n){ if (n[2] > .5) return 0; return (n[0] - n[1]) > 1e-6 ? 2 : 1; }
  function vis(n){ return n[0] + n[1] + n[2] > 1e-4; }
  function f1(v){ return Math.round(v * 10) / 10; }
  function dstr(pts){ var s = 'M' + f1(pts[0][0]) + ' ' + f1(pts[0][1]); for (var i = 1; i < pts.length; i++) s += 'L' + f1(pts[i][0]) + ' ' + f1(pts[i][1]); return s + 'Z'; }

  /* map a profile point (u, v) at extrusion w into world space */
  /* yaw: a solid (or a group of solids sharing one pivot) can turn about a vertical axis,
     so a character can face any way while the scene keeps its isometric angle */
  function yawP(s, x, y){ if (!s.yaw) return [x, y]; var c = Math.cos(s.yaw), n = Math.sin(s.yaw), px = s.piv[0], py = s.piv[1], dx = x - px, dy = y - py; return [px + dx * c - dy * n, py + dx * n + dy * c]; }
  function yawN(s, v){ if (!s.yaw) return v; var c = Math.cos(s.yaw), n = Math.sin(s.yaw); return [v[0] * c - v[1] * n, v[0] * n + v[1] * c, v[2]]; }
  function mapper(s){
    var o = s.o, g = s.g == null ? 1 : s.g, dz = s.dz || 0, z0 = o[2], f;
    var Z = function(z){ return z0 + (z - z0) * g + dz; };
    if (s.pl === 'xz') f = function(u, v, w){ return [o[0] + u, o[1] + w, Z(o[2] + v)]; };
    else if (s.pl === 'yz') f = function(u, v, w){ return [o[0] + w, o[1] + u, Z(o[2] + v)]; };
    else f = function(u, v, w){ return [o[0] + u, o[1] + v, Z(o[2] + w)]; };
    if (!s.yaw) return f;
    return function(u, v, w){ var p = f(u, v, w), q = yawP(s, p[0], p[1]); return [q[0], q[1], p[2]]; };
  }
  function n3(pl, nu, nv){ return pl === 'xz' ? [nu, 0, nv] : pl === 'yz' ? [0, nu, nv] : [nu, nv, 0]; }
  function capN(pl){ return pl === 'xz' ? [0, 1, 0] : pl === 'yz' ? [1, 0, 0] : [0, 0, 1]; }

  function prismFaces(s, C, out){
    var pr = s.pr, e = s.e, M = mapper(s), T = pal(s.c), n = pr.length, pl = s.pl || 'xy';
    var P0 = [], P1 = [];
    for (var i = 0; i < n; i++){ var a = M(pr[i][0], pr[i][1], 0), b = M(pr[i][0], pr[i][1], e); P0.push(C.pr(a[0], a[1], a[2])); P1.push(C.pr(b[0], b[1], b[2])); }
    var side = [];
    for (i = 0; i < n; i++){
      var A = pr[i], B = pr[(i + 1) % n], du = B[0] - A[0], dv = B[1] - A[1], L = Math.hypot(du, dv) || 1;
      var N = C.rn(yawN(s, n3(pl, dv / L, -du / L)));
      side.push({ v: vis(N), t: toneOf(N) });
    }
    /* merge runs of visible, same-tone side faces into one strip */
    var start = 0;
    for (i = 0; i < n; i++){ var pv = side[(i + n - 1) % n], cv = side[i]; if (!(pv.v && cv.v && pv.t === cv.t)){ start = i; break; } }
    var run = null;
    function flush(){ if (!run) return; var top = [], bot = [], dep = 0;
      for (var k = 0; k < run.idx.length; k++){ var j = run.idx[k]; top.push(P1[j]); bot.push(P0[j]); dep += (P0[j][2] + P1[j][2] + P0[(j + 1) % n][2] + P1[(j + 1) % n][2]) / 4; }
      var last = (run.idx[run.idx.length - 1] + 1) % n; top.push(P1[last]); bot.push(P0[last]);
      out.push({ pts: top.concat(bot.reverse()), d: dep / run.idx.length, f: T[run.t] }); run = null; }
    for (var k = 0; k < n; k++){ i = (start + k) % n; var sd = side[i];
      if (!sd.v){ flush(); continue; }
      if (run && run.t === sd.t) run.idx.push(i); else { flush(); run = { t: sd.t, idx: [i] }; } }
    flush();
    var CN = C.rn(yawN(s, capN(pl))), cf, cb, dcap = 0;
    for (i = 0; i < n; i++) dcap += P1[i][2];
    if (vis(CN)) out.push({ pts: P1, d: dcap / n + .01, f: T[toneOf(CN)] });
    var BN = [-CN[0], -CN[1], -CN[2]];
    if (vis(BN)){ var db = 0; for (i = 0; i < n; i++) db += P0[i][2]; out.push({ pts: P0, d: db / n, f: T[toneOf(BN)] }); }
  }

  function decoFaces(s, C, out, base){
    if (!s.deco) return;
    var o = s.o, g = s.g == null ? 1 : s.g, dz = s.dz || 0, z0 = o[2];
    s.deco.forEach(function(d){
      if (d.n && !vis(C.rn(yawN(s, d.n)))) return;
      var pts = d.pts.map(function(p){ var q = yawP(s, o[0] + p[0], o[1] + p[1]); return C.pr(q[0], q[1], z0 + p[2] * g + dz); });
      out.push({ pts: pts, d: base + 1000 + (d.z || 0), f: d.f || 'none', st: d.st, sw: d.sw ? d.sw * C.S : 0, open: !!d.st && !d.f });
    });
  }

  function domeFaces(s, C, out, ball){
    var T = pal(s.c), g = s.g == null ? 1 : s.g, r = s.r * (ball ? 1 : g), z = s.o[2] + (s.dz || 0) + (ball ? s.r : 0);
    var yp = yawP(s, s.o[0], s.o[1]), c = C.pr(yp[0], yp[1], z), R = r * 1.2247 * C.S, ry = r * .7071 * C.S, X = c[0], Y = c[1];
    if (R < .2) return;
    var d, dk;
    if (ball){
      d = 'M' + f1(X - R) + ' ' + f1(Y) + 'A' + f1(R) + ' ' + f1(R) + ' 0 1 1 ' + f1(X + R) + ' ' + f1(Y) + 'A' + f1(R) + ' ' + f1(R) + ' 0 1 1 ' + f1(X - R) + ' ' + f1(Y) + 'Z';
      dk = 'M' + f1(X) + ' ' + f1(Y - R) + 'A' + f1(R) + ' ' + f1(R) + ' 0 0 1 ' + f1(X) + ' ' + f1(Y + R) + 'A' + f1(R * .42) + ' ' + f1(R) + ' 0 0 0 ' + f1(X) + ' ' + f1(Y - R) + 'Z';
    } else {
      d = 'M' + f1(X - R) + ' ' + f1(Y) + 'A' + f1(R) + ' ' + f1(R) + ' 0 0 1 ' + f1(X + R) + ' ' + f1(Y) + 'A' + f1(R) + ' ' + f1(ry) + ' 0 0 1 ' + f1(X - R) + ' ' + f1(Y) + 'Z';
      var ty = (Y - R + Y + ry) / 2, tr = (R + ry) / 2;
      dk = 'M' + f1(X) + ' ' + f1(Y - R) + 'A' + f1(R) + ' ' + f1(R) + ' 0 0 1 ' + f1(X + R) + ' ' + f1(Y) + 'A' + f1(R) + ' ' + f1(ry) + ' 0 0 1 ' + f1(X) + ' ' + f1(Y + ry) + 'A' + f1(R * .4) + ' ' + f1(tr) + ' 0 0 0 ' + f1(X) + ' ' + f1(Y - R) + 'Z';
    }
    out.push({ raw: d, d: c[2], f: T[ball ? 0 : 1], box: [X - R, Y - R, X + R, Y + (ball ? R : ry)] });
    out.push({ raw: dk, d: c[2] + .001, f: T[ball ? 1 : 2] });
  }

  /* one scene → flat list of faces in painter's order + projected label anchors */
  function render(sc, phi, S){
    var C = new Ctx(S || sc.S || 30, phi || 0, sc.cx || 0, sc.cy || 0), faces = [], box = [1e9, 1e9, -1e9, -1e9];
    var list = sc.solids.filter(function(s){ return s && (s.a == null || s.a > .01); }).map(function(s, i){
      var cx, cy;
      if (s.k === 'dome' || s.k === 'ball'){ var yq = yawP(s, s.o[0], s.o[1]); cx = yq[0]; cy = yq[1]; }
      else { var M = mapper(s), mn = [1e9, 1e9], mx = [-1e9, -1e9];
        s.pr.forEach(function(q){ [0, s.e].forEach(function(w){ var p = M(q[0], q[1], w); mn[0] = Math.min(mn[0], p[0]); mn[1] = Math.min(mn[1], p[1]); mx[0] = Math.max(mx[0], p[0]); mx[1] = Math.max(mx[1], p[1]); }); });
        cx = (mn[0] + mx[0]) / 2; cy = (mn[1] + mx[1]) / 2; }
      var r = C.rot(cx, cy);
      return { s: s, key: (s.layer || 0) * 1e4 + (s.key != null ? s.key : r[0] + r[1]) + (s.o[2] + (s.dz || 0)) * .02 + i * 1e-6 };
    });
    list.sort(function(a, b){ return a.key - b.key; });
    list.forEach(function(it){
      var s = it.s, fs = [];
      if (s.k === 'dome') domeFaces(s, C, fs, false);
      else if (s.k === 'ball') domeFaces(s, C, fs, true);
      else prismFaces(s, C, fs);
      fs.sort(function(a, b){ return a.d - b.d; });
      decoFaces(s, C, fs, 0);
      var a = s.a == null ? 1 : s.a;
      fs.forEach(function(f){
        var d = f.raw || (f.open ? dstr(f.pts).slice(0, -1) : dstr(f.pts));
        if (f.pts) f.pts.forEach(function(p){ if (p[0] < box[0]) box[0] = p[0]; if (p[1] < box[1]) box[1] = p[1]; if (p[0] > box[2]) box[2] = p[0]; if (p[1] > box[3]) box[3] = p[1]; });
        if (f.box){ box[0] = Math.min(box[0], f.box[0]); box[1] = Math.min(box[1], f.box[1]); box[2] = Math.max(box[2], f.box[2]); box[3] = Math.max(box[3], f.box[3]); }
        faces.push({ d: d, f: f.f, st: f.st, sw: f.sw, o: a });
      });
    });
    var labels = {};
    (sc.labels || []).forEach(function(l){ var p = C.pr(l.p[0], l.p[1], l.p[2]); labels[l.id] = { x: p[0], y: p[1], a: l.a == null ? 1 : l.a }; });
    return { faces: faces, labels: labels, box: box };
  }

  function svgInner(r){
    return r.faces.map(function(f){
      return '<path d="' + f.d + '" fill="' + f.f + '"' + (f.st ? ' stroke="' + f.st + '" stroke-width="' + f1(f.sw) + '" stroke-linecap="round" stroke-linejoin="round"' : '') + (f.o < 1 ? ' opacity="' + f.o.toFixed(2) + '"' : '') + '/>';
    }).join('');
  }

  /* shorthand builders */
  function box(x, y, z, w, d, h, c, more){ return ext({ pl: 'xy', pr: P.rect(w, d), o: [x, y, z], e: h, c: c }, more); }
  function ext(a, b){ if (b) for (var k in b) a[k] = b[k]; return a; }
  /* a flat rectangle lying on a face — for windows, doors, screens */
  function onY(x0, x1, z0, z1, y, f, extra){ return ext({ pts: [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], n: [0, 1, 0], f: f }, extra); }
  function onX(y0, y1, z0, z1, x, f, extra){ return ext({ pts: [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], n: [1, 0, 0], f: f }, extra); }
  function onZ(x0, x1, y0, y1, z, f, extra){ return ext({ pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], n: [0, 0, 1], f: f }, extra); }
  /* profile points placed on the front (y) plane of a solid, as a deco polygon */
  function polyY(pts2, x, y, z, f, extra){ return ext({ pts: pts2.map(function(p){ return [x + p[0], y, z + p[1]]; }), n: [0, 1, 0], f: f }, extra); }
  function polyZ(pts2, x, y, z, f, extra){ return ext({ pts: pts2.map(function(p){ return [x + p[0], y + p[1], z]; }), n: [0, 0, 1], f: f }, extra); }

  return { PAL: PAL, P: P, pal: pal, mix: mix, mixPal: mixPal, clamp: clamp, smooth: smooth, backOut: backOut, easeOut: easeOut, easeIO: easeIO,
    enter: enter, render: render, svgInner: svgInner, box: box, ext: ext, onY: onY, onX: onX, onZ: onZ, polyY: polyY, polyZ: polyZ, f1: f1 };
})();
