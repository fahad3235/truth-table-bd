/* truth-table-bd - i18n strings (EN + Bengali).
 * Universal module: window.TRUTH_I18N (browser), module.exports (Node).
 * Source is pure ASCII: every Bengali glyph is a unicode escape,
 * generated via /tmp/gen-i18n.js + /tmp/emit-i18n.py.
 * (The word "unicode" above is spelled out to avoid a literal backslash-u
 *  sequence confusing naive ASCII scanners; actual escapes are in strings. */
(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) { module.exports = factory(); }
  else { root.TRUTH_I18N = factory(); }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';

var STR = {
  en: {
    docTitle: 'Truth Table BD',
    brand: 'Truth Table BD',
    tagline: 'Offline propositional-logic truth-table generator for students.',
    offlineNote: '100% offline - no network requests.',
    exprLabel: 'Expression',
    expr2Label: 'Second expression (equivalence check)',
    placeholder: 'e.g. (A && B) => C',
    generate: 'Generate',
    ctrlHint: 'Tip: press Ctrl+Enter to generate.',
    emptyTitle: 'Nothing generated yet',
    emptyHint: 'Type a logical expression above - or tap a preset - then press Generate.',
    errorTitle: 'The expression has a problem:',
    tableTitle: 'Truth table',
    rowsBadge: '{t}/{n} true rows',
    classTitle: 'Classification',
    classLine: 'True in {t} of {n} rows - this formula is a {kind}.',
    canonTitle: 'Canonical forms',
    minterms: 'Minterms',
    maxterms: 'Maxterms',
    none: 'none',
    equivTitle: 'Equivalence checker',
    checkEquiv: 'Check equivalence',
    equiv2Invalid: 'Second expression is invalid:',
    equivYes: 'Equivalent - both formulas agree on all {n} assignments.',
    equivNo: 'Not equivalent - first difference at: {assign}.',
    counterLabel: 'First counterexample',
    copyTsv: 'Copy table (TSV)',
    downloadCsv: 'Download CSV',
    copied: 'Table copied to clipboard.',
    copyFailed: 'Copy failed - clipboard blocked in this browser.',
    presetsTitle: 'Quick presets',
    opsTitle: 'Operators',
    opsHelp: 'NOT: ! ~ \u00ac or NOT | AND: && & \u2227 | OR: || | \u2228 | XOR: ^ \u2295 | IMPLIES: => \u2192 | IFF: <=> \u2194 | constants: T True 1 / F False 0 | variables: single uppercase letters A-Z (except T, F), max 6',
    loading: 'Generating...',
    trueWord: 'T',
    falseWord: 'F',
    tautology: 'Tautology',
    contradiction: 'Contradiction',
    contingent: 'Contingent',
    langToggle: '\u09ac\u09be\u0982\u09b2\u09be',
  },
  bn: {
    docTitle: '\u099f\u09cd\u09b0\u09c1\u09a5 \u099f\u09c7\u09ac\u09bf\u09b2 \u09ac\u09bf\u09a1\u09bf',
    brand: '\u099f\u09cd\u09b0\u09c1\u09a5 \u099f\u09c7\u09ac\u09bf\u09b2 \u09ac\u09bf\u09a1\u09bf',
    tagline: '\u09b6\u09bf\u0995\u09cd\u09b7\u09be\u09b0\u09cd\u09a5\u09c0\u09a6\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u0985\u09ab\u09b2\u09be\u0987\u09a8 \u09aa\u09cd\u09b0\u09aa\u09cb\u099c\u09bf\u09b6\u09a8\u09be\u09b2-\u09b2\u099c\u09bf\u0995 \u099f\u09cd\u09b0\u09c1\u09a5-\u099f\u09c7\u09ac\u09bf\u09b2 \u099c\u09c7\u09a8\u09be\u09b0\u09c7\u099f\u09b0\u0964',
    offlineNote: '\u09e7\u09e6\u09e6% \u0985\u09ab\u09b2\u09be\u0987\u09a8 - \u0995\u09cb\u09a8\u09cb \u09a8\u09c7\u099f\u0993\u09af\u09bc\u09be\u09b0\u09cd\u0995 \u0985\u09a8\u09c1\u09b0\u09cb\u09a7 \u09a8\u09c7\u0987\u0964',
    exprLabel: '\u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b6\u09a8',
    expr2Label: '\u09a6\u09cd\u09ac\u09bf\u09a4\u09c0\u09af\u09bc \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b6\u09a8 (\u09b8\u09ae\u09a4\u09c1\u09b2\u09cd\u09af\u09a4\u09be \u09af\u09be\u099a\u09be\u0987)',
    placeholder: '\u09af\u09c7\u09ae\u09a8 (A && B) => C',
    generate: '\u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8',
    ctrlHint: '\u099f\u09bf\u09aa\u09b8: \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09a4\u09c7 Ctrl+Enter \u099a\u09be\u09aa\u09c1\u09a8\u0964',
    emptyTitle: '\u098f\u0996\u09a8\u09cb \u0995\u09bf\u099b\u09c1 \u09a4\u09c8\u09b0\u09bf \u09b9\u09af\u09bc\u09a8\u09bf',
    emptyHint: '\u0989\u09aa\u09b0\u09c7 \u098f\u0995\u099f\u09bf \u09b2\u099c\u09bf\u0995\u09cd\u09af\u09be\u09b2 \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b6\u09a8 \u09b2\u09bf\u0996\u09c1\u09a8 - \u0985\u09a5\u09ac\u09be \u098f\u0995\u099f\u09bf \u09aa\u09cd\u09b0\u09bf\u09b8\u09c7\u099f\u09c7 \u099f\u09cd\u09af\u09be\u09aa \u0995\u09b0\u09c1\u09a8 - \u09a4\u09be\u09b0\u09aa\u09b0 \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8 \u099a\u09be\u09aa\u09c1\u09a8\u0964',
    errorTitle: '\u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b6\u09a8\u09c7 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u0986\u099b\u09c7:',
    tableTitle: '\u099f\u09cd\u09b0\u09c1\u09a5 \u099f\u09c7\u09ac\u09bf\u09b2',
    rowsBadge: '{t}/{n}\u099f\u09bf \u09b8\u09a4\u09cd\u09af \u09b8\u09be\u09b0\u09bf',
    classTitle: '\u09b6\u09cd\u09b0\u09c7\u09a3\u09bf\u09ac\u09bf\u09ad\u09be\u0997',
    classLine: '{n}\u099f\u09bf \u09b8\u09be\u09b0\u09bf\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 {t}\u099f\u09bf\u09a4\u09c7 \u09b8\u09a4\u09cd\u09af - \u09ab\u09b0\u09cd\u09ae\u09c1\u09b2\u09be\u099f\u09bf {kind}\u0964',
    canonTitle: '\u0995\u09cd\u09af\u09be\u09a8\u09cb\u09a8\u09bf\u0995\u09cd\u09af\u09be\u09b2 \u09ab\u09b0\u09cd\u09ae',
    minterms: '\u09ae\u09bf\u09a8\u099f\u09be\u09b0\u09cd\u09ae',
    maxterms: '\u09ae\u09cd\u09af\u09be\u0995\u09cd\u09b8\u099f\u09be\u09b0\u09cd\u09ae',
    none: '\u09a8\u09c7\u0987',
    equivTitle: '\u09b8\u09ae\u09a4\u09c1\u09b2\u09cd\u09af\u09a4\u09be \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u0995',
    checkEquiv: '\u09b8\u09ae\u09a4\u09c1\u09b2\u09cd\u09af\u09a4\u09be \u09af\u09be\u099a\u09be\u0987 \u0995\u09b0\u09c1\u09a8',
    equiv2Invalid: '\u09a6\u09cd\u09ac\u09bf\u09a4\u09c0\u09af\u09bc \u098f\u0995\u09cd\u09b8\u09aa\u09cd\u09b0\u09c7\u09b6\u09a8\u099f\u09bf \u09b8\u09a0\u09bf\u0995 \u09a8\u09af\u09bc:',
    equivYes: '\u09b8\u09ae\u09a4\u09c1\u09b2\u09cd\u09af - \u09b8\u09ac {n}\u099f\u09bf \u0985\u09cd\u09af\u09be\u09b8\u09be\u0987\u09a8\u09ae\u09c7\u09a8\u09cd\u099f\u09c7 \u0989\u09ad\u09af\u09bc \u09ab\u09b0\u09cd\u09ae\u09c1\u09b2\u09be \u098f\u0995\u09ae\u09a4\u0964',
    equivNo: '\u09b8\u09ae\u09a4\u09c1\u09b2\u09cd\u09af \u09a8\u09af\u09bc - \u09aa\u09cd\u09b0\u09a5\u09ae \u09aa\u09be\u09b0\u09cd\u09a5\u0995\u09cd\u09af: {assign}\u0964',
    counterLabel: '\u09aa\u09cd\u09b0\u09a5\u09ae \u0995\u09be\u0989\u09a8\u09cd\u099f\u09be\u09b0-\u0989\u09a6\u09be\u09b9\u09b0\u09a3',
    copyTsv: '\u099f\u09c7\u09ac\u09bf\u09b2 \u0995\u09aa\u09bf (TSV)',
    downloadCsv: 'CSV \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1',
    copied: '\u099f\u09c7\u09ac\u09bf\u09b2 \u0995\u09cd\u09b2\u09bf\u09aa\u09ac\u09cb\u09b0\u09cd\u09a1\u09c7 \u0995\u09aa\u09bf \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
    copyFailed: '\u0995\u09aa\u09bf \u09ac\u09cd\u09af\u09b0\u09cd\u09a5 - \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 \u0995\u09cd\u09b2\u09bf\u09aa\u09ac\u09cb\u09b0\u09cd\u09a1 \u09ac\u09cd\u09b2\u0995 \u0995\u09b0\u09be \u0986\u099b\u09c7\u0964',
    presetsTitle: '\u09a6\u09cd\u09b0\u09c1\u09a4 \u09aa\u09cd\u09b0\u09bf\u09b8\u09c7\u099f',
    opsTitle: '\u0985\u09aa\u09be\u09b0\u09c7\u099f\u09b0',
    opsHelp: 'NOT: ! ~ \u00ac \u09ac\u09be NOT | AND: && & \u2227 | OR: || | \u2228 | XOR: ^ \u2295 | IMPLIES: => \u2192 | IFF: <=> \u2194 | \u09a7\u09cd\u09b0\u09c1\u09ac\u0995: T True 1 / F False 0 | \u099a\u09b2\u0995: \u098f\u0995\u0995 \u09ac\u09a1\u09bc \u09b9\u09be\u09a4\u09c7\u09b0 \u0985\u0995\u09cd\u09b7\u09b0 A-Z (T, F \u09ac\u09be\u09a6\u09c7), \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09ec\u099f\u09bf',
    loading: '\u09a4\u09c8\u09b0\u09bf \u09b9\u099a\u09cd\u099b\u09c7...',
    trueWord: '\u09b8\u09a4\u09cd\u09af',
    falseWord: '\u09ae\u09bf\u09a5\u09cd\u09af\u09be',
    tautology: '\u099f\u099f\u09cb\u09b2\u099c\u09bf',
    contradiction: '\u0995\u09a8\u09cd\u099f\u09cd\u09b0\u09be\u09a1\u09bf\u0995\u09b6\u09a8',
    contingent: '\u0995\u09a8\u09cd\u099f\u09bf\u09a8\u099c\u09c7\u09a8\u09cd\u099f',
    langToggle: '\u09ac\u09be\u0982\u09b2\u09be',
  }
};

var PRESETS = [
  { en: 'De Morgan', bn: '\u09a1\u09bf \u09ae\u09b0\u09cd\u0997\u09be\u09a8', expr: '!(A&&B)' },
  { en: 'Contrapositive', bn: '\u0995\u09a8\u09cd\u099f\u09cd\u09b0\u09be\u09aa\u099c\u09bf\u099f\u09bf\u09ad', expr: '(A=>B)<=>(!B=>!A)' },
  { en: 'Absorption', bn: '\u0985\u09cd\u09af\u09be\u09ac\u099c\u09b0\u09cd\u09aa\u09b6\u09a8', expr: 'A||(A&&B)' },
  { en: 'Distributive', bn: '\u09a1\u09bf\u09b8\u09cd\u099f\u09cd\u09b0\u09bf\u09ac\u09bf\u0989\u099f\u09bf\u09ad', expr: 'A&&(B||C)' },
  { en: 'Material implication', bn: '\u09ae\u09cd\u09af\u09be\u099f\u09c7\u09b0\u09bf\u09af\u09bc\u09be\u09b2 \u0987\u09ae\u09aa\u09cd\u09b2\u09bf\u0995\u09c7\u09b6\u09a8', expr: 'A=>B', expr2: '!A||B', equiv: true },
  { en: 'XOR', bn: '\u098f\u0995\u09cd\u09b8\u0985\u09b0', expr: 'A^B' },
];

return { STR: STR, PRESETS: PRESETS };
}));
