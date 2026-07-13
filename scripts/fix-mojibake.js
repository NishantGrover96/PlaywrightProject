#!/usr/bin/env node
/**
 * fix-mojibake.js
 * Replaces garbled UTF-8 sequences (mojibake) with clean ASCII throughout the project.
 */

const fs = require('fs');
const path = require('path');

// Map of garbled sequences -> ASCII replacements
// Generated from: UTF-8 bytes misread as Windows-1252 and re-saved.
// Longer/more-specific patterns come first to avoid partial matches.
const REPLACEMENTS = [
  // -- Sun emoji + variation selector (theme toggle button)
  ['\u00e2\u02dc\u20ac\u00ef\u00b8\u008f', 'Theme'],  // Theme  (️)
  ['\u00e2\u02dc\u20ac', 'Theme'],                     // Theme    ()

  // -- 4-byte emoji (F0 9F ...) ---------------------------------------------
  ['\u00f0\u0178\u0161\u00a8', '[!]'],  // [!]  ([!] siren)
  ['\u00f0\u0178\u201d\u00a7', ''],     // "  ( wrench)
  ['\u00f0\u0178\u201c\u0160', ''],     // "Š  ( bar chart)
  ['\u00f0\u009f\u008e\u00ad', ''],     // Ž­  (QA theater)
  ['\u00f0\u0178', ''],                 //    (catch-all F0 9F)
  ['\u00f0\u009f', ''],                 //    (catch-all alt)

  // -- Dashes ----------------------------------------------------------------
  ['\u00e2\u20ac\u201c', '-'],   // €"  (- en dash U+2013)
  ['\u00e2\u20ac\u201d', '-'],   // €"  (- em dash U+2014)

  // -- Quotes ----------------------------------------------------------------
  ['\u00e2\u20ac\u02dc', "'"],   // '  (' left single quote U+2018)
  ['\u00e2\u20ac\u2019', "'"],   // €(TM)  (' right single quote U+2019)
  ['\u00e2\u20ac\u0153', '"'],   // "  (" left double quote U+201C)
  ['\u00e2\u20ac\u009d', '"'],   // €   (" right double quote U+201D)

  // -- Punctuation -----------------------------------------------------------
  ['\u00e2\u20ac\u00a2', '-'],   // -  (- bullet U+2022)
  ['\u00e2\u20ac\u00a6', '...'], // ...  (... ellipsis U+2026)
  ['\u00e2\u0084\u00a2', '(TM)'],// ¢  ((TM) trademark U+2122)
  ['\u00c2\u00b7', '.'],         // .   (. middle dot U+00B7)
  ['\u00c2\u00ae', '(R)'],       // (R)   (® registered U+00AE)
  ['\u00c2\u00a0', ' '],         // Â    (  non-breaking space U+00A0)

  // -- Box drawing / geometric shapes ----------------------------------------
  ['\u00e2\u201d\u20ac', '-'],   // "€  (- box drawing horizontal U+2500)
  ['\u00e2\u2013\u00b6', ''],    //   (> play triangle U+25B6)
  ['\u00e2\u2013\u00a0', ''],    // -   ( stop square U+25A0 + NBSP)
  ['\u00e2\u2013\u00b2', '^'],   // ^  (^ up triangle U+25B2)
  ['\u00e2\u2014\u2039', 'o'],   // o  (o white circle U+25CB)
  ['\u00e2\u2014\u008f', '*'],   // -   (* black circle U+25CF)

  // -- Arrows ----------------------------------------------------------------
  ['\u00e2\u2020\u201c', 'v'],   // "  (v down arrow U+2193)
  ['\u00e2\u2020\u2018', '->'],  // ->  (-> right arrow U+2192)
  ['\u00e2\u2020\u201d', '^'],   // ->  (^ up arrow U+2191)

  // -- Symbols ---------------------------------------------------------------
  ['\u00e2\u0153\u201c', ''],    // "  ( check mark U+2713)
  ['\u00e2\u0161\u00a0', '[!]'], // š   ([!] warning U+26A0 + NBSP)

  // -- Standalone Unicode that should be ASCII -------------------------------
  ['\u2014', '-'],   // - em dash
  ['\u2013', '-'],   // - en dash
  ['\u2019', "'"],   // ' right single quote
  ['\u2018', "'"],   // ' left single quote
  ['\u201c', '"'],   // " left double quote
  ['\u201d', '"'],   // " right double quote
  ['\u2022', '-'],   // - bullet
  ['\u2026', '...'], // ... ellipsis
  ['\u00a0', ' '],   // non-breaking space
];

// Standalone / proper Unicode -> ASCII (including partial-fix artifacts and intentional Unicode)
const UNICODE_TO_ASCII = [
  // Partial mojibake artifacts (broken sequences from earlier passes)
  ["\u00e2\u2020'",  '->'],  // -> (right arrow - partial fix artifact)
  ['\u0152\u2122',   ''],    //  (moon emoji partial fix)
  ['\u2039',         ''],    //  leftover
  ['\u201a',         ''],    //  leftover
  ['\u201e',         ''],    //  leftover
  ['\u0153',         ''],    //  leftover
  ['\u0152',         ''],    //  leftover
  ['\u00e2',         ''],    //  lone artifact
  ['\u2020',         ''],    //  lone artifact
  ['\u2030',         ''],    //  per-mille leftover
  ['\u00a4',         ''],    //  currency sign leftover
  ['\u00b8',         ''],    //  cedilla leftover
  ['\u00ef',         ''],    //  leftover
  ['\u00b9',         ''],    //  superscript leftover
  ['\u00b3',         ''],    //  superscript leftover
  ['\u00a7',         ''],    //  section sign leftover
  ['\u00a8',         ''],    //  diaeresis leftover
  ['\u009d',         ''],    // control char
  ['\u008f',         ''],    // control char
  ['\u008d',         ''],    // control char
  ['\u2122',         '(TM)'],// (TM) trademark
  ['\u00b7',         '.'],   // . middle dot

  // Proper Unicode symbols -> ASCII
  ['\u2500',   '-'],   // - box drawing horizontal
  ['\u2501',   '-'],   // - box drawing heavy horizontal
  ['\u25b6',   '>'],   // > right-pointing triangle
  ['\u25a0',   ''],    //  black square (used as icon prefix)
  ['\u25b2',   '^'],   // ^ up triangle
  ['\u25b4',   '^'],   // ^ small up triangle
  ['\u25be',   'v'],   // v small down triangle
  ['\u25cb',   'o'],   // o white circle
  ['\u25cf',   '*'],   // * black circle
  ['\u2193',   'v'],   // v down arrow
  ['\u2191',   '^'],   // ^ up arrow
  ['\u2192',   '->'],  // -> right arrow
  ['\u2190',   '<-'],  // <- left arrow
  ['\u21c4',   '<->'], // ↔ left-right arrow
  ['\u21c5',   '^v'],  // ↕ up-down arrow
  ['\u21bb',   '~>'],  // ~> refresh arrow
  ['\u2713',   ''],    //  check mark (used as icon)
  ['\u2715',   'x'],   // x cross
  ['\u2716',   'x'],   // x heavy cross
  ['\u26a0',   '[!]'], // [!] warning
  ['\u2699',   ''],    //  gear (icon)
  ['\u2726',   '*'],   // * star
  ['\u2387',   ''],    //  alt key
  ['\u2600',   ''],    //  sun
  ['\u232b',   ''],    //  delete
  ['\u2139',   '(i)'], // (i) info
  ['\u2298',   ''],    //  slashed circle
  ['\u26a1',   '!'],   // ! lightning
  ['\u23f1',   ''],    //  timer
  // Emoji (stored as proper UTF-16 surrogate pairs in JS strings)
  ['\uD83C\uDFAD', 'QA'],  // QA theater masks
  ['\uD83D\uDD0D', ''],    //  magnifier
  ['\uD83D\uDCC1', ''],    //  folder
  ['\uD83D\uDCCB', ''],    //  clipboard
  ['\uD83D\uDCD6', ''],    //  book
  ['\uD83D\uDCE6', ''],    //  package
  ['\uD83D\uDC46', ''],    // 
  ['\uD83D\uDC47', ''],    // 
  ['\uD83D\uDCCA', ''],    //  chart
  ['\uD83D\uDCDD', ''],    //  memo
  ['\uD83C\uDFC3', ''],    //  runner
  ['\uD83D\uDDFA', ''],    //  map
  ['\uD83D\uDD17', ''],    //  link
  ['\uD83D\uDC64', ''],    //  person
  ['\uD83D\uDD27', ''],    //  wrench
  ['\uD83E\uDDEA', ''],    //  test tube
  ['\uD83D\uDD14', ''],    //  bell
  ['\uD83C\uDF19', ''],    //  moon
  ['\uD83C\uDF00', ''],    //  cyclone
  ['\uD83D\uDEA8', '[!]'], // [!] siren
  ['\uD83D\uDD26', ''],    //  flashlight
  ['\uD83D\uDCA1', ''],    //  bulb
  ['\uD83D\uDCB0', ''],    //  money
];

const EXTENSIONS = new Set(['.js', '.ts', '.html', '.json', '.md', '.css', '.txt']);
const SKIP_DIRS = new Set(['dist', 'node_modules', '.git', 'test-results', 'baseline']);

function walk(dir, files = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), files);
    } else if (EXTENSIONS.has(path.extname(e.name).toLowerCase())) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

function fixFile(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return false; }
  const original = content;
  for (const [from, to] of REPLACEMENTS) {
    while (content.includes(from)) {
      content = content.split(from).join(to);
    }
  }
  for (const [from, to] of UNICODE_TO_ASCII) {
    while (content.includes(from)) {
      content = content.split(from).join(to);
    }
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const root = path.resolve(__dirname, '..');
const allFiles = walk(root);
let fixed = 0;
for (const f of allFiles) {
  if (fixFile(f)) {
    console.log('Fixed:', path.relative(root, f));
    fixed++;
  }
}
console.log(`\nDone. Fixed ${fixed} file(s).`);
