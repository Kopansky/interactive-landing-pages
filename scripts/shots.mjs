// Screenshots at chosen scroll positions (reached by scrolling there gradually, so scroll-linked states are real)
// plus one contact sheet to look at. Use it to review pinned stages beat by beat.
// usage: node shots.mjs <url> <outDir> [W H] [--n 16] [--at 0,0.12,0.25,...] [--from 0.1 --to 0.4] [--nojs] [--reduce] [--workdir dir]
//   --n       evenly spaced frames over the whole page (default 16)
//   --at      fractions of the scrollable height (0–1)
//   --from/--to  spread the --n frames over a part of the page only (e.g. one pinned runway)
import { open } from './cdp.mjs';
import fs from 'node:fs'; import path from 'node:path';

const a = process.argv.slice(2);
const [url, outDir] = a; if (!url || !outDir) { console.error('usage: node shots.mjs <url> <outDir> [W H] [flags]'); process.exit(1); }
// W H are positional only when both are numbers (so '--n 4' is never read as a size)
const sized = /^\d+$/.test(a[2] || '') && /^\d+$/.test(a[3] || ''); const W = sized ? +a[2] : 1440, H = sized ? +a[3] : 900;
const opt = (n, d) => { const i = a.indexOf(n); return i > -1 ? a[i + 1] : d; };
fs.mkdirSync(outDir, { recursive: true });
const b = await open({ url, W, H, nojs: a.includes('--nojs'), reduce: a.includes('--reduce'), workdir: path.resolve(opt('--workdir', '.')) });
const max = await b.ev('document.documentElement.scrollHeight - innerHeight');
const n = +opt('--n', 16), from = +opt('--from', 0), to = +opt('--to', 1);
const at = opt('--at', null) ? opt('--at').split(',').map(Number) : Array.from({ length: n }, (_, i) => from + (to - from) * (n === 1 ? 0 : i / (n - 1)));
const files = []; let y = 0;
for (const f of at) {
  const target = Math.round(max * Math.min(1, Math.max(0, f)));
  while (Math.abs(target - y) > 1) { y += Math.sign(target - y) * Math.min(120, Math.abs(target - y)); await b.ev(`scrollTo(0, ${y})`); await b.sleep(40); }
  await b.sleep(500);
  const file = path.join(outDir, `${W}x${H}-${String(files.length + 1).padStart(2, '0')}-${f.toFixed(2)}.jpg`);
  await b.shot(file); files.push(file);
}
// contact sheet: render the frames into a grid page and screenshot it
const cols = 4, tw = 440, th = Math.round(tw * H / W), rows = Math.ceil(files.length / cols);
const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:6px;padding:6px">` +
  files.map(f => `<figure style="margin:0;position:relative"><img src="data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}" style="width:${tw}px;height:${th}px;display:block"><figcaption style="position:absolute;top:4px;left:4px;background:#000c;color:#fff;font:12px sans-serif;padding:2px 6px">${path.basename(f)}</figcaption></figure>`).join('') + '</body>';
await b.send('Emulation.setDeviceMetricsOverride', { width: cols * (tw + 6) + 6, height: rows * (th + 6) + 6, deviceScaleFactor: 1, mobile: false });
await b.send('Emulation.setScriptExecutionDisabled', { value: false });
const { result } = await b.send('Page.getFrameTree'); await b.send('Page.setDocumentContent', { frameId: result.frameTree.frame.id, html });
await b.sleep(600); const sheet = path.join(outDir, `sheet-${W}x${H}.jpg`); await b.shot(sheet);
console.log(JSON.stringify({ frames: files.length, sheet }, null, 1));
await b.close();
