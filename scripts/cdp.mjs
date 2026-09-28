// Minimal headless-Chrome driver over the DevTools protocol (Node 22+, no dependencies).
// The browser profile lives in a fresh temp folder and is ALWAYS deleted after Chrome exits —
// leaking these profiles (~60MB each) once filled a C: drive during a parallel variant run.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

function findChrome() {
  const c = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  const hit = c.find(p => { try { return fs.existsSync(p); } catch { return false; } });
  if (!hit) throw new Error('Chrome not found — set CHROME_PATH');
  return hit;
}

export async function open({ url, W = 1440, H = 900, nojs = false, reduce = false, workdir = os.tmpdir() }) {
  // Chrome fails to start when its profile path is too long (Windows path limit) — fall back to the system temp folder
  // Chrome fails on long profile paths; then fall back to %TEMP%, but tag the folder with the workdir's owner
  // (e.g. the test id) so parallel agents can tell their leftovers apart
  let base = path.resolve(workdir), tag = '';
  if (base.length > 110) { const n = path.basename(base); tag = ((n === 'work' ? path.basename(path.dirname(base)) : n).replace(/[^w-]/g, '').slice(0, 40)) + '-'; base = os.tmpdir(); }
  const udd = fs.mkdtempSync(path.join(base, 'ilp-prof-' + tag));
  const chrome = spawn(findChrome(), ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + udd,
    '--hide-scrollbars', '--disable-smooth-scrolling', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disk-cache-size=1', '--window-size=' + W + ',' + H, 'about:blank'], { stdio: 'ignore' });
  const exited = new Promise(r => chrome.on('exit', r));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // port 0 = Chrome picks a free port and writes it into this profile's DevToolsActivePort file,
  // so parallel runs can never attach to each other's browser
  let list, port;
  for (let i = 0; i < 150; i++) {
    try {
      if (!port) port = +fs.readFileSync(path.join(udd, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0] || 0;
      if (port) { list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json(); if (list.find(t => t.type === 'page')) break; }
    } catch {}
    await sleep(200);
  }
  if (!list) { try { chrome.kill(); } catch {} await sleep(500); try { fs.rmSync(udd, { recursive: true, force: true }); } catch {} throw new Error('Chrome did not start (no DevToolsActivePort in ' + udd + ')'); }
  const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pend = new Map(); const logs = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    if (m.method === 'Runtime.consoleAPICalled' && /error|warn/.test(m.params.type)) logs.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    if (m.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    // the browser's own favicon request is not the page's fault
    if (m.method === 'Log.entryAdded' && /error/.test(m.params.entry.level) && !/favicon.ico/.test(m.params.entry.url || '')) logs.push('LOG: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  };
  // if Chrome drops the socket, settle every pending call so nothing awaits forever (Node would exit before cleanup)
  ws.onclose = () => { for (const r of pend.values()) r({ error: 'socket closed' }); pend.clear(); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); try { ws.send(JSON.stringify({ id: i, method, params })); } catch { pend.delete(i); r({ error: 'socket closed' }); } });
  const ev = async (js, timeout = 20000) => {
    // never wait forever on one evaluation (a stuck page would otherwise hang the run and leak the profile)
    const r = await Promise.race([send('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true }), sleep(timeout).then(() => ({ result: { exceptionDetails: { text: 'evaluate timed out after ' + timeout + 'ms' } } }))]);
    if (r.result?.exceptionDetails) return 'EVALERR ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  const mobile = W < 700;
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
  if (nojs) await send('Emulation.setScriptExecutionDisabled', { value: true });
  if (reduce) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url });
  await sleep(2400);
  // wait for web fonts in every mode (a late font swap otherwise shows up as a false height change)
  await Promise.race([ev('document.fonts ? document.fonts.ready.then(()=>true) : true'), sleep(4000)]);
  await sleep(400);
  const shot = async file => {
    const r = await send('Page.captureScreenshot', { format: file.endsWith('.png') ? 'png' : 'jpeg', quality: 70 });
    fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
  };
  const wheel = dy => send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: Math.round(W / 2), y: Math.round(H / 2), deltaX: 0, deltaY: dy });
  const close = async () => {
    try { await Promise.race([send('Browser.close'), sleep(3000)]); } catch {}
    try { ws.close(); } catch {}
    await Promise.race([exited, sleep(6000)]);
    try { chrome.kill(); } catch {}
    await Promise.race([exited, sleep(3000)]);
    for (let i = 0; i < 12; i++) { try { fs.rmSync(udd, { recursive: true, force: true }); if (!fs.existsSync(udd)) break; } catch {} await sleep(500); }
    if (fs.existsSync(udd)) console.error('WARNING: could not delete Chrome profile ' + udd);
  };
  return { send, ev, shot, wheel, sleep, logs, close };
}
