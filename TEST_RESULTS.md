# TEST_RESULTS.md - truth-table-bd (factory run #123, 2026-10-24)

All numbers below are real, produced by running the commands shown. Nothing is invented.
(Operator symbols below use the app's ASCII spellings: ! ~ && || ^ => <=>.)

## Unit tests (Node, no dependencies)

Command: `node tests/run-node-tests.js`
Result: **120 passed, 0 failed**

Coverage:
- Precedence (structural + canonical display): `!A||B` parses as `(!A)||B`;
  `A&&B||C` renders `(A AND B) OR C`; `A=>B=>C` is right-associative
  `A=>(B=>C)`; `A<=>B=>C` parses as `A<=>(B=>C)`; `(A=>B)=>C` keeps left
  parens; `!(A&&B)` keeps parens under NOT.
- All operator spellings parse to identical tables: NOT (`!` `~` `NOT` `NOT`),
  AND (`&&` `&`), OR (`||` `|`), XOR (`^`), IMPLIES (`=>`), IFF (`<=>`).
  (The unicode spellings are exercised via \uXXXX escapes in the test file.)
- Hand-verified tables: `A&&B` = FF->F, FT->F, TF->F, TT->T;
  `A=>B` = FF->T, FT->T, TF->F, TT->T; `"A"` alone valid with 2 rows.
- Constants `T`/`True`/`1`, `F`/`False`/`0`; `F&&A` contradiction, `T||A` tautology.
- Classification: `A||!A` tautology; `A&&!A` contradiction; `A^B` contingent
  (2 of 4 true rows).
- Equivalences: `!(A&&B)` equivalent to `!A||!B`; `(A=>B)` equivalent to
  `(!A||B)`, and `(A=>B)<=>(!A||B)` is a tautology; `A&&B` NOT equivalent to
  `A||B` with first counterexample `A=F,B=T`; `A=>B` NOT equivalent to `B=>A`
  (first counterexample `A=F,B=T`); `A` equivalent to `A&&A`.
- Canonical forms: `A^B` minterms `[1,2]` / maxterms `[0,3]`;
  `A&&B` minterms `[3]` / maxterms `[0,1,2]`; tautology has all minterms and
  an empty maxterm list.
- Sub-expression columns: `!(A&&B)||C` yields 2 intermediate columns;
  duplicate `(A&&B)` in `(A&&B)||(A&&B)` appears once.
- 16 invalid inputs rejected, each naming the problem and a position:
  `""` (empty input), `A &&` (missing operand), leading `&&` (expected an
  operand), `A B` (missing operator), `(A` (unbalanced parentheses),
  `A)` (unexpected ")"), `A &&& B` (two operators in a row), `A $ B`
  (unknown character, position 2), `A&B&C&D&E&G&H` (too many variables:
  found 7, names the 7th), plus `A | | B`, `()`, `NOT`, `A=>`, `((A)`,
  `ab`, `A2`.
- Bengali digits: `bnDigits('0123456789')` yields Bengali digits;
  non-digits untouched.
- i18n: EN/BN key parity (40 keys each); BN trueWord starts with a Bengali
  letter; 6 presets with the material-implication preset carrying expr2 +
  equiv flag.

One repair during development: a test (not the engine) expected the NOT table
over one variable to have 4 rows; corrected to 2 rows.

## Headless-Chrome smoke tests (raw CDP, /opt/meta-chromium/chrome, file://)

Command: `node tests/smoke.mjs`
Result: **37 passed, 0 failed** - **0 console errors, 0 page errors**

Assertions covered: title/brand render; zero console/page errors on load and in
the final sweep; zero network requests (every performance resource entry is
`file://`); empty state visible before generation; input prefilled with
`A && B`; typing `AANDB` + Generate renders 4 data rows with main column
`F,F,F,T` (correct for row order FF,FT,TF,TT) and a canonical header;
exactly 1 true row highlighted; classification Contingent; minterms cover
index 3; maxterms cover 0,1,2; CSV from the real builder has 5 lines (2^2+1)
with a quoted header; copy-TSV button shows a status message; equivalence of
`!(A&&B)` vs `!A||!B` reports Equivalent; `A&&B` vs `A||B` reports Not
equivalent with counterexample `A=F, B=F`; invalid `A &&` shows an inline
error naming the problem ("missing operand") and the position; De Morgan
preset fills `!(A&&B)` and generates; BN toggle renders Bengali words in
cells and Bengali digits in row numbers, classification leaves English,
language persists in localStorage across reload; 390px mobile viewport has no
horizontal page overflow with a 6-variable table rendered.

Two smoke-test repairs during development (both were wrong expectations in the
test, not app bugs): the equivalence test initially compared the wrong input
pair, and two expectations used TT-first row order / a stale counterexample -
corrected to the verified values (the engine was right in all cases).

Note on the build brief: it asked the smoke test to expect main column
`T,F,F,F` for `A&&B`; that string assumes TT-first row order. The app uses the
standard binary-counting row order FF,FT,TF,TT, so the correct column is
`F,F,F,T`, which the test now asserts.

## Purity check

`grep -P '[^\x00-\x7F]'` over `index.html`, `css/`, `js/`, `tests/`,
`README.md`, `BUILD_LOG.md`, `TEST_RESULTS.md`: **zero matches** - all
sources are pure ASCII; Bengali appears only as `\uXXXX` escapes inside JS
strings in `js/i18n.js`.
