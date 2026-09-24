// Run a canvas image job in headless Chrome at BUILD time (file:// pages can't read pixels back — taint).
// usage: node canvas-job.mjs <job.js> <outDir> <in1> [in2 ...] [--workdir dir]
// job.js defines `async function job(images, util)` in browser context:
//   images = [{ name, img: HTMLImageElement, w, h }]
//   util.canvas(w, h) -> { c, g }            new canvas + 2d context
//   util.out(name, canvas, type='image/webp', q=0.9)   queue an output file (type image/png|webp|jpeg)
// Typical jobs: flatten a studio background to one colour, key out a region into a mask,
// build a luminosity/shading map, recolour a region, cut a part into its own transparent layer.
import { open } from './cdp.mjs';
import fs from 'node:fs'; import path from 'node:path';

const a = process.argv.slice(2).filter((x, i, all) => x !== '--workdir' && all[i - 1] !== '--workdir');
const wi = process.argv.indexOf('--workdir');
const [jobFile, outDir, ...inputs] = a;
if (!jobFile || !outDir || !inputs.length) { console.error('usage: node canvas-job.mjs <job.js> <outDir> <in1> [in2 ...]'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const mime = f => ({ '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' })[path.extname(f).toLowerCase()] || 'image/png';
const imgs = inputs.map(f => ({ name: path.basename(f), url: `data:${mime(f)};base64,` + fs.readFileSync(f).toString('base64') }));
const b = await open({ url: 'about:blank', W: 800, H: 600, workdir: path.resolve(wi > -1 ? process.argv[wi + 1] : outDir) });
const res = await b.ev(`(async function(){
  ${fs.readFileSync(jobFile, 'utf8')}
  var list = ${JSON.stringify(imgs)};
  var images = await Promise.all(list.map(function (it) { return new Promise(function (ok, bad) {
    var im = new Image(); im.onload = function () { ok({ name: it.name, img: im, w: im.naturalWidth, h: im.naturalHeight }); };
    im.onerror = function () { bad(new Error('cannot decode ' + it.name)); }; im.src = it.url; }); }));
  var outs = [];
  var util = {
    canvas: function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return { c: c, g: c.getContext('2d', { willReadFrequently: true }) }; },
    out: function (name, c, type, q) { outs.push({ name: name, data: c.toDataURL(type || 'image/webp', q == null ? 0.9 : q).split(',')[1] }); }
  };
  await job(images, util);
  return outs;
})()`);
await b.close();
if (!Array.isArray(res)) { console.error(res); process.exit(1); }
for (const o of res) { const f = path.join(outDir, o.name); fs.writeFileSync(f, Buffer.from(o.data, 'base64')); console.log(`${f}  ${Math.round(fs.statSync(f).size / 1024)} KB`); }
