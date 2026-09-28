// Scroll audit: real mouse-wheel steps to the bottom and back to the top, logging what breaks.
// usage: node walk.mjs <url> [W H] [--reduce] [--nojs] [--font "Google Sans"] [--track "h1,h2,.card"] [--shots dir] [--step 150] [--workdir dir] [--pause-animations]
// Prints JSON: horizontal overflow per scroll position, scroll-height changes, dead scroll (identical frames while
// scrolling), tracked elements never seen at ≥90% opacity, font families in use, console errors.
import { open } from './cdp.mjs';
import crypto from 'node:crypto'; import fs from 'node:fs'; import path from 'node:path';

const a = process.argv.slice(2);
const url = a[0]; if (!url) { console.error('usage: node walk.mjs <url> [W H] [flags]'); process.exit(1); }
const W = +(a[1] && !a[1].startsWith('--') ? a[1] : 1440), H = +(a[2] && !a[2].startsWith('--') ? a[2] : 900);
const flag = n => a.includes(n); const opt = (n, d) => { const i = a.indexOf(n); return i > -1 ? a[i + 1] : d; };
const font = opt('--font', null), track = opt('--track', 'h1,h2,h3,p,li,button,img,svg,figure,[class*=card]');
const shotsDir = opt('--shots', null), step = +opt('--step', 150); let shotCount = 0; const MAX_SHOTS = 16;
if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });

// the browser profile is created in --workdir (default: the current folder = your own work folder) and deleted afterwards
const b = await open({ url, W, H, nojs: flag('--nojs'), reduce: flag('--reduce'), workdir: path.resolve(opt('--workdir', '.')) });
// --pause-animations: freeze CSS/SVG loops (spinning props, marquees) so dead-scroll detection stays honest
if (flag('--pause-animations')) await b.ev(`(function(){ var s = document.createElement('style'); s.textContent = '*,*::before,*::after{animation-play-state:paused!important}'; document.head.appendChild(s); document.getAnimations().forEach(function(a){ a.pause(); }); document.querySelectorAll('svg').forEach(function(v){ v.pauseAnimations && v.pauseAnimations(); }); return 1; })()`);
// hard limit so a stuck browser can't hang the run or leave its profile behind
const killer = setTimeout(async () => { console.error('walk timed out after 8 min'); await b.close(); process.exit(2); }, 8 * 60e3);
const fonts = await b.ev(`(function(){ var f = {}; document.querySelectorAll('body *').forEach(function(e){
  if (![].some.call(e.childNodes, function(n){ return n.nodeType === 3 && n.textContent.trim(); })) return;
  var k = getComputedStyle(e).fontFamily.split(',')[0].trim().replace(/["']/g, ''); f[k] = (f[k] || 0) + 1; }); return f; })()`);
// craft floor: how big the type is and how many scroll moments exist (a 'correct' but timid page scores low here)
const scale = await b.ev(`(function(){ var shown = function(e){ var r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && !e.closest('dialog:not([open]),[hidden],[aria-hidden=true],[inert]'); };
  var px = function(sel){ return [].filter.call(document.querySelectorAll(sel), shown).map(function(e){ return parseFloat(getComputedStyle(e).fontSize); }); };
  var h1 = px('h1'), h2 = px('h2'), p = [].filter.call(document.querySelectorAll('p'), function(e){ return (e.textContent || '').trim().length >= 40 && !e.closest('figcaption,footer,[class*=label],[class*=caption],[class*=illus],[class*=tag],[class*=note],[class*=disclaim]'); }).map(function(e){ return parseFloat(getComputedStyle(e).fontSize); }).sort(function(a,b){return a-b;});
  var sticky = [].filter.call(document.querySelectorAll('body *'), function(e){ return getComputedStyle(e).position === 'sticky' && e.offsetHeight > innerHeight * .5; }).length;
  var vis = [].slice.call(document.querySelectorAll('img,svg,canvas,video,picture,[class*=window],[class*=mock],[class*=device],[class*=phone],[class*=browser],[class*=poster],[class*=wordmark]')).filter(function(e){ return !e.closest('button,a,[aria-hidden=true] svg svg'); }).map(function(e){ var r = e.getBoundingClientRect(); var vw = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)), vh = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); return vw * vh / (innerWidth * innerHeight); });
  // text width, not block width; skips visually-hidden screen-reader text (it inherits the giant font size)
  var h1w = [].map.call(document.querySelectorAll('h1'), function(e){ var tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), t, l = Infinity, r = -Infinity;
    while ((t = tw.nextNode())){ var pr = t.parentElement.getBoundingClientRect(); if (pr.width <= 2 || pr.height <= 2 || !t.textContent.trim()) continue; var rg = document.createRange(); rg.selectNodeContents(t); var b = rg.getBoundingClientRect(); if (b.width){ l = Math.min(l, b.left); r = Math.max(r, b.right); } }
    return r > l ? (r - l) / innerWidth : 0; });
  return { largestVisualPctOfScreen: vis.length ? Math.round(Math.max.apply(0, vis) * 100) : 0, h1WidthPct: h1w.length ? Math.round(Math.max.apply(0, h1w) * 100) : 0, h1: h1.length ? Math.max.apply(0, h1) : 0, h2Min: h2.length ? Math.min.apply(0, h2) : 0, bodyMedian: p.length ? p[p.length >> 1] : 0, pinnedStages: sticky }; })()`);
const httpStatus = await b.ev(`(performance.getEntriesByType('navigation')[0] || {}).responseStatus || 0`);
const fontLoaded = font ? await b.ev(`document.fonts ? Array.from(document.fonts).some( function(f){ return f.family.replace(/["']/g, '') === ${JSON.stringify(font)} && f.status === 'loaded'; }) : 'n/a'`) : null;
const probe = `(function(){
  if (!window.__seen){ window.__seen = new Map(); window.__trk = [].slice.call(document.querySelectorAll(${JSON.stringify(track)})).filter(function(el){
    return !el.closest('[aria-hidden="true"],[hidden],[inert],dialog:not([open]),[role=dialog],nav [class*=sheet],[class*=menu] [class*=sheet],template,noscript'); }); }
  var vh = innerHeight;
  __trk.forEach(function(el){ var r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    var o = 1, n = el; while (n && n !== document.documentElement){ var cs = getComputedStyle(n); o *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') o = 0; n = n.parentElement; }
    var v = (r.bottom > 0 && r.top < vh) ? o : 0, k = __seen.get(el) || 0; if (v > k) __seen.set(el, v); });
  var vmax = 0; [].forEach.call(document.querySelectorAll('img,svg,canvas,video,picture,[class*=window],[class*=mock],[class*=device],[class*=phone],[class*=browser],[class*=poster],[class*=wordmark]'), function(e){ if (e.closest('button,a,[aria-hidden=true] svg svg')) return; var r = e.getBoundingClientRect(); var a = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); if (a > vmax) vmax = a; });
  // type as image: giant words (font-size >= 15% of the screen height) count as the visual
  [].forEach.call(document.querySelectorAll('h1,h2,h3,[class*=word],[class*=display],[class*=giant]'), function(e){ if (parseFloat(getComputedStyle(e).fontSize) < innerHeight * .15) return; var rg = document.createRange(); rg.selectNodeContents(e); var r = rg.getBoundingClientRect(); var a = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)); if (a > vmax) vmax = a; });
  return { vis: Math.round(vmax / (innerWidth * innerHeight) * 100), y: Math.round(scrollY), sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight };
})()`;
const unseen = `(function(){ var bad = []; (window.__trk||[]).forEach(function(el){ var r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
  var v = __seen.get(el); if (v === undefined || v < .9) bad.push(el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '') + ' "' + (el.textContent || '').trim().slice(0, 28) + '" ' + (v === undefined ? 'never' : v.toFixed(2))); }); return bad.slice(0, 40); })()`;
const hashFrame = async () => { const r = await b.send('Page.captureScreenshot', { format: 'jpeg', quality: 40 }); return [crypto.createHash('md5').update(r.result.data).digest('hex'), r.result.data]; };
const rows = [], frames = []; let p = await b.ev(probe);
// screenshots are spread evenly over the whole scrollable height (up to MAX_SHOTS)
const shotEvery = Math.max(step, Math.ceil(Math.max(1, p.sh - H) / (MAX_SHOTS - 1))); let nextShot = 0;
const record = async dir => { rows.push({ dir, ...p }); const [h, data] = await hashFrame(); frames.push([p.y, h]);
  if (shotsDir && dir !== 'up' && shotCount < MAX_SHOTS && p.y >= nextShot) { nextShot = p.y + shotEvery;
    fs.writeFileSync(path.join(shotsDir, `${W}x${H}-${String(++shotCount).padStart(2, '0')}-y${p.y}.jpg`), Buffer.from(data, 'base64')); } };
await record('start');
for (const [dir, dy] of [['down', step], ['up', -step]]) {
  let stuck = 0;
  for (let i = 0; i < 1500; i++) { const prev = p.y; await b.wheel(dy); await b.sleep(170); p = await b.ev(probe); await record(dir);
    if (p.y === prev) { if (++stuck >= 2) break; } else stuck = 0; }
  // always keep the very bottom (footer) in the screenshot set
  if (dir === 'down' && shotsDir) { const [, data] = await hashFrame(); fs.writeFileSync(path.join(shotsDir, `${W}x${H}-99-bottom-y${p.y}.jpg`), Buffer.from(data, 'base64')); }
}
const unseenList = await b.ev(unseen);
const wide = rows.filter(r => r.sw > r.iw || r.bw > r.iw).map(r => `${r.dir}@y${r.y}: sw=${r.sw} bw=${r.bw} vw=${r.iw}`);
const dead = []; for (let i = 1; i < frames.length; i++) if (frames[i][1] === frames[i - 1][1] && frames[i][0] !== frames[i - 1][0]) dead.push(frames[i][0]);
if (scale && typeof scale === 'object') scale.largestVisualPctOfScreen = Math.max(...rows.map(r => r.vis || 0));
const report = { url, httpStatus, size: `${W}x${H}`, flags: a.filter(x => x === '--reduce' || x === '--nojs'), steps: rows.length,
  maxScrollY: Math.max(...rows.map(r => r.y)), scrollHeights: [...new Set(rows.map(r => r.sh))],
  horizontalOverflow: wide.slice(0, 30), deadScrollAtY: dead.slice(0, 40), neverFullyVisible: unseenList,
  fontsInUse: fonts, fontLoaded, typeScale: scale, console: b.logs.slice(0, 30),
  verdict: { loaded: !(httpStatus >= 400), craftFloor: (W < 1200 || flag("--reduce") || flag("--nojs")) ? "n/a (default desktop run only)" : { h1: scale.h1 >= 88, h2: !scale.h2Min || scale.h2Min >= 56, body: scale.bodyMedian >= 19, pinned: scale.pinnedStages >= 1 }, scrolls: Math.max(...rows.map(r => r.y)) > 0 || rows[0].sh <= H, noHorizontalOverflow: wide.length === 0, heightStable: new Set(rows.map(r => r.sh)).size === 1, deadScrollSteps: dead.length, neverVisible: unseenList.length, consoleErrors: b.logs.length } };
console.log(JSON.stringify(report, null, 1));
clearTimeout(killer);
await b.close();
