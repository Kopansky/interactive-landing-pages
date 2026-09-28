// Checks that this machine can run the skill's verification: Node version, Chrome, headless launch,
// WebGL (for real-3D pages) and Google Fonts reachability. Run once after installing the skill.
// usage: node doctor.mjs
import { open } from './cdp.mjs';

const ok = (m) => console.log('  ok    ' + m), bad = (m) => { console.log('  FAIL  ' + m); failed = true; };
let failed = false;

const major = +process.versions.node.split('.')[0];
major >= 22 ? ok(`Node ${process.versions.node}`) : bad(`Node ${process.versions.node} — need 22+ (built-in WebSocket)`);

let b;
try { b = await open({ url: 'about:blank', W: 800, H: 600 }); ok('headless Chrome starts'); }
catch (e) { bad('Chrome: ' + e.message + ' — install Google Chrome or set CHROME_PATH'); }

if (b) {
  const gl = await b.ev(`(() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2') || c.getContext('webgl');
    if (!g) return null; const d = g.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'yes'; })()`);
  gl ? ok('WebGL: ' + gl) : bad('no WebGL in headless Chrome — real-3D pages can\'t be verified (try CHROME flags --use-angle=swiftshader --enable-unsafe-swiftshader)');
  const font = await b.ev(`fetch('https://fonts.googleapis.com/css2?family=Rubik&display=swap').then(r => r.ok).catch(() => false)`);
  font ? ok('Google Fonts reachable') : bad('Google Fonts not reachable — font checks (--font) will fail');
  await b.close();
}

console.log(failed ? '\nSome checks failed — fix them before building, or verification will be skipped silently.' : '\nAll good.');
process.exit(failed ? 1 : 0);
