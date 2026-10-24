/* truth-table-bd - Node unit tests (plain node:assert, no dependencies).
 * Run: node tests/node-tests.mjs   (also runnable: node tests/run-node-tests.js)
 * Pure ASCII source; Bengali checked only via \\u escapes and code points. */
'use strict';
const assert = require('node:assert');
const L = require('../js/logic.js');

let pass = 0, fail = 0;
const failures = [];
function check(cond, label) {
  if (cond) { pass++; }
  else { fail++; failures.push(label); console.log('FAIL - ' + label); }
}
function colOf(src) { /* main-column values of the truth table, in row order */
  const p = L.parse(src);
  assert(p.ok, 'parse must succeed for ' + src + ' (got: ' + p.error + ')');
  return L.buildTable(p.root).rows.map(r => r.main);
}
function T() { return true; } function F() { return false; }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
const NOT = '\u00ac', AND = '\u2227', OR = '\u2228', XOR = '\u2295', IMP = '\u2192', IFF = '\u2194';

/* ---------- precedence (structural + display) ---------- */
{
  const p = L.parse('!' + 'A' + '||B');
  check(p.ok && p.root.op === 'or' && p.root.l.t === 'un' && p.root.l.x.name === 'A',
    'precedence: !A||B parses as (!A)||B (not > or)');
  check(L.disp(L.parse(NOT + 'A' + OR + 'B').root) === '(' + NOT + 'A) ' + OR + ' B',
    'display: \u00acA\u2228B renders as "(\u00acA) \u2228 B"');
  check(L.disp(L.parse('A' + AND + 'B' + OR + 'C').root) === '(A ' + AND + ' B) ' + OR + ' C',
    'display: A\u2227B\u2228C renders as "(A \u2227 B) \u2228 C"');
  const r = L.parse('A' + IMP + 'B' + IMP + 'C').root;
  check(r.op === 'implies' && r.r.op === 'implies',
    'precedence: A\u2192B\u2192C is right-associative A\u2192(B\u2192C)');
  check(L.disp(r) === 'A ' + IMP + ' B ' + IMP + ' C',
    'display: right-assoc chain needs no parens');
  const r2 = L.parse('A' + IFF + 'B' + IMP + 'C').root;
  check(r2.op === 'iff' && r2.r.op === 'implies',
    'precedence: A\u2194B\u2192C parses as A\u2194(B\u2192C)');
  check(L.disp(r2) === 'A ' + IFF + ' (B ' + IMP + ' C)',
    'display: A\u2194B\u2192C renders as "A \u2194 (B \u2192 C)"');
  const r3 = L.parse('(' + 'A' + IMP + 'B)' + IMP + 'C').root;
  check(L.disp(r3) === '(A ' + IMP + ' B) ' + IMP + ' C',
    'display: (A\u2192B)\u2192C keeps left parens');
  check(L.disp(L.parse(NOT + '(A' + AND + 'B)').root) === NOT + '(A ' + AND + ' B)',
    'display: \u00ac(A\u2227B) keeps parens under NOT');
}

/* ---------- every operator spelling parses to the same table ---------- */
const andSpell = ['A&&B', 'A&B', 'A' + AND + 'B'];
const orSpell = ['A||B', 'A|B', 'A' + OR + 'B'];
const notSpell = ['!A', '~A', NOT + 'A', 'NOT A'];
const xorSpell = ['A^B', 'A' + XOR + 'B'];
const impSpell = ['A=>B', 'A' + IMP + 'B'];
const iffSpell = ['A<=>B', 'A' + IFF + 'B'];
andSpell.forEach(s => check(eq(colOf(s), [F(), F(), F(), T()]), 'AND spelling "' + s + '" = A\u2227B table'));
orSpell.forEach(s => check(eq(colOf(s), [F(), T(), T(), T()]), 'OR spelling "' + s + '" = A\u2228B table'));
xorSpell.forEach(s => check(eq(colOf(s), [F(), T(), T(), F()]), 'XOR spelling "' + s + '" = A\u2295B table'));
impSpell.forEach(s => check(eq(colOf(s), [T(), T(), F(), T()]), 'IMPLIES spelling "' + s + '" = A\u2192B table'));
iffSpell.forEach(s => check(eq(colOf(s), [T(), F(), F(), T()]), 'IFF spelling "' + s + '" = A\u2194B table'));
{
  const ref = colOf('!A');
  notSpell.forEach(s => check(eq(colOf(s), ref), 'NOT spelling "' + s + '" matches !A'));
  check(eq(ref, [T(), F()]), 'NOT table over one variable is [T,F]');
}

/* ---------- hand-verified tables ---------- */
check(eq(colOf('A&&B'), [F(), F(), F(), T()]), 'hand: A\u2227B = FF\u2192F, FT\u2192F, TF\u2192F, TT\u2192T');
check(eq(colOf('A=>B'), [T(), T(), F(), T()]), 'hand: A\u2192B = FF\u2192T, FT\u2192T, TF\u2192F, TT\u2192T');
check(eq(colOf('A'), [F(), T()]), '"A" alone is valid with 2 rows');

/* ---------- constants ---------- */
check(L.parse('T').ok && L.parse('True').ok && L.parse('1').ok, 'constants T/True/1 parse');
check(L.parse('F').ok && L.parse('False').ok && L.parse('0').ok, 'constants F/False/0 parse');
check(eq(colOf('T'), [T()]), 'constant T table is [T]');
check(eq(colOf('F'), [F()]), 'constant F table is [F]');
check(L.classify(L.buildTable(L.parse('F&&A').root)).kind === 'contradiction', 'F&&A is a contradiction');
check(L.classify(L.buildTable(L.parse('T||A').root)).kind === 'tautology', 'T||A is a tautology');

/* ---------- classification ---------- */
check(L.classify(L.buildTable(L.parse('A||!A').root)).kind === 'tautology', 'A\u2228\u00acA is a tautology');
check(L.classify(L.buildTable(L.parse('A&&!A').root)).kind === 'contradiction', 'A\u2227\u00acA is a contradiction');
{
  const c = L.classify(L.buildTable(L.parse('A^B').root));
  check(c.kind === 'contingent' && c.trueCount === 2 && c.rowCount === 4,
    'A\u2295B is contingent with 2 of 4 true rows');
}

/* ---------- named equivalences ---------- */
{
  const e1 = L.checkEquivalent(NOT + '(A' + AND + 'B)', NOT + 'A' + OR + NOT + 'B');
  check(e1.ok && e1.equivalent === true, 'equivalence: \u00ac(A\u2227B) \u2261 \u00acA\u2228\u00acB');
  const e2 = L.checkEquivalent('(A' + IMP + 'B)', NOT + 'A' + OR + 'B');
  check(e2.ok && e2.equivalent === true, 'equivalence: (A\u2192B) \u2261 (\u00acA\u2228B)');
  const t = L.classify(L.buildTable(L.parse('(A=>B)<=>(!A||B)').root));
  check(t.kind === 'tautology', '(A\u2192B)\u2194(\u00acA\u2228B) is a tautology');
  const e3 = L.checkEquivalent('A&&B', 'A||B');
  check(e3.ok && e3.equivalent === false, 'A\u2227B is NOT equivalent to A\u2228B');
  check(eq(e3.counter, ['A=F', 'B=T']), 'first counterexample of A\u2227B vs A\u2228B is A=F,B=T');
  check(e3.counterA === false && e3.counterB === true, 'counterexample values: A\u2227B=F, A\u2228B=T');
  const e4 = L.checkEquivalent('A=>B', 'B=>A');
  check(e4.ok && !e4.equivalent && eq(e4.counter, ['A=F', 'B=T']),
    'A\u2192B vs B\u2192A: not equivalent, first counterexample A=F,B=T');
  const e5 = L.checkEquivalent('A', 'A&&A');
  check(e5.ok && e5.equivalent, 'A \u2261 A\u2227A (idempotence)');
}

/* ---------- canonical forms ---------- */
{
  const can = L.canonical(L.buildTable(L.parse('A^B').root));
  check(eq(can.minterms, [1, 2]), 'A\u2295B minterms are [1,2]');
  check(eq(can.maxterms, [0, 3]), 'A\u2295B maxterms are [0,3]');
  check(L.mintermString(can.minterms) === '\u03a3m(1, 2)', 'minterm string is "\u03a3m(1, 2)"');
  check(L.maxtermString(can.maxterms) === '\u03a0M(0, 3)', 'maxterm string is "\u03a0M(0, 3)"');
  const can2 = L.canonical(L.buildTable(L.parse('A&&B').root));
  check(eq(can2.minterms, [3]), 'A\u2227B minterms are [3]');
  check(eq(can2.maxterms, [0, 1, 2]), 'A\u2227B maxterms are [0,1,2]');
  const can3 = L.canonical(L.buildTable(L.parse('A||!A').root));
  check(eq(can3.minterms, [0, 1]) && eq(can3.maxterms, []), 'tautology: all minterms, no maxterms');
  check(L.maxtermString(can3.maxterms) === '\u03a0M()', 'empty maxterm list renders "\u03a0M()"');
}

/* ---------- sub-expression columns ---------- */
{
  const tb = L.buildTable(L.parse('!(A&&B)||C').root);
  check(eq(tb.vars, ['A', 'B', 'C']), 'columns: vars sorted A,B,C');
  check(tb.inter.length === 2, 'columns: 2 intermediate sub-expressions for !(A&&B)||C');
  check(tb.mainLabel.indexOf(OR) >= 0, 'main column label is the whole formula');
  const tb2 = L.buildTable(L.parse('(A&&B)||(A&&B)').root);
  check(tb2.inter.length === 1 && tb2.inter[0] === 'A ' + AND + ' B',
    'duplicate sub-expression (A\u2227B) appears once');
}

/* ---------- invalid inputs rejected ---------- */
const invalid = [
  ['', 'empty input'],
  ['A ' + AND, 'missing operand'],
  [AND + ' A', 'expected an operand'],
  ['A B', 'missing operator'],
  ['(A', 'unbalanced parentheses'],
  ['A)', 'unexpected ")"'],
  ['A &&& B', 'two operators in a row'],
  ['A $ B', 'unknown character'],
  ['A&B&C&D&E&G&H', 'too many variables'],
  ['A | | B', 'two operators in a row'],
  ['()', 'unexpected ")"'],
  ['NOT', 'missing operand'],
  ['A=>', 'missing operand'],
  ['((A)', 'unbalanced parentheses'],
  ['ab', 'unknown word'],
  ['A2', 'unknown character'],
];
invalid.forEach(function (pair) {
  const p = L.parse(pair[0]);
  check(p.ok === false, 'reject "' + pair[0] + '" (must not parse)');
  check(typeof p.error === 'string' && p.error.indexOf(pair[1]) >= 0,
    'reject "' + pair[0] + '" names "' + pair[1] + '" (got: ' + p.error + ')');
  check(typeof p.pos === 'number' && p.pos >= 0, 'reject "' + pair[0] + '" reports a position');
});
{
  const p = L.parse('A&B&C&D&E&G&H');
  check(p.error.indexOf('7') >= 0 && p.error.indexOf('H') >= 0,
    '7-variable error names the count and the 7th variable (got: ' + p.error + ')');
  const q = L.parse('A $ B');
  check(q.pos === 2, 'unknown-character position is exact (got ' + q.pos + ')');
}

/* ---------- Bengali digits ---------- */
check(L.bnDigits('0123456789') === '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef', 'bnDigits maps 0-9 to Bengali digits');
check(L.bnDigits('rows: 64') === 'rows: \u09ec\u09ea', 'bnDigits leaves non-digits alone');

/* ---------- tokenizer details ---------- */
{
  const toks = L.tokenize('A<=>B');
  check(toks.length === 3 && toks[1].t === 'iff' && toks[1].w === '<=>', 'tokenizer: <=> is one iff token');
  const toks2 = L.tokenize('A=>B');
  check(toks2[1].t === 'implies', 'tokenizer: => is one implies token');
  check(L.parse('NOT A').ok && L.parse('NOT(A)').ok, 'keyword NOT parses with and without space');
  check(L.parse('A&&!B||C').vars.join('') === 'ABC', 'mixed expression collects 3 vars');
  check(L.parse('A&&B&&C&&D&&E&&G').ok, 'exactly 6 variables is allowed');
}

/* ---------- i18n key parity ---------- */
{
  const I = require('../js/i18n.js');
  const ek = Object.keys(I.STR.en).sort(), bk = Object.keys(I.STR.bn).sort();
  check(JSON.stringify(ek) === JSON.stringify(bk), 'i18n: en/bn key parity (' + ek.length + ' keys)');
  check(I.STR.bn.trueWord.charCodeAt(0) === 0x09B8, 'i18n: bn trueWord starts with a Bengali letter');
  check(I.STR.en.langToggle.charCodeAt(0) === 0x09AC, 'i18n: en langToggle is the Bengali word for Bangla');
  check(I.PRESETS.length === 6 && I.PRESETS[4].equiv === true && I.PRESETS[4].expr2 === '!A||B',
    'i18n: 6 presets; material-implication preset carries expr2 and equiv flag');
  check(I.STR.bn.classLine.indexOf('{kind}') >= 0, 'i18n: bn classLine has {kind} placeholder');
}

console.log
console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail > 0) { console.log('FAILURES:'); failures.forEach(f => console.log(' - ' + f)); process.exit(1); }
