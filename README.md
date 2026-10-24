# Truth Table BD

Offline, bilingual (English / Bengali) propositional-logic truth-table generator
for students. Type a logical expression, get the full truth table, formula
classification, canonical forms, and an equivalence checker - all in the
browser, with zero network requests.

Built as factory run #123 of the MUSE Project Factory (2026-10-24).

## What it does

1. **Expression input + strict validation** - a hand-written tokenizer and
   recursive-descent parser (never `eval`). Inline errors name the problem
   and the exact character position: empty input, unbalanced parentheses,
   missing operand, dangling operator, unknown character, two variables in a
   row, consecutive binary operators, and more than 6 variables.
2. **Full truth table** - 2^n rows, one column per variable plus one column
   per distinct sub-expression plus the main formula. Rows where the formula
   is true are highlighted.
3. **Classification** - Tautology / Contradiction / Contingent, with the
   true-row count and a one-line explanation.
4. **Equivalence checker** - second expression field; compares the final
   columns and reports "Equivalent" or "Not equivalent" with the first
   counterexample assignment where they differ.
5. **Canonical forms** - minterm list and maxterm list of the main formula
   (standard Sigma-m / Pi-M notation in the UI); variables sorted
   alphabetically, first variable MSB.
6. **Six quick-pick presets** - De Morgan, contrapositive, absorption,
   distributive law, material implication (auto-runs the equivalence check),
   and XOR.
7. **Copy table as TSV + download as CSV.**

Bilingual UI: an EN/Bangla toggle (persisted in localStorage). In Bangla
mode, True/False render as Bengali words and all digits render as Bengali
digits. (This README is pure ASCII; the Bengali UI strings live in
`js/i18n.js` as `\uXXXX` escapes.)

## Operators

| Meaning  | Spellings                          |
|----------|------------------------------------|
| NOT      | `!` `~` `NOT`             |
| AND      | `&&` `&`                  |
| XOR      | `^`                       |
| OR       | `||` `|`                  |
| IMPLIES  | `=>`   |
| IFF      | `<=>`                     |
| Constants| `T` `True` `1` = true; `F` `False` `0` = false |

The single-glyph logic symbols for each operator are also accepted as input
(the app renders them in table headers); the ASCII spellings above are the
safest to type.

Variables: single uppercase letters A-Z (except `T` and `F`, which are
constants). Maximum 6 distinct variables per expression.

Precedence: NOT > AND > XOR > OR > IMPLIES (right-assoc) > IFF.
Parentheses supported. Examples: `!(A&&B)`, `(A=>B)<=>(!B=>!A)`, `A||(A&&B)`.

## Run it

No build step, no dependencies, no server. Open `index.html` in any modern
browser - everything runs locally from `file://`.

- `Generate` (or `Ctrl+Enter`) builds the table.
- The language toggle in the header switches English / Bangla and remembers
  your choice.

## Tests

- `node tests/run-node-tests.js` - 120 unit tests: tokenizer, parser
  precedence (structural + display), every operator spelling, hand-verified
  tables, named equivalences, classification, canonical forms, sub-expression
  columns, 16 invalid-input rejections, Bengali digits, i18n key parity.
- `node tests/smoke.mjs` - 37 headless-Chrome (raw CDP) UI assertions: clean
  load with zero console/page errors, zero network requests, table render,
  classification, canonical forms, CSV shape, TSV copy, equivalence verdicts
  with counterexample, inline errors, preset click, Bangla toggle with
  persistence across reload, and 390px mobile with no horizontal overflow.

See `TEST_RESULTS.md` for the real recorded counts.

## Project layout

```
index.html          page skeleton (all user text injected from js/i18n.js)
css/style.css       dark slate + teal theme, responsive, print stylesheet
js/logic.js         tokenizer, parser, evaluator, tables, canonical forms,
                    classification, equivalence, Bengali digits (no DOM)
js/i18n.js          EN/Bangla strings (pure ASCII via \uXXXX escapes)
js/app.js           UI wiring: render, presets, copy/download, persistence
tests/run-node-tests.js   Node unit tests (no dependencies)
tests/smoke.mjs           headless-Chrome UI smoke tests (raw CDP)
```

## Limitations

- Maximum 6 variables per expression (2^6 = 64 rows keeps tables readable).
- Equivalence compares over the union of both expressions' variables.
- `T` and `F` are reserved as constants and cannot be used as variables.
- The keyword `NOT` must be separated from variables by an operator or
  space (`NOTA` is rejected as an unknown word).
- TSV copy uses the clipboard API with a legacy fallback; some browsers
  block clipboard access from `file://` and will show a failure notice.

## Status

Complete and verified: 120/120 Node unit tests, 37/37 headless-Chrome smoke
tests, 0 console errors, 0 page errors, 0 network requests. Offline-first;
no data leaves the browser.
