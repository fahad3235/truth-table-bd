/* truth-table-bd - UI glue: i18n, rendering, presets, copy/download, equivalence.
 * Classic script; uses globals TRUTH_LOGIC and TRUTH_I18N.
 * Source is pure ASCII; Bengali arrives only via TRUTH_I18N (\uXXXX escapes). */
(function () {
'use strict';

var L = window.TRUTH_LOGIC;
var I18N = window.TRUTH_I18N.STR;
var PRESETS = window.TRUTH_I18N.PRESETS;
var LANG_KEY = 'ttbd-lang';

var state = {
  lang: 'en',
  table: null,   /* last built table */
  parsed: null,  /* last parse result */
  equiv: null
};

function $(id) { return document.getElementById(id); }
function t(key) { return I18N[state.lang][key] || I18N.en[key] || key; }
function fmt(s, map) {
  return String(s).replace(/\{(\w+)\}/g, function (m, k) {
    return (k in map) ? map[k] : m;
  });
}
function num(n) { return state.lang === 'bn' ? L.bnDigits(n) : String(n); }
function word(b) { return b ? t('trueWord') : t('falseWord'); }
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ------------------------------ i18n apply ------------------------------ */
function applyI18n() {
  document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
  document.title = t('docTitle');
  $('brandName').textContent = t('brand');
  $('offlineNote').textContent = t('offlineNote');
  $('tagline').textContent = t('tagline');
  $('exprLabel').textContent = t('exprLabel');
  $('expr2Label').textContent = t('expr2Label');
  $('expr').placeholder = t('placeholder');
  $('expr2').placeholder = t('placeholder');
  $('generate').textContent = t('generate');
  $('ctrlHint').textContent = t('ctrlHint');
  $('emptyTitle').textContent = t('emptyTitle');
  $('emptyHint').textContent = t('emptyHint');
  $('presetsTitle').textContent = t('presetsTitle');
  $('tableTitle').textContent = t('tableTitle');
  $('classTitle').textContent = t('classTitle');
  $('canonTitle').textContent = t('canonTitle');
  $('mintermLabel').textContent = t('minterms');
  $('maxtermLabel').textContent = t('maxterms');
  $('equivTitle').textContent = t('equivTitle');
  $('checkEquiv').textContent = t('checkEquiv');
  $('copyTsv').textContent = t('copyTsv');
  $('downloadCsv').textContent = t('downloadCsv');
  $('opsTitle').textContent = t('opsTitle');
  $('opsHelp').textContent = t('opsHelp');
  $('langToggle').textContent = t('langToggle');
  $('footerNote').textContent = t('offlineNote');
  renderPresets();
  if (state.parsed && state.parsed.ok) { renderResults(); }
  if (state.equiv) { renderEquiv(state.equiv); }
}

function renderPresets() {
  var box = $('presets');
  box.innerHTML = '';
  PRESETS.forEach(function (pr) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ghost small';
    b.textContent = state.lang === 'bn' ? pr.bn : pr.en;
    b.title = pr.expr + (pr.expr2 ? '  vs  ' + pr.expr2 : '');
    b.addEventListener('click', function () {
      $('expr').value = pr.expr;
      if (pr.expr2) { $('expr2').value = pr.expr2; }
      hideError(); hideError2();
      generate(function () {
        if (pr.equiv) { runEquivalence(); }
      });
    });
    box.appendChild(b);
  });
}

/* ------------------------------ errors ---------------------------------- */
function showError(msg, pos) {
  var box = $('error');
  box.innerHTML = '';
  var strong = document.createElement('strong');
  strong.textContent = t('errorTitle');
  var div = document.createElement('div');
  div.textContent = msg;
  var p = document.createElement('div');
  p.className = 'pos';
  p.textContent = 'position: ' + pos;
  box.appendChild(strong); box.appendChild(div); box.appendChild(p);
  box.hidden = false;
}
function hideError() { $('error').hidden = true; }
function showError2(msg, pos) {
  var box = $('error2');
  box.innerHTML = '';
  var strong = document.createElement('strong');
  strong.textContent = t('equiv2Invalid');
  var div = document.createElement('div');
  div.textContent = msg;
  box.appendChild(strong); box.appendChild(div);
  box.hidden = false;
}
function hideError2() { $('error2').hidden = true; }

/* ------------------------------ generate -------------------------------- */
function generate(done) {
  hideError();
  var src = $('expr').value;
  var loading = $('loading');
  loading.textContent = t('loading');
  loading.hidden = false;
  /* Real work happens on the next frame so the loading state is visible. */
  requestAnimationFrame(function () {
    var p = L.parse(src);
    loading.hidden = true;
    if (!p.ok) {
      state.parsed = p; state.table = null;
      $('results').hidden = true;
      $('empty').hidden = true;
      showError(p.error, p.pos);
      if (done) { done(); }
      return;
    }
    state.parsed = p;
    state.table = L.buildTable(p.root);
    renderResults();
    if (done) { done(); }
  });
}

function renderResults() {
  var tb = state.table;
  if (!tb) { return; }
  $('empty').hidden = true;
  $('results').hidden = false;

  /* table */
  var cls = L.classify(tb);
  $('rowsBadge').textContent = fmt(t('rowsBadge'), { t: num(cls.trueCount), n: num(cls.rowCount) });
  var thead = '<tr><th scope="col">#</th>';
  tb.vars.forEach(function (v) { thead += '<th scope="col">' + escHtml(v) + '</th>'; });
  tb.inter.forEach(function (lab) { thead += '<th scope="col">' + escHtml(lab) + '</th>'; });
  thead += '<th scope="col" class="main-col">' + escHtml(tb.mainLabel) + '</th></tr>';
  var body = '';
  tb.rows.forEach(function (r, i) {
    body += '<tr' + (r.main ? ' class="true-row"' : '') + '><th class="rownum" scope="row">' + num(i) + '</th>';
    r.bits.forEach(function (b) {
      body += '<td class="' + (b ? 'cell-t' : 'cell-f') + '">' + escHtml(word(b)) + '</td>';
    });
    r.vals.forEach(function (b) {
      body += '<td class="' + (b ? 'cell-t' : 'cell-f') + '">' + escHtml(word(b)) + '</td>';
    });
    body += '<td class="' + (r.main ? 'cell-main-t' : 'cell-main-f') + '">' + escHtml(word(r.main)) + '</td></tr>';
  });
  $('ttable').innerHTML = '<thead>' + thead + '</thead><tbody>' + body + '</tbody>';
  $('copyStatus').textContent = '';

  /* classification */
  var kindWord = t(cls.kind);
  $('classBody').innerHTML =
    '<span class="badge ' + cls.kind + '">' + escHtml(kindWord) + '</span>' +
    '<p class="class-line">' + escHtml(fmt(t('classLine'), {
      t: num(cls.trueCount), n: num(cls.rowCount), kind: kindWord
    })) + '</p>';

  /* canonical forms */
  var can = L.canonical(tb);
  if (state.lang === 'bn') {
    $('mintermVal').textContent = can.minterms.length ? L.bnDigits(L.mintermString(can.minterms)) : t('none');
    $('maxtermVal').textContent = can.maxterms.length ? L.bnDigits(L.maxtermString(can.maxterms)) : t('none');
  } else {
    $('mintermVal').textContent = can.minterms.length ? L.mintermString(can.minterms) : t('none');
    $('maxtermVal').textContent = can.maxterms.length ? L.maxtermString(can.maxterms) : t('none');
  }
}

/* ----------------------------- equivalence ------------------------------ */
function runEquivalence() {
  hideError2();
  $('equivResult').innerHTML = '';
  var src1 = $('expr').value;
  var src2 = $('expr2').value;
  var p1 = L.parse(src1);
  if (!p1.ok) { showError(p1.error, p1.pos); return; }
  var p2 = L.parse(src2);
  if (!p2.ok) { showError2(p2.error, p2.pos); state.equiv = null; return; }
  var r = L.checkEquivalent(src1, src2);
  state.equiv = r;
  renderEquiv(r);
}

function renderEquiv(r) {
  var box = $('equivResult');
  box.innerHTML = '';
  var badge = document.createElement('span');
  badge.className = 'badge ' + (r.equivalent ? 'equiv-yes' : 'equiv-no');
  var p = document.createElement('p');
  if (r.equivalent) {
    badge.textContent = t('equivYes').split(' - ')[0];
    p.textContent = fmt(t('equivYes'), { n: num(r.assignments) });
    box.appendChild(badge); box.appendChild(p);
  } else {
    badge.textContent = t('equivNo').split(' - ')[0];
    p.textContent = fmt(t('equivNo'), {
      assign: r.counter.map(function (a) {
        var parts = a.split('=');
        return parts[0] + '=' + word(parts[1] === 'T');
      }).join(', ')
    });
    box.appendChild(badge); box.appendChild(p);
    var lab = document.createElement('div');
    lab.textContent = t('counterLabel') + ':';
    lab.style.marginTop = '8px';
    var code = document.createElement('div');
    code.className = 'counter';
    code.textContent = r.counter.map(function (a) {
      var parts = a.split('=');
      return parts[0] + '=' + word(parts[1] === 'T');
    }).join(', ');
    box.appendChild(lab); box.appendChild(code);
  }
}

/* --------------------------- copy + download ---------------------------- */
function cellVal(b) { return b ? 'T' : 'F'; }
function tableHeader() {
  var tb = state.table;
  return ['#'].concat(tb.vars, tb.inter, [tb.mainLabel]);
}
function tableRow(r, i) {
  return [String(i)].concat(
    r.bits.map(cellVal), r.vals.map(cellVal), [cellVal(r.main)]);
}
function buildTSV() {
  if (!state.table) { return ''; }
  var lines = [tableHeader().join('\t')];
  state.table.rows.forEach(function (r, i) { lines.push(tableRow(r, i).join('\t')); });
  return lines.join('\n');
}
function buildCSV() {
  if (!state.table) { return ''; }
  function q(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
  var lines = [tableHeader().map(q).join(',')];
  state.table.rows.forEach(function (r, i) { lines.push(tableRow(r, i).map(q).join(',')); });
  return lines.join('\n');
}

function copyTSV() {
  var text = buildTSV();
  if (!text) { return; }
  function done(ok) {
    $('copyStatus').textContent = ok ? t('copied') : t('copyFailed');
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    done(ok);
  }
}

function downloadCSV() {
  var csv = buildCSV();
  if (!csv) { return; }
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'truth-table.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }, 500);
}

/* --------------------------------- init --------------------------------- */
function init() {
  try {
    var saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'bn' || saved === 'en') { state.lang = saved; }
  } catch (e) { /* storage unavailable: stay in English */ }

  $('langToggle').addEventListener('click', function () {
    state.lang = state.lang === 'en' ? 'bn' : 'en';
    try { window.localStorage.setItem(LANG_KEY, state.lang); } catch (e) {}
    applyI18n();
  });
  $('generate').addEventListener('click', function () { generate(); });
  $('checkEquiv').addEventListener('click', runEquivalence);
  $('copyTsv').addEventListener('click', copyTSV);
  $('downloadCsv').addEventListener('click', downloadCSV);
  [$('expr'), $('expr2')].forEach(function (inp) {
    inp.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
        ev.preventDefault();
        generate();
      }
    });
  });

  applyI18n();

  /* Test hook: real builders used by the UI, callable from smoke tests. */
  window.TT_APP = {
    buildCSV: buildCSV,
    buildTSV: buildTSV,
    generate: generate,
    state: state,
    setLang: function (l) { state.lang = l; applyI18n(); }
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
