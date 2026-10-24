/* truth-table-bd - headless-Chrome smoke test (raw CDP, no dependencies).
 * Run: node tests/smoke.mjs   (note: .mjs because this file uses top-level WebSocket)
 * Loads file://index.html, drives the UI, counts real assertions. */
import { spawn } from 'node:child_process';

const CHROME = '/opt/meta-chromium/chrome';
const PAGE = 'file:///home/hatch/workspace/muse-project-factory/builds/truth-table-bd/index.html';

let pass = 0, fail = 0;
const failures = [];
function check(cond, label) {
  if (cond) { pass++; }
  else { fail++; failures.push(label); console.log('FAIL - ' + label); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=0', '--user-data-dir=/tmp/ttbd-chrome-profile',
    'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  let wsUrl = null, httpPort = null;
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('no DevTools URL in stderr')), 15000);
    chrome.stderr.on('data', d => {
      const m = String(d).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        wsUrl = m[1];
        httpPort = new URL(wsUrl.replace(/^ws:\/\//, 'http://')).port;
        clearTimeout(t); resolve();
      }
    });
    chrome.on('error', reject);
  });

  const res = await fetch(`http://127.0.0.1:${httpPort}/json/new?${encodeURIComponent(PAGE)}`, { method: 'PUT' });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res2, rej) => { ws.onopen = res2; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  const consoleErrors = [], pageErrors = [];
  function onConsole(p) {
    if (p.type === 'error') {
      const txt = (p.args || []).map(a => a.value ?? a.description ?? '').join(' ');
      consoleErrors.push(txt);
    }
  }
  function onException(p) { pageErrors.push(p.exceptionDetails.text || JSON.stringify(p.exceptionDetails)); }
  function onLog(p) { if (p.entry.level === 'error') pageErrors.push(p.entry.text); }

  let loadResolve = null;
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    else if (m.method === 'Runtime.consoleAPICalled') onConsole(m.params);
    else if (m.method === 'Runtime.exceptionThrown') onException(m.params);
    else if (m.method === 'Log.entryAdded') onLog(m.params);
    else if (m.method === 'Page.loadEventFired' && loadResolve) { loadResolve(); loadResolve = null; }
  };
  function send(method, params = {}) {
    return new Promise(resolve => {
      const myId = ++id;
      pending.set(myId, resolve);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  }
  const waitLoad = () => new Promise(r => { loadResolve = r; setTimeout(r, 8000); });

  async function ev(expr) {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.result) return r.result.result.value;
    return undefined;
  }
  const text = sel => ev(`(document.querySelector(${JSON.stringify(sel)})||{}).textContent`);
  const visible = sel => ev(`(function(){var e=document.querySelector(${JSON.stringify(sel)});return !!(e&&!e.hidden);})()`);
  async function click(sel) {
    await ev(`document.querySelector(${JSON.stringify(sel)}).click()`);
    await sleep(500);
  }
  async function setInput(sel, v) {
    await ev(`(function(){var i=document.querySelector(${JSON.stringify(sel)});i.value=${JSON.stringify(v)};i.focus();})()`);
    await sleep(150);
  }
  async function generate() { await click('#generate'); await sleep(400); }

  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  const loaded = waitLoad();
  await send('Page.navigate', { url: PAGE });
  await loaded; await sleep(600);

  /* 1. clean load */
  check(await ev('document.title') === 'Truth Table BD', 'title is Truth Table BD');
  check(consoleErrors.length === 0, 'zero console errors on load (got ' + consoleErrors.length + ')');
  check(pageErrors.length === 0, 'zero page errors on load (got ' + pageErrors.length + ')');
  const resNames = await ev(`performance.getEntriesByType('resource').map(r=>r.name).join('|')`);
  check(String(resNames).split('|').filter(Boolean).every(n => n.indexOf('file://') === 0),
    'zero network requests (all resources file://)');
  check((await text('#brandName')) === 'Truth Table BD', 'brand renders');
  check(await visible('#empty') === true, 'empty state visible before generation');
  check(await ev("document.getElementById('expr').value") === 'A && B', 'input prefilled with A && B');

  /* 2. main flow: A \u2227 B -> 4 data rows, main column T,F,F,F */
  await setInput('#expr', 'A\u2227B');
  await generate();
  check(await visible('#results') === true, 'results visible after generate');
  const rowCount = await ev(`document.querySelectorAll('#ttable tbody tr').length`);
  check(rowCount === 4, 'A\u2227B renders 4 data rows (got ' + rowCount + ')');
  const mainCol = await ev(`Array.from(document.querySelectorAll('#ttable tbody tr')).map(tr=>tr.lastElementChild.textContent).join(',')`);
  check(mainCol === 'F,F,F,T', 'A\u2227B main column is F,F,F,T in FF,FT,TF,TT row order (got "' + mainCol + '")');
  const headMain = await ev(`document.querySelector('#ttable thead th.main-col').textContent`);
  check(headMain === 'A \u2227 B', 'main column header is canonical "A \u2227 B" (got "' + headMain + '")');
  const trueRows = await ev(`document.querySelectorAll('#ttable tr.true-row').length`);
  check(trueRows === 1, 'exactly 1 true row highlighted (got ' + trueRows + ')');
  check((await text('#classBody')).indexOf('Contingent') >= 0, 'classification says Contingent');
  check((await text('#mintermVal')) === '\u03a3m(3)', 'A\u2227B minterms \u03a3m(3) (got "' + await text('#mintermVal') + '")');
  check((await text('#maxtermVal')) === '\u03a0M(0, 1, 2)', 'A\u2227B maxterms \u03a0M(0, 1, 2)');

  /* 3. CSV has 2^n+1 lines */
  const csv = await ev('window.TT_APP.buildCSV()');
  check(String(csv).split('\n').length === 5, 'CSV has 5 lines for 2 vars (got ' + String(csv).split('\n').length + ')');
  check(String(csv).split('\n')[0].indexOf('"A"') >= 0, 'CSV header quotes the A column');

  /* 4. copy TSV produces a status message */
  await click('#copyTsv'); await sleep(300);
  check((await text('#copyStatus')).length > 0, 'copy button shows a status message');

  /* 5. equivalence: \u00ac(A\u2227B) vs \u00acA\u2228\u00acB -> Equivalent */
  await setInput('#expr', '\u00ac(A\u2227B)');
  await setInput('#expr2', '\u00acA\u2228\u00acB');
  await click('#checkEquiv');
  let verdict = await text('#equivResult');
  check(/Equivalent/.test(verdict) && !/Not equivalent/.test(verdict),
    'equivalence of \u00ac(A\u2227B) vs \u00acA\u2228\u00acB reports Equivalent');
  await setInput('#expr2', 'A||B');
  await click('#checkEquiv');
  verdict = await text('#equivResult');
  check(/Not equivalent/.test(verdict), 'A\u2227B vs A\u2228B reports Not equivalent');
  check(verdict.indexOf('A=F') >= 0 && verdict.indexOf('B=F') >= 0,
    'counterexample names A=F, B=F (first differing row of !(A&&B) vs A||B)');

  /* 6. invalid input shows inline error */
  await setInput('#expr', 'A \u2227');
  await generate();
  check(await visible('#error') === true, 'invalid "A \u2227" shows inline error');
  check((await text('#error')).indexOf('missing operand') >= 0, 'error names the problem (missing operand)');
  check((await text('#error')).indexOf('position') >= 0, 'error names the position');

  /* 7. preset click fills and generates */
  await click('#presets button');
  const pv = await ev("document.getElementById('expr').value");
  check(pv === '!(A&&B)', 'De Morgan preset fills !(A&&B) (got "' + pv + '")');
  check(await visible('#results') === true, 'preset click generates the table');

  /* 8. BN toggle: Bengali words + Bengali digits, persists across reload */
  await setInput('#expr', 'A&&B');
  await generate();
  await click('#langToggle');
  await sleep(400);
  const bnCell = await ev(`document.querySelector('#ttable tbody tr td').textContent`);
  check(/[^\x00-\x7F]/.test(bnCell), 'BN mode: table cells use Bengali words (got "' + bnCell + '")');
  const bnRow = await ev(`document.querySelector('#ttable tbody th.rownum').textContent`);
  check(/[\u09E6-\u09EF]/.test(bnRow), 'BN mode: row numbers use Bengali digits');
  check((await text('#classBody')).indexOf('True') < 0, 'BN mode: classification not in English');
  check(await ev(`window.localStorage.getItem('ttbd-lang')`) === 'bn', 'language persisted in localStorage');
  const reloaded = waitLoad();
  await send('Page.navigate', { url: PAGE });
  await reloaded; await sleep(600);
  check(await ev(`window.localStorage.getItem('ttbd-lang')`) === 'bn', 'language still bn after reload');
  check((await text('#brandName')) === '\u099f\u09cd\u09b0\u09c1\u09a5 \u099f\u09c7\u09ac\u09bf\u09b2 \u09ac\u09bf\u09a1\u09bf', 'BN brand renders after reload');
  check(consoleErrors.length === 0, 'zero console errors after BN round-trip (got ' + consoleErrors.length + ')');
  await ev(`window.localStorage.setItem('ttbd-lang','en')`);

  /* 9. 390px mobile: no horizontal overflow */
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await setInput('#expr', 'A&&B&&C&&D&&E&&G');
  await generate();
  await sleep(400);
  const sw = await ev('document.documentElement.scrollWidth');
  check(sw <= 390, '390px viewport: no horizontal page overflow (scrollWidth=' + sw + ')');
  check(await visible('#results') === true, '6-variable table renders on mobile');

  /* final sweep */
  check(consoleErrors.length === 0, 'final: zero console errors (got ' + consoleErrors.length + ': ' + consoleErrors.slice(0, 2).join(' | ') + ')');
  check(pageErrors.length === 0, 'final: zero page errors (got ' + pageErrors.length + ')');

  chrome.kill();
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  if (fail > 0) { console.log('FAILURES:'); failures.forEach(f => console.log(' - ' + f)); process.exit(1); }
}

main().catch(e => { console.error('SMOKE CRASH:', e.message); process.exit(2); });
