// Resize + re-encode an image to JPEG with headless Chrome (no ImageMagick/Python needed).
// usage: node compress.mjs <in.png|jpg|webp> <out.jpg> [width=2000] [quality=0.8] [--workdir dir]
// Tip: export 2000w for full-bleed and 1100w for phones, then use srcset. Aim for ≤ 250 KB at 1600–2000w.
import { open } from './cdp.mjs';
import fs from 'node:fs'; import path from 'node:path';

const a = process.argv.slice(2);
const [src, out] = a; if (!src || !out) { console.error('usage: node compress.mjs <in> <out.jpg> [width] [quality]'); process.exit(1); }
const width = +(a[2] && !a[2].startsWith('--') ? a[2] : 2000), q = +(a[3] && !a[3].startsWith('--') ? a[3] : 0.8);
const wi = a.indexOf('--workdir'); const workdir = path.resolve(wi > -1 ? a[wi + 1] : path.dirname(path.resolve(out)));
const ext = path.extname(src).slice(1).toLowerCase().replace('jpg', 'jpeg');
const dataUrl = `data:image/${ext};base64,` + fs.readFileSync(src).toString('base64');

const b = await open({ url: 'about:blank', W: 800, H: 600, workdir });
const res = await b.ev(`new Promise(function (done) { var im = new Image(); im.onload = function () {
  var w = Math.min(${width}, im.naturalWidth), h = Math.round(im.naturalHeight * w / im.naturalWidth);
  var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d');
  g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, w, h);
  done({ w: w, h: h, data: c.toDataURL('image/jpeg', ${q}).split(',')[1] }); };
  im.onerror = function () { done({ error: 'could not decode image' }); }; im.src = ${JSON.stringify(dataUrl)}; })`);
await b.close();
if (!res || res.error) { console.error(res ? res.error : 'no result'); process.exit(1); }
fs.writeFileSync(out, Buffer.from(res.data, 'base64'));
console.log(`${out}  ${res.w}×${res.h}  ${Math.round(fs.statSync(out).size / 1024)} KB`);
