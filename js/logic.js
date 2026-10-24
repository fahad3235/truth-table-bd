/* truth-table-bd - logic: strict tokenizer + recursive-descent parser (never eval),
 * evaluator, truth-table builder, canonical forms, classification, equivalence.
 * Universal module: window.TRUTH_LOGIC in the browser, module.exports in Node.
 * Source is pure ASCII. All user-facing Bengali lives in js/i18n.js as \uXXXX. */
(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) { module.exports = factory(); }
  else { root.TRUTH_LOGIC = factory(); }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';

var MAXVARS = 6;

/* Canonical display characters (written as escapes so this file stays ASCII). */
var OPCHAR = {
  not: '\u00AC', and: '\u2227', xor: '\u2295', or: '\u2228', implies: '\u2192', iff: '\u2194'
};
var SIGMA = '\u03A3', PI = '\u03A0';

/* Precedence: not > and > xor > or > implies (right-assoc) > iff. */
var PREC = { iff: 0, implies: 1, or: 2, xor: 3, and: 4, not: 5, atom: 6 };
var RIGHT_ASSOC = { implies: true };

function isUpper(c) { return c >= 'A' && c <= 'Z'; }
function isLetter(c) { return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'); }
function isSpace(c) {
  return c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v';
}

function perr(msg, pos) { var e = new Error(msg); e.pos = pos; return e; }

/* ------------------------------- tokenizer ------------------------------- */
function tokenize(src) {
  var toks = [], i = 0, n = src.length, c, p, j, w;
  while (i < n) {
    c = src.charAt(i);
    if (isSpace(c)) { i++; continue; }
    p = i;
    if (c === '(') { toks.push({ t: 'lp', w: '(', p: p }); i++; continue; }
    if (c === ')') { toks.push({ t: 'rp', w: ')', p: p }); i++; continue; }
    if (c === '\u00AC' || c === '!' || c === '~') { toks.push({ t: 'not', w: c, p: p }); i++; continue; }
    if (c === '\u2227') { toks.push({ t: 'and', w: c, p: p }); i++; continue; }
    if (c === '\u2228') { toks.push({ t: 'or', w: c, p: p }); i++; continue; }
    if (c === '\u2295') { toks.push({ t: 'xor', w: c, p: p }); i++; continue; }
    if (c === '\u2192') { toks.push({ t: 'implies', w: c, p: p }); i++; continue; }
    if (c === '\u2194') { toks.push({ t: 'iff', w: c, p: p }); i++; continue; }
    if (c === '^') { toks.push({ t: 'xor', w: c, p: p }); i++; continue; }
    if (c === '&') {
      if (src.charAt(i + 1) === '&') { toks.push({ t: 'and', w: '&&', p: p }); i += 2; }
      else { toks.push({ t: 'and', w: '&', p: p }); i++; }
      continue;
    }
    if (c === '|') {
      if (src.charAt(i + 1) === '|') { toks.push({ t: 'or', w: '||', p: p }); i += 2; }
      else { toks.push({ t: 'or', w: '|', p: p }); i++; }
      continue;
    }
    if (c === '=') {
      if (src.charAt(i + 1) === '>') { toks.push({ t: 'implies', w: '=>', p: p }); i += 2; }
      else { throw perr('unknown character "=" at position ' + p + ' (did you mean "=>" for implies?)', p); }
      continue;
    }
    if (c === '<') {
      if (src.substr(i, 3) === '<=>') { toks.push({ t: 'iff', w: '<=>', p: p }); i += 3; }
      else { throw perr('unknown character "<" at position ' + p + ' (did you mean "<=>" for iff?)', p); }
      continue;
    }
    if (c === '1') { toks.push({ t: 'ct', w: c, p: p }); i++; continue; }
    if (c === '0') { toks.push({ t: 'cf', w: c, p: p }); i++; continue; }
    if (isLetter(c)) {
      j = i;
      while (j < n && isLetter(src.charAt(j))) { j++; }
      w = src.substring(i, j);
      if (w === 'NOT') { toks.push({ t: 'not', w: w, p: p }); }
      else if (w === 'True' || w === 'T') { toks.push({ t: 'ct', w: w, p: p }); }
      else if (w === 'False' || w === 'F') { toks.push({ t: 'cf', w: w, p: p }); }
      else if (w.length === 1 && isUpper(w)) { toks.push({ t: 'var', w: w, p: p }); }
      else { throw perr('unknown word "' + w + '" at position ' + p, p); }
      i = j;
      continue;
    }
    throw perr('unknown character "' + c + '" at position ' + p, p);
  }
  return toks;
}

/* --------------------------------- parser -------------------------------- */
function parse(src) {
  var out = { ok: false, error: null, pos: 0, root: null, vars: [], label: '' };
  try {
    if (src == null || String(src).replace(/[\s]/g, '') === '') {
      throw perr('empty input: type a logical expression first', 0);
    }
    var toks = tokenize(src);
    var k = 0;
    var varSeen = {}, varOrder = [];

    function peek() { return k < toks.length ? toks[k] : null; }
    function isBin(t) { return !!t && (t.t === 'and' || t.t === 'xor' || t.t === 'or' || t.t === 'implies' || t.t === 'iff'); }

    /* Called right after consuming a binary operator: the next token must be
     * able to start an operand (a unary NOT is fine: "A -> \u00ACB" is legal). */
    function expectOperand(opTok) {
      var r = peek();
      if (!r) {
        throw perr('missing operand after "' + opTok.w + '" at position ' +
          (opTok.p + opTok.w.length) + ' (end of input)', opTok.p + opTok.w.length);
      }
      if (isBin(r)) {
        throw perr('two operators in a row: "' + opTok.w + '" then "' + r.w +
          '" at position ' + r.p, r.p);
      }
      if (r.t === 'rp') {
        throw perr('missing operand before ")" at position ' + r.p, r.p);
      }
    }

    function parseIff() {
      var left = parseImplies(), t;
      while ((t = peek()) && t.t === 'iff') {
        k++;
        expectOperand(t);
        var right = parseImplies();
        left = { t: 'bin', op: 'iff', l: left, r: right };
      }
      return left;
    }
    function parseImplies() {
      var left = parseOr(), t;
      if ((t = peek()) && t.t === 'implies') {
        k++;
        expectOperand(t);
        var right = parseImplies(); /* right-associative */
        return { t: 'bin', op: 'implies', l: left, r: right };
      }
      return left;
    }
    function parseOr() {
      var left = parseXor(), t;
      while ((t = peek()) && t.t === 'or') {
        k++;
        expectOperand(t);
        var right = parseXor();
        left = { t: 'bin', op: 'or', l: left, r: right };
      }
      return left;
    }
    function parseXor() {
      var left = parseAnd(), t;
      while ((t = peek()) && t.t === 'xor') {
        k++;
        expectOperand(t);
        var right = parseAnd();
        left = { t: 'bin', op: 'xor', l: left, r: right };
      }
      return left;
    }
    function parseAnd() {
      var left = parseNot(), t;
      while ((t = peek()) && t.t === 'and') {
        k++;
        expectOperand(t);
        var right = parseNot();
        left = { t: 'bin', op: 'and', l: left, r: right };
      }
      return left;
    }
    function parseNot() {
      var t = peek();
      if (t && t.t === 'not') { k++; return { t: 'un', x: parseNot() }; }
      return parseAtom();
    }
    function parseAtom() {
      var t = peek();
      if (!t) { throw perr('missing operand at end of input', String(src).length); }
      if (isBin(t)) {
        throw perr('expected an operand but found operator "' + t.w + '" at position ' + t.p, t.p);
      }
      if (t.t === 'rp') {
        throw perr('unexpected ")" at position ' + t.p + ' - an operand was expected here', t.p);
      }
      if (t.t === 'var') {
        k++;
        var nxt = peek();
        if (nxt && (nxt.t === 'var' || nxt.t === 'ct' || nxt.t === 'cf')) {
          throw perr('missing operator between "' + t.w + '" and "' + nxt.w +
            '" at position ' + nxt.p, nxt.p);
        }
        if (nxt && nxt.t === 'lp') {
          throw perr('missing operator between "' + t.w + '" and "(" at position ' + nxt.p, nxt.p);
        }
        if (!varSeen[t.w]) { varSeen[t.w] = t.p; varOrder.push(t.w); }
        return { t: 'var', name: t.w };
      }
      if (t.t === 'ct' || t.t === 'cf') { k++; return { t: 'const', v: t.t === 'ct' }; }
      if (t.t === 'lp') {
        k++;
        var inner = parseIff();
        var q = peek();
        if (!q) { throw perr('unbalanced parentheses: missing ")" before end of input', String(src).length); }
        if (q.t !== 'rp') {
          throw perr('unbalanced parentheses: expected ")" but found "' + q.w +
            '" at position ' + q.p, q.p);
        }
        k++;
        return inner;
      }
      throw perr('unexpected "' + t.w + '" at position ' + t.p, t.p);
    }

    var root = parseIff();
    var rest = peek();
    if (rest) {
      if (rest.t === 'rp') {
        throw perr('unexpected ")" at position ' + rest.p + ' - no matching "("', rest.p);
      }
      throw perr('unexpected "' + rest.w + '" at position ' + rest.p, rest.p);
    }
    if (varOrder.length > MAXVARS) {
      var seventh = varOrder[MAXVARS];
      throw perr('too many variables: found ' + varOrder.length + ' (' + varOrder.join(', ') +
        ') - the maximum is ' + MAXVARS, varSeen[seventh]);
    }
    var vars = varOrder.slice().sort();
    out.ok = true;
    out.root = root;
    out.vars = vars;
    out.label = disp(root);
    return out;
  } catch (e) {
    out.ok = false;
    out.error = e.message;
    out.pos = (typeof e.pos === 'number') ? e.pos : 0;
    return out;
  }
}

/* ------------------------- display (canonical) ------------------------- */
function precOf(node) {
  if (node.t === 'bin') { return PREC[node.op]; }
  if (node.t === 'un') { return PREC.not; }
  return PREC.atom;
}
function disp(node) {
  if (node.t === 'var') { return node.name; }
  if (node.t === 'const') { return node.v ? 'T' : 'F'; }
  if (node.t === 'un') {
    var x = disp(node.x);
    if (precOf(node.x) < PREC.not) { x = '(' + x + ')'; }
    return OPCHAR.not + x;
  }
  var p = PREC[node.op], l = disp(node.l), r = disp(node.r);
  var pl = precOf(node.l), pr = precOf(node.r);
  var lParen = (pl < p) || (pl !== p && pl < PREC.atom) || (pl === p && RIGHT_ASSOC[node.op]);
  var rParen = (pr < p) || (pr !== p && pr < PREC.atom) || (pr === p && !RIGHT_ASSOC[node.op]);
  if (lParen) { l = '(' + l + ')'; }
  if (rParen) { r = '(' + r + ')'; }
  return l + ' ' + OPCHAR[node.op] + ' ' + r;
}

/* -------------------------------- evaluator ---------------------------- */
function evaluate(node, env) {
  switch (node.t) {
    case 'var': return !!env[node.name];
    case 'const': return node.v;
    case 'un': return !evaluate(node.x, env);
    case 'bin': {
      var l = evaluate(node.l, env), r = evaluate(node.r, env);
      switch (node.op) {
        case 'and': return l && r;
        case 'or': return l || r;
        case 'xor': return l !== r;
        case 'implies': return (!l) || r;
        case 'iff': return l === r;
      }
      throw new Error('unknown operator ' + node.op);
    }
  }
  throw new Error('bad node');
}

/* ------------------------------ truth table ---------------------------- */
function varsOf(root) {
  var seen = {};
  (function walk(nd) {
    if (nd.t === 'var') { seen[nd.name] = 1; }
    else if (nd.t === 'un') { walk(nd.x); }
    else if (nd.t === 'bin') { walk(nd.l); walk(nd.r); }
  })(root);
  return Object.keys(seen).sort();
}

/* Distinct non-atomic sub-expression columns in first-appearance (pre-order)
 * order; element 0 is always the whole formula. */
function subexprColumns(root) {
  var seen = {}, cols = [];
  (function walk(nd) {
    if (nd.t === 'var' || nd.t === 'const') { return; }
    var d = disp(nd);
    if (!seen[d]) { seen[d] = 1; cols.push({ node: nd, label: d }); }
    if (nd.t === 'un') { walk(nd.x); }
    else { walk(nd.l); walk(nd.r); }
  })(root);
  if (cols.length === 0) { cols.push({ node: root, label: disp(root) }); }
  return cols;
}

function buildTable(root) {
  var vars = varsOf(root);
  var n = vars.length, total = 1 << n;
  var cols = subexprColumns(root);
  var main = cols[0], inter = cols.slice(1);
  var rows = [], i, k, env, bits;
  for (i = 0; i < total; i++) {
    env = {}; bits = [];
    for (k = 0; k < n; k++) {
      var b = ((i >> (n - 1 - k)) & 1) === 1;
      bits.push(b);
      env[vars[k]] = b;
    }
    var vals = [];
    for (var c = 0; c < inter.length; c++) { vals.push(evaluate(inter[c].node, env)); }
    rows.push({ bits: bits, vals: vals, main: evaluate(main.node, env) });
  }
  return {
    vars: vars,
    inter: inter.map(function (c) { return c.label; }),
    mainLabel: main.label,
    rows: rows
  };
}

/* --------------------------- classify + canonical ---------------------- */
function classify(table) {
  var t = 0, i;
  for (i = 0; i < table.rows.length; i++) { if (table.rows[i].main) { t++; } }
  var n = table.rows.length;
  return { kind: t === n ? 'tautology' : (t === 0 ? 'contradiction' : 'contingent'),
           trueCount: t, rowCount: n };
}

function canonical(table) {
  var min = [], max = [], i;
  for (i = 0; i < table.rows.length; i++) {
    if (table.rows[i].main) { min.push(i); } else { max.push(i); }
  }
  return { minterms: min, maxterms: max };
}

function mintermString(min) {
  if (min.length === 0) { return SIGMA + 'm()'; }
  return SIGMA + 'm(' + min.join(', ') + ')';
}
function maxtermString(max) {
  if (max.length === 0) { return PI + 'M()'; }
  return PI + 'M(' + max.join(', ') + ')';
}

/* ------------------------------ equivalence ---------------------------- */
function checkEquivalent(src1, src2) {
  var p1 = parse(src1), p2 = parse(src2);
  if (!p1.ok) { return { ok: false, which: 1, error: p1.error, pos: p1.pos }; }
  if (!p2.ok) { return { ok: false, which: 2, error: p2.error, pos: p2.pos }; }
  var vmap = {}, i, k;
  var all = p1.vars.concat(p2.vars);
  for (i = 0; i < all.length; i++) { vmap[all[i]] = 1; }
  var vars = Object.keys(vmap).sort();
  var n = vars.length, total = 1 << n;
  for (i = 0; i < total; i++) {
    var env = {};
    for (k = 0; k < n; k++) { env[vars[k]] = ((i >> (n - 1 - k)) & 1) === 1; }
    var a = evaluate(p1.root, env), b = evaluate(p2.root, env);
    if (a !== b) {
      var assign = [];
      for (k = 0; k < n; k++) { assign.push(vars[k] + '=' + (env[vars[k]] ? 'T' : 'F')); }
      return { ok: true, equivalent: false, vars: vars, assignments: total,
               counter: assign, counterA: a, counterB: b, counterIndex: i };
    }
  }
  return { ok: true, equivalent: true, vars: vars, assignments: total };
}

/* ------------------------------ Bengali digits ------------------------- */
var BN_DIGITS = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA',
                 '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];
function bnDigits(s) {
  return String(s).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
}

return {
  MAXVARS: MAXVARS,
  OPCHAR: OPCHAR,
  tokenize: tokenize,
  parse: parse,
  disp: disp,
  evaluate: evaluate,
  varsOf: varsOf,
  buildTable: buildTable,
  classify: classify,
  canonical: canonical,
  mintermString: mintermString,
  maxtermString: maxtermString,
  checkEquivalent: checkEquivalent,
  bnDigits: bnDigits
};
}));
