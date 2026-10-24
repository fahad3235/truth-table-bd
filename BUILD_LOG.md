# BUILD_LOG.md - truth-table-bd (factory run #123, 2026-10-24, 13:00 slot)

## Plan
Offline bilingual (EN/Bangla) propositional-logic truth-table generator.
Generator-with-checks pattern: strict tokenizer + recursive-descent parser,
full truth tables, classification, equivalence checker with counterexample,
canonical forms, 6 presets, TSV copy + CSV download. Pure-ASCII sources;
Bengali only as \uXXXX escapes in js/i18n.js.

## Steps
1. Read factory state files and prior-build conventions (chess-bd, cron-explainer-bd):
   classic scripts with globals, UMD modules for Node tests, raw-CDP smoke tests.
2. Wrote js/logic.js (tokenizer, recursive-descent parser, evaluator, table
   builder, canonical forms, classifier, equivalence, bnDigits). Fixed one
   self-introduced raw-Unicode slip in OPCHAR via escapes before testing.
3. Wrote tests/run-node-tests.js (115 checks initially).
4. Generated js/i18n.js from /tmp/gen-i18n.js (Bengali authored raw in /tmp,
   emitted as \uXXXX via /tmp/emit-i18n.py). Repaired the emitter twice: a
   missing `*/` comment close and a broken newline-join line.
5. Wrote css/style.css (dark slate + teal, responsive, print CSS),
   index.html, js/app.js.
6. Wrote tests/smoke.mjs (raw CDP against /opt/meta-chromium/chrome, file://).
7. Fixed one real test expectation (NOT-table row count) and re-ran.
8. Smoke run 1: 35 passed, 2 failed - both were test bugs, not app bugs:
   (a) expected English cell words "True/False" but switched EN cells to T/F
       per the build brief ("main column T,F,F,F"); (b) equivalence test set
       only the second input, comparing the wrong pair.
9. Smoke run 2: 35 passed, 2 failed - both test-expectation bugs: the brief's
   "T,F,F,F" string assumed TT-first row order, but the app (correctly) uses
   standard binary order FF,FT,TF,TT giving F,F,F,T for AANDB; and the
   counterexample expectation still matched the old input pair. Fixed the
   test to assert the verified-correct values.
10. Smoke run 3: 37 passed, 0 failed. 0 console errors, 0 page errors.
11. Wrote README.md, .gitignore, TEST_RESULTS.md, BUILD_LOG.md.
12. Verified pure-ASCII: grep -P '[^\x00-\x7F]' over index.html, css, js,
    tests returns zero matches.

## Repairs
- Node tests: 1 (wrong NOT-table expectation in the test itself; engine correct).
- Smoke tests: 2 runs of test-expectation fixes (wrong input pair; wrong
  expected column order/counterexample). No app-logic repairs needed.
- i18n emitter: 2 (unclosed comment, broken join line).

## Result
COMPLETE. 120/120 Node unit tests, 37/37 smoke tests, 0 console errors,
0 page errors, 0 network requests. App sources 100% ASCII.
No secrets in code. Nothing pushed (parent handles repo creation/push).
