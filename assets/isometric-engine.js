/* ═════════ ISO — a tiny flat isometric engine ═════════
   Solids are flat profiles extruded along one axis (prisms), plus domes and balls.
   Every face gets one of three tones of its hue: top (light), left (mid), right (dark),
   chosen relative to the viewer, so a scene can turn between two isometric angles and
   still read as the same flat, toy-like drawing. Pure functions: the same code bakes the
   static SVG at build time and redraws the scene in the browser.
   Usage guide (axes, every solid field, draw order, groups, text, baking): references/isometric.md */
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
  /* a colour is a PAL name, a [top, left, right(, slopeL, slopeR)] array, or one '#hex' (its ramp is derived) */
  var RAMPS = {};
  function pal(c){
    if (c && typeof c === 'object' && c.length >= 3) return c;
    if (typeof c === 'string'){
      if (PAL[c]) return PAL[c];
      var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c);
      if (m){ var hx = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1]; return RAMPS[hx] || (RAMPS[hx] = ramp('#' + hx)); }
    }
    throw new Error('ISO: colour must be a PAL name (' + Object.keys(PAL).join(', ') + '), a "#rrggbb" hex, or a [top, left, right] array; got ' + JSON.stringify(c));
  }
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
    move: function(p, dx, dy){ return p.map(function(q){ return [q[0] + dx, q[1] + dy]; }); },
    /* make a hand-written profile counter-clockwise (clockwise profiles draw their back faces) */
    ccw: ccw
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
    /* before the start the solid is hidden (a = 0); the old alpha is remembered and put back once
       the entrance starts, so the same solid object can be reused frame after frame */
    if (t <= 0){ if (!s._eh){ s._eh = 1; s._ea = s.a; } s.a = 0; return s; }
    if (s._eh){ s.a = s._ea; delete s._eh; delete s._ea; }
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
  /* with s.ridge set, an up-facing slope (not flat) gets tone 3 (leans left) or 4 (leans right),
     so the two sides of a pitched roof stay apart; palette entries 3/4 win, else top mixed with the side */
  function toneOfS(s, n){ var t = toneOf(n); if (!s.ridge || t !== 0 || n[2] > .999) return t; return (n[0] - n[1]) > 1e-6 ? 4 : 3; }
  function col(T, t, s){ if (t < 3) return T[t]; return T[t] || mix(T[0], T[t - 2], typeof s.ridge === 'number' ? s.ridge : .5); }
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
      side.push({ v: vis(N), t: toneOfS(s, N) });
    }
    /* merge runs of visible, same-tone side faces into one strip */
    var start = 0;
    for (i = 0; i < n; i++){ var pv = side[(i + n - 1) % n], cv = side[i]; if (!(pv.v && cv.v && pv.t === cv.t)){ start = i; break; } }
    var run = null;
    function flush(){ if (!run) return; var top = [], bot = [], dep = 0;
      for (var k = 0; k < run.idx.length; k++){ var j = run.idx[k]; top.push(P1[j]); bot.push(P0[j]); dep += (P0[j][2] + P1[j][2] + P0[(j + 1) % n][2] + P1[(j + 1) % n][2]) / 4; }
      var last = (run.idx[run.idx.length - 1] + 1) % n; top.push(P1[last]); bot.push(P0[last]);
      out.push({ pts: top.concat(bot.reverse()), d: dep / run.idx.length, f: col(T, run.t, s) }); run = null; }
    for (var k = 0; k < n; k++){ i = (start + k) % n; var sd = side[i];
      if (!sd.v){ flush(); continue; }
      if (run && run.t === sd.t) run.idx.push(i); else { flush(); run = { t: sd.t, idx: [i] }; } }
    flush();
    var CN = C.rn(yawN(s, capN(pl))), cf, cb, dcap = 0;
    for (i = 0; i < n; i++) dcap += P1[i][2];
    if (vis(CN)) out.push({ pts: P1, d: dcap / n + .01, f: col(T, toneOfS(s, CN), s) });
    var BN = [-CN[0], -CN[1], -CN[2]];
    if (vis(BN)){ var db = 0; for (i = 0; i < n; i++) db += P0[i][2]; out.push({ pts: P0, d: db / n, f: col(T, toneOfS(s, BN), s) }); }
  }

  function decoFaces(s, C, out, base){
    if (!s.deco) return;
    var o = s.o, g = s.g == null ? 1 : s.g, dz = s.dz || 0, z0 = o[2];
    function W(p){ var q = yawP(s, o[0] + p[0], o[1] + p[1]); return C.pr(q[0], q[1], z0 + p[2] * g + dz); }
    s.deco.forEach(function(d){
      if (d.n && !vis(C.rn(yawN(s, d.n)))) return;
      if (d.tx != null){ /* text painted on a plane: glyph x runs along u, glyph y along -v */
        var A = d.at, u = d.u, v = d.v, P0 = W(A), PU = W([A[0] + u[0], A[1] + u[1], A[2] + u[2]]), PV = W([A[0] - v[0], A[1] - v[1], A[2] - v[2]]), k = C.S;
        out.push({ tx: String(d.tx), pts: [P0], m: [(PU[0] - P0[0]) / k, (PU[1] - P0[1]) / k, (PV[0] - P0[0]) / k, (PV[1] - P0[1]) / k, P0[0], P0[1]],
          fs: (d.size || .5) * k, d: base + 1000 + (d.z || 0), f: d.f || '#000', ta: d.anchor || 'middle', fw: d.weight, ff: d.font, ls: d.ls, dir: d.dir, bl: d.bl == null ? 'central' : d.bl });
        return;
      }
      var pts = d.pts.map(W);
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

  /* world-space footprint box [x0, y0, x1, y1] and its centre (yaw included) */
  function foot(s){
    if (s.k === 'dome' || s.k === 'ball'){ var yq = yawP(s, s.o[0], s.o[1]), r = s.r || 0; return [yq[0] - r, yq[1] - r, yq[0] + r, yq[1] + r]; }
    var M = mapper(s), b = [1e9, 1e9, -1e9, -1e9];
    s.pr.forEach(function(q){ [0, s.e].forEach(function(w){ var p = M(q[0], q[1], w); b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); });
    return b;
  }
  function centre(s){ if (s.k === 'dome' || s.k === 'ball') return yawP(s, s.o[0], s.o[1]); var b = foot(s); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; }

  /* one scene → flat list of faces in painter's order + projected label anchors */
  function render(sc, phi, S){
    var C = new Ctx(S || sc.S || 30, phi || 0, sc.cx || 0, sc.cy || 0), faces = [], box = [1e9, 1e9, -1e9, -1e9];
    /* sort key = layer·1e4 + (key | key of `on` + .01 | footprint centre, turned) + kb + z·.02 */
    function fkey(s, depth){
      if (s.key != null) return s.key + (s.kb || 0);
      if (s.on && depth < 8) return fkey(s.on, depth + 1) + .01 + (s.kb || 0);
      var c = centre(s), r = C.rot(c[0], c[1]); return r[0] + r[1] + (s.kb || 0);
    }
    var list = sc.solids.filter(function(s){ return s && (s.a == null || s.a > .01); }).map(function(s, i){
      return { s: s, key: (s.layer || 0) * 1e4 + fkey(s, 0) + (s.o[2] + (s.dz || 0)) * .02 + i * 1e-6 };
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
        if (f.pts) f.pts.forEach(function(p){ if (p[0] < box[0]) box[0] = p[0]; if (p[1] < box[1]) box[1] = p[1]; if (p[0] > box[2]) box[2] = p[0]; if (p[1] > box[3]) box[3] = p[1]; });
        if (f.tx != null){ faces.push({ d: '', t: f.tx, m: f.m, fs: f.fs, ta: f.ta, fw: f.fw, ff: f.ff, ls: f.ls, dir: f.dir, bl: f.bl, f: f.f, o: a }); return; }
        var d = f.raw || (f.open ? dstr(f.pts).slice(0, -1) : dstr(f.pts));
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
      if (f.t != null) return '<text transform="matrix(' + f.m.map(function(v){ return Math.round(v * 1e4) / 1e4; }).join(' ') + ')" font-size="' + f1(f.fs) + '" fill="' + f.f + '" text-anchor="' + f.ta + '"' +
        (f.bl ? ' dominant-baseline="' + f.bl + '"' : '') + (f.fw ? ' font-weight="' + f.fw + '"' : '') + (f.ff ? ' font-family="' + esc(f.ff) + '"' : '') +
        (f.ls ? ' letter-spacing="' + f.ls + '"' : '') + (f.dir ? ' direction="' + f.dir + '"' : '') + (f.o < 1 ? ' opacity="' + f.o.toFixed(2) + '"' : '') + '>' + esc(f.t) + '</text>';
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
  /* profile points on the right (x) plane: u runs along +y, v up */
  function polyX(pts2, x, y, z, f, extra){ return ext({ pts: pts2.map(function(p){ return [x, y + p[0], z + p[1]]; }), n: [1, 0, 0], f: f }, extra); }

  /* text painted on a face, as a deco entry. at = [x, y, z] relative to the solid (like deco pts);
     face 'y' (left wall), 'x' (right wall), 'z' (top), '-y', '-x', or { u, v } unit vectors.
     opts: size (world units, default .5), f, anchor, weight, font, ls, dir ('rtl'), bl (baseline, default 'central'), z */
  var FACES = { y: [[1, 0, 0], [0, 0, 1]], x: [[0, -1, 0], [0, 0, 1]], z: [[1, 0, 0], [0, -1, 0]], top: [[1, 0, 0], [0, -1, 0]], '-y': [[-1, 0, 0], [0, 0, 1]], '-x': [[0, 1, 0], [0, 0, 1]] };
  function text(str, at, face, opts){
    var uv = typeof face === 'string' ? FACES[face] : face ? [face.u, face.v] : FACES.y, u = uv[0], v = uv[1];
    return ext({ tx: str, at: at, u: u, v: v, n: [v[1] * u[2] - v[2] * u[1], v[2] * u[0] - v[0] * u[2], v[0] * u[1] - v[1] * u[0]] }, opts);
  }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ── groups: move / grow / turn / fade several solids as one piece ──
     returns shallow clones (the originals are untouched, so build parts once and group them per frame).
     t: { dx, dy, dz, g (height scale about z0), z0 (default: lowest o[2]), yaw, piv (default: footprint centre), a, layer, kb } */
  function group(list, t){
    t = t || {}; list = list.filter(Boolean);
    var G = t.g == null ? 1 : t.g, dx = t.dx || 0, dy = t.dy || 0, dz = t.dz || 0, Y = t.yaw || 0, pv = t.piv, z0 = t.z0;
    if (z0 == null){ z0 = 1e9; list.forEach(function(s){ z0 = Math.min(z0, s.o[2]); }); }
    if (Y && !pv){ var b = [1e9, 1e9, -1e9, -1e9]; list.forEach(function(s){ var f = foot(s); b = [Math.min(b[0], f[0]), Math.min(b[1], f[1]), Math.max(b[2], f[2]), Math.max(b[3], f[3])]; }); pv = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; }
    var out = list.map(function(s){
      var c = ext({}, s);
      c.o = [s.o[0], s.o[1], s.o[2]]; if (s.piv) c.piv = [s.piv[0], s.piv[1]];
      if (G !== 1){ c.o[2] = z0 + (s.o[2] - z0) * G; c.g = (s.g == null ? 1 : s.g) * G; c.dz = (s.dz || 0) * G; if (s.k === 'ball') c.r = Math.max(.001, s.r * G); }
      if (Y){
        if (!s.yaw){ c.yaw = Y; c.piv = [pv[0], pv[1]]; }
        else { /* two turns about two pivots = one turn about a third */
          var a = s.yaw + Y, p1 = s.piv, cY = Math.cos(Y), sY = Math.sin(Y), ca = Math.cos(a), sa = Math.sin(a);
          var ex = pv[0] + cY * (p1[0] - pv[0]) - sY * (p1[1] - pv[1]) - (ca * p1[0] - sa * p1[1]);
          var ey = pv[1] + sY * (p1[0] - pv[0]) + cY * (p1[1] - pv[1]) - (sa * p1[0] + ca * p1[1]);
          var det = 2 - 2 * ca;
          if (det < 1e-9){ c.yaw = 0; c.o[0] += ex; c.o[1] += ey; }
          else { c.yaw = a; c.piv = [((1 - ca) * ex - sa * ey) / det, (sa * ex + (1 - ca) * ey) / det]; }
        }
      }
      c.o[0] += dx; c.o[1] += dy; if (c.piv){ c.piv[0] += dx; c.piv[1] += dy; }
      if (dz) c.dz = (c.dz || 0) + dz;
      if (t.a != null) c.a = (s.a == null ? 1 : s.a) * t.a;
      if (t.layer != null) c.layer = t.layer;
      if (t.kb) c.kb = (s.kb || 0) + t.kb;
      return c;
    });
    out.forEach(function(c){ var j = c.on ? list.indexOf(c.on) : -1; if (j >= 0) c.on = out[j]; });
    return out;
  }
  /* enter() for a whole group: 'rise' grows it out of z0 (stacked parts ride along), 'drop' lowers it as one piece */
  function enterGroup(list, p, d, kind, len, opt){
    opt = opt || {}; var e = { drop: opt.drop }; kind = kind || 'rise';
    enter(e, p, d, kind, len);
    if (e.a === 0) return group(list, { a: 0 });
    return kind === 'rise' ? group(list, { g: e.g, z0: opt.z0 }) : group(list, { dz: e.dz, a: e.a });
  }

  /* ── framing + baking ── */
  /* union of render boxes (or raw [x0, y0, x1, y1] boxes) + padding → viewBox numbers [x, y, w, h] */
  function frame(rs, pad){
    pad = pad || 0; var b = [1e9, 1e9, -1e9, -1e9];
    (rs.length != null && typeof rs[0] !== 'number' ? rs : [rs]).forEach(function(r){ var x = r.box || r; b = [Math.min(b[0], x[0]), Math.min(b[1], x[1]), Math.max(b[2], x[2]), Math.max(b[3], x[3])]; });
    var x = Math.floor(b[0] - pad), y = Math.floor(b[1] - pad); return [x, y, Math.ceil(b[2] + pad) - x, Math.ceil(b[3] + pad) - y];
  }
  /* a whole <svg> string: svg(renderResult, viewBox = frame(r, 8), extra attributes) */
  /* a world point [x, y, z] → [X, Y] in viewBox units, for scale S, turn phi and the scene's cx/cy */
  function proj(p, S, phi, sc){ var C = new Ctx(S || (sc && sc.S) || 30, phi || 0, (sc && sc.cx) || 0, (sc && sc.cy) || 0), q = C.pr(p[0], p[1], p[2]); return [q[0], q[1]]; }
  /* camera: a viewBox [x, y, w, h] around world points (the subject), grown to `aspect` (w / h),
     with the subject's centre at fraction fx, fy of the frame (fy .7 = subject low, room for a caption on top),
     and kept inside `within` (usually the frame of the whole world). o: { S, phi, scene, aspect, pad, fx, fy, within } */
  function camera(pts, o){
    o = o || {}; var b = [1e9, 1e9, -1e9, -1e9], pad = o.pad || 0;
    pts.forEach(function(p){ var q = proj(p, o.S, o.phi, o.scene); b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[0]), Math.max(b[3], q[1])]; });
    var w = b[2] - b[0] + 2 * pad, h = b[3] - b[1] + 2 * pad, a = o.aspect;
    if (a){ if (w / h < a) w = h * a; else h = w / a; }
    var x = (b[0] + b[2]) / 2 - w * (o.fx == null ? .5 : o.fx), y = (b[1] + b[3]) / 2 - h * (o.fy == null ? .5 : o.fy), W = o.within;
    if (W){ x = w >= W[2] ? W[0] + (W[2] - w) / 2 : clamp(x, W[0], W[0] + W[2] - w); y = h >= W[3] ? W[1] + (W[3] - h) / 2 : clamp(y, W[1], W[1] + W[3] - h); }
    return [x, y, w, h];
  }
  /* a 3-tone ramp [top, left, right] from one brand hue used as the left (mid) tone:
     top lifts lightness by `lift` of the way to white, right keeps `shade` of the lightness */
  function ramp(base, lift, shade){
    var c = hex(base).map(function(v){ return v / 255; }), mx = Math.max.apply(null, c), mn = Math.min.apply(null, c), l = (mx + mn) / 2, s = 0, h = 0, d = mx - mn;
    if (d){ s = d / (1 - Math.abs(2 * l - 1)); h = mx === c[0] ? ((c[1] - c[2]) / d + 6) % 6 : mx === c[1] ? (c[2] - c[0]) / d + 2 : (c[0] - c[1]) / d + 4; }
    function hsl(L, S){ var C = (1 - Math.abs(2 * L - 1)) * S, X = C * (1 - Math.abs(h % 2 - 1)), m = L - C / 2, i = Math.floor(h) % 6;
      var rgb = [[C, X, 0], [X, C, 0], [0, C, X], [0, X, C], [X, 0, C], [C, 0, X]][i];
      return '#' + h2((rgb[0] + m) * 255) + h2((rgb[1] + m) * 255) + h2((rgb[2] + m) * 255); }
    return [hsl(l + (1 - l) * (lift == null ? .36 : lift), Math.min(1, s * 1.15)), base, hsl(l * (shade == null ? .8 : shade), s * .75)];
  }

  function svg(r, vb, attrs){ vb = vb || frame(r, 8); return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '"' + (attrs ? ' ' + attrs : '') + '>' + svgInner(r) + '</svg>'; }

  return { PAL: PAL, P: P, pal: pal, mix: mix, mixPal: mixPal, clamp: clamp, smooth: smooth, backOut: backOut, easeOut: easeOut, easeIO: easeIO,
    enter: enter, render: render, svgInner: svgInner, box: box, ext: ext, onY: onY, onX: onX, onZ: onZ, polyY: polyY, polyZ: polyZ, f1: f1,
    polyX: polyX, text: text, group: group, enterGroup: enterGroup, frame: frame, svg: svg, foot: foot, proj: proj, camera: camera, ramp: ramp };
})();
if (typeof module === 'object' && module && module.exports) module.exports = ISO;
