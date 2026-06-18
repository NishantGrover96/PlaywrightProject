const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = 'd:\\NareshCF\\Workspace4\\Git\\QAAutomationDealerPlatform';
const playwrightCli = path.join(ROOT_DIR, "node_modules", "@playwright", "test", "cli.js");

const args = ['test', 'tests/playwright/specs/coop/feature-submit-claim', '--grep', '@smoke', '--project=setup', '--project=chromium', '--reporter=list'];
console.log('Spawning:', process.execPath, [playwrightCli, ...args]);

const proc = spawn(process.execPath, [playwrightCli, ...args], {
  cwd: ROOT_DIR,
  shell: false,
  stdio: ["pipe", "pipe", "pipe"],
});

console.log('PID:', proc.pid);

let lineCount = 0;
proc.stdout.on("data", (chunk) => {
  console.log('STDOUT:', chunk.toString().substring(0, 200));
  lineCount++;
});

proc.stderr.on("data", (chunk) => {
  console.log('STDERR:', chunk.toString());
});

proc.on("close", (code) => {
  console.log('Exited with code:', code, 'Line count:', lineCount);
});

proc.on("error", (err) => {
  console.log('ERROR:', err.message);
});
