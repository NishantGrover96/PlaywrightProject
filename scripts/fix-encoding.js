const fs = require("fs");
const path = "d:/Leads/PlayWright/dashboard/index.html";
let c = fs.readFileSync(path, "utf8");
const fixes = [
  ["\u00E2\u20AC\u201D", "\u2014"],
  ["\u00E2\u20AC\u00A6", "\u2026"],
  ["\u00E2\u20AC\u00A2", "\u2022"],
  ["\u00E2\u20AC\u0153", "\u201C"],
  ["\u00E2\u20AC\u2122", "\u2019"],
  ["\u00E2\u20AC\u02DC", "\u2018"],
  ["\u00E2\u009A\u00A0", "\u26A0"],
  ["\u00F0\u0178\u017D\u00AD", "\uD83C\uDFAD"],
  ["\u00E2\u201D\u20AC", "\u2500"],
  ["\u00E2\u201D\u201A", "\u2502"]
];
for (const [from, to] of fixes) {
  c = c.split(from).join(to);
}
fs.writeFileSync(path, c, "utf8");
console.log("Done");