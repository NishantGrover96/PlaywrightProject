/**
 * DealerPlatform QA â€” On-Demand Test Dashboard
 *
 * Modes:
 *   Run Mode    â€” run tests against a single URL
 *   Compare Mode â€” run against Legacy, then Modern, diff the results
 *
 * Usage:  node dashboard/server.js  |  npm run dashboard
 * Open:   http://localhost:3333
 */

"use strict";

const http    = require("http");
const fs      = require("fs");
const path    = require("path");
const { spawn } = require("child_process");

// ── Bootstrap: load MASTER_KEY from .env.production if not already in env ───
// This means `npm run dashboard` works without manually setting MASTER_KEY.
if (!process.env.MASTER_KEY) {
  const envFile = path.join(__dirname, "..", ".env.production");
  if (fs.existsSync(envFile)) {
    for (const raw of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (key === "MASTER_KEY" && val) { process.env.MASTER_KEY = val; break; }
    }
  }
}

const { decryptPassword } = require("../utils/crypto-helper");

// ── Services (metadata-driven — Phase 3) ─────────────────────────────────────
const catalogService    = require("./services/catalog-service");
const clientService     = require("./services/client-service");
const featureService    = require("./services/feature-service");
const executionResolver = require("./services/execution-resolver");
const repositoryService = require("./services/repository-service");
const apiLog            = require("./services/api-logger");
const healthService     = require("./services/health-service");

// Start file watchers so caches stay warm
catalogService.watch();
clientService.watch();

// ── Backward-compat helpers (kept for resolveCredentials internal use) ────────
const USERS_DIR = path.join(__dirname, "..", "config", "users");

function loadUserConfig(clientId, role) {
  const usersFile = path.join(USERS_DIR, clientId, "users.json");
  if (fs.existsSync(usersFile)) {
    try {
      const all = JSON.parse(fs.readFileSync(usersFile, "utf8"));
      if (all[role]) return all[role];
      apiLog.warn("loadUserConfig", `key "${role}" not found in ${usersFile}. Keys: ${Object.keys(all).join(", ")}`);
      return null;
    } catch (err) {
      apiLog.warn("loadUserConfig", `failed to parse ${usersFile}: ${err.message}`);
    }
  }
  // Legacy fallback: individual {role}.json files
  const file = path.join(USERS_DIR, clientId, `${role}.json`);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

// â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PORT      = process.env.DASHBOARD_PORT || 3333;
const ROOT_DIR  = path.join(__dirname, "..");
const HTML_FILE = path.join(__dirname, "index.html");

// FEATURE_FOLDERS removed — spec paths now resolved dynamically by execution-resolver
// ROLE_PROJECTS removed   — project resolution delegated to client-service
const TIER_TAGS = { smoke: "@smoke", regression: "@regression", e2e: "@e2e" };

// loadEnvForTestEnv kept as internal fallback for resolveCredentials
function loadEnvForTestEnv(testEnv = "production") {
  function parseEnv(content) {
    const out = {};
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
    return out;
  }
  const envFile = path.join(ROOT_DIR, `.env.${testEnv}`);
  if (fs.existsSync(envFile)) return parseEnv(fs.readFileSync(envFile, "utf8"));
  const fallback = path.join(ROOT_DIR, ".env.production");
  if (fs.existsSync(fallback)) return parseEnv(fs.readFileSync(fallback, "utf8"));
  return {};
}

// â”€â”€ Shared state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let state = { running: false, proc: null, clients: [], history: [] };

// â”€â”€ SSE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function broadcast(type, payload) {
  const msg = `data: ${JSON.stringify({ type, ...payload })}\n\n`;
  state.clients = state.clients.filter(res => {
    try {
      res.write(msg);
      if (typeof res.flush === "function") res.flush();
      if (res.socket && typeof res.socket.flush === "function") res.socket.flush();
      return true;
    } catch { return false; }
  });
}

// â”€â”€ Line parser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseLine(raw) {
  const line = raw.replace(/\x1B\[[0-9;]*m/g, "").replace(/\r/g, "").trim();
  if (!line) return { kind: "line", text: raw };

  const passRx = /^\s*(?:ok|✓|✔)\s+(\d+)\s+\[.*?\]\s+[›>]\s+.*?[›>]\s+(.*?)(?:\s+\((\S+)\))?\s*$/u;
  const failRx = /^\s*(?:x+|✗|✘|×)\s+(\d+)\s+\[.*?\]\s+[›>]\s+.*?[›>]\s+(.*?)(?:\s+\((\S+)\))?\s*$/u;
  const skipRx = /^\s*[-]\s+(\d+)\s+\[.*?\]\s+[›>]\s+.*?[›>]\s+(.*?)(?:\s+\(\S+\))?\s*$/u;
  const summaryPassRx = /(\d+)\s+passed\s+\(([^)]+)\)/;
  const summaryFailRx = /(\d+)\s+failed/;
  const summarySkipRx = /(\d+)\s+skipped/;

  const pm = line.match(passRx);
  if (pm) return { kind: "result", status: "pass", idx: +pm[1], name: pm[2].trim(), duration: pm[3] };
  const fm = line.match(failRx);
  if (fm) return { kind: "result", status: "fail", idx: +fm[1], name: fm[2].trim(), duration: fm[3] };
  const sm = line.match(skipRx);
  if (sm) return { kind: "result", status: "skip", idx: +sm[1], name: sm[2].trim(), duration: "" };

  const spm  = line.match(summaryPassRx);
  const sfm  = line.match(summaryFailRx);
  const sskm = line.match(summarySkipRx);
  if (spm || sfm || sskm) {
    // Use undefined for unmatched fields so the client handler does NOT overwrite
    // counts that arrived on a previous summary line (Playwright emits them separately).
    return { kind: "summary",
      passed:   spm  ? +spm[1]  : undefined,
      failed:   sfm  ? +sfm[1]  : undefined,
      skipped:  sskm ? +sskm[1] : undefined,
      duration: spm  ? spm[2]   : "" };
  }
  return { kind: "line", text: raw };
}

// â”€â”€ Build args â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildArgs(config) {
  const plan = executionResolver.resolve(config);
  if (plan.warnings.length > 0) plan.warnings.forEach(w => apiLog.warn("buildArgs", w));
  if (plan.errors.length > 0)   plan.errors.forEach(e => apiLog.error("buildArgs", e));
  return plan.args;
}

// â”€â”€ Build env vars â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildEnv(config, urlOverride) {
  const merged = urlOverride ? { ...config, baseUrl: urlOverride } : config;
  const plan   = executionResolver.resolve(merged);
  return plan.env;
}

// ── Credential resolver ──────────────────────────────────────────────────────
// For non-custom roles: load credentials from config/users/{clientId}/{role}.json
// and decrypt the password. Also resolves the client-specific baseUrl for the
// selected environment so the correct portal is targeted regardless of .env file.
async function resolveCredentials(config) {
  const role     = config.role || "dealer";
  const clientId = config.clientId || "demoportal";
  const testEnv  = config.testEnv  || "production";
  const isCustom = role === "dealer-custom" || role === "admin-custom";

  // ── Resolve baseUrl from client config when no manual override is set ──────
  // Priority: explicit UI override > client JSON env URL > .env file URL
  if (!config.baseUrl) {
    const resolvedUrl = clientService.getBaseUrl(clientId, testEnv);
    if (resolvedUrl) config.baseUrl = resolvedUrl;
  }

  // Custom roles: credentials come from the request body — decrypt if encrypted
  if (isCustom) {
    if (config.password) {
      try { config.password = await decryptPassword(config.password); } catch { /* use as-is */ }
    }
    return config;
  }

  // Non-custom: load from user config JSON and decrypt
  const userCfg = loadUserConfig(clientId, role);
  if (userCfg) {
    config.username = userCfg.email;
    try {
      config.password = await decryptPassword(userCfg.password || "");
    } catch (err) {
      console.warn(`[dashboard] Could not decrypt ${clientId}/${role} password:`, err.message);
      config.password = userCfg.password || "";
    }
    console.log(`[dashboard] Credentials resolved: client=${clientId} role=${role} user=${config.username}`);
  } else {
    console.warn(`[dashboard] No user config found for client=${clientId} role=${role} — TEST_USER_EMAIL will be empty`);
  }

  return config;
}

// ── Single Run ─────────────────────────────────────────────────────────────
function runTests(config) {
  if (state.running) return { ok: false, error: "A test run is already in progress." };

  const args = buildArgs(config);
  const env  = buildEnv(config);
  const startedAt = new Date().toISOString();

  broadcast("start", { config, args: ["npx playwright"].concat(args).join(" "), startedAt });
  console.log(`[dashboard] Run: npx playwright ${args.join(" ")}`);

  // Use node.exe + playwright cli.js directly with shell:false
  // This bypasses CMD.EXE for reliable stdout/stderr capture on Windows
  const playwrightCli = path.join(ROOT_DIR, "node_modules", "@playwright", "test", "cli.js");

  const proc = spawn(process.execPath, [playwrightCli, ...args], {
    cwd: ROOT_DIR,
    env,
    shell: false,
    stdio: ["pipe", "pipe", "pipe"],
  });

  state.running = true;
  state.proc    = proc;

  // Emit PID so user can see it started
  broadcast("line", { text: `[dashboard] Process started (PID ${proc.pid})` });
  console.log(`[dashboard] PID: ${proc.pid}`);

  let buffer        = "";
  let summary       = { passed: 0, failed: 0, skipped: 0, duration: "" };
  let pendingDetail = null; // { idx, lines[] } â€” collects error output after a fail result

  // Emit a 'detail' event for the last failed test and reset the collector
  function flushDetail() {
    if (!pendingDetail) return;
    const content = pendingDetail.lines.join("\n").trim();
    if (content) broadcast("detail", { idx: pendingDetail.idx, content });
    pendingDetail = null;
  }

  function onData(chunk) {
    // Handle Windows \r\n and mixed line endings
    buffer += chunk.toString().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep last incomplete fragment

    for (const raw of lines) {
      // Always send raw line to console
      broadcast("line", { text: raw });

      const parsed = parseLine(raw);
      if (parsed.kind === "result") {
        flushDetail();
        broadcast("result", parsed);
        // Collect detail lines only for failed tests (Playwright prints error output after them)
        pendingDetail = parsed.status === "fail" ? { idx: parsed.idx, lines: [] } : null;
      } else if (parsed.kind === "summary") {
        flushDetail();
        pendingDetail = null;
        // Use undefined-safe merge so each of the 3 separate summary lines
        // ("1 failed" / "1 skipped" / "14 passed (4.2m)") accumulates correctly.
        if (parsed.passed  !== undefined) summary.passed  = parsed.passed;
        if (parsed.failed  !== undefined) summary.failed  = parsed.failed;
        if (parsed.skipped !== undefined) summary.skipped = parsed.skipped;
        if (parsed.duration) summary.duration = parsed.duration;
        broadcast("summary-update", summary);
      } else if (pendingDetail && pendingDetail.lines.length < 150) {
        // Cap at 150 lines; skip pure node_modules frames to reduce noise
        if (!/node_modules[\\/]/.test(raw) || pendingDetail.lines.length < 10) {
          pendingDetail.lines.push(raw);
        }
      }
    }
  }

  proc.stdout.on("data", onData);
  proc.stderr.on("data", onData);

  proc.on("close", (code) => {
    // Guard: stop handler may have already cleaned up
    if (state.proc !== proc) return;

    state.running = false;
    state.proc    = null;

    // flush any trailing detail and remaining buffer
    flushDetail();
    if (buffer.trim()) {
      const parsed = parseLine(buffer);
      if (parsed.kind === "result") broadcast("result", parsed);
      else broadcast("line", { text: buffer });
    }

    // Record history
    const entry = { startedAt, endedAt: new Date().toISOString(), exitCode: code, config, summary };
    state.history.unshift(entry);
    if (state.history.length > 20) state.history.pop();

    broadcast("end", { exitCode: code, summary, history: state.history });
  });

  proc.on("error", (err) => {
    if (state.proc !== proc) return;
    broadcast("error", { message: err.message });
    state.running = false;
    state.proc    = null;
  });

  return { ok: true, pid: proc.pid, args };
}

// â”€â”€ Comparison Run â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function computeDiff(legacyResults, modernResults) {
  const legacyMap = new Map(legacyResults.map(r => [r.name, r]));
  const modernMap = new Map(modernResults.map(r => [r.name, r]));
  const allNames  = new Set([...legacyMap.keys(), ...modernMap.keys()]);

  const rows = [];
  for (const name of allNames) {
    const l = legacyMap.get(name);
    const m = modernMap.get(name);
    let category;
    if      (!l)                                        category = "modern-only";
    else if (!m)                                        category = "legacy-only";
    else if (l.status === "pass" && m.status === "pass") category = "both-pass";
    else if (l.status === "fail" && m.status === "fail") category = "both-fail";
    else if (l.status === "pass" && m.status === "fail") category = "regression";  // ðŸš¨ critical
    else if (l.status === "fail" && m.status === "pass") category = "fixed";       // ðŸ”§ modern fixed
    else                                                category = "skip";
    rows.push({ name, legacy: l || null, modern: m || null, category });
  }

  const count = (cat) => rows.filter(r => r.category === cat).length;
  return {
    rows,
    summary: {
      total:      rows.length,
      bothPass:   count("both-pass"),
      bothFail:   count("both-fail"),
      regression: count("regression"),
      fixed:      count("fixed"),
      legacyOnly: count("legacy-only"),
      modernOnly: count("modern-only"),
    },
  };
}

/**
 * spawnPlaywright — shared helper used by runComparison for each phase.
 *
 * @param {string[]} args       Playwright CLI args (after 'test')
 * @param {object}   env        Environment variables
 * @param {Function} onResult   Called with each parsed result line
 * @param {Function} onDone     Called with (summary, exitCode) when process exits
 */
function spawnPlaywright(args, env, onResult, onDone) {
  const playwrightCli = path.join(ROOT_DIR, "node_modules", "@playwright", "test", "cli.js");

  const proc = spawn(process.execPath, [playwrightCli, ...args], {
    cwd: ROOT_DIR,
    env,
    shell: false,
    stdio: ["pipe", "pipe", "pipe"],
  });

  state.proc = proc;

  let buffer  = "";
  let summary = { passed: 0, failed: 0, skipped: 0, duration: "" };

  function onData(chunk) {
    buffer += chunk.toString().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const raw of lines) {
      broadcast("line", { text: raw });
      const parsed = parseLine(raw);
      if (parsed.kind === "result") {
        onResult(parsed);
        broadcast("result", parsed);
      } else if (parsed.kind === "summary") {
        if (parsed.passed  !== undefined) summary.passed  = parsed.passed;
        if (parsed.failed  !== undefined) summary.failed  = parsed.failed;
        if (parsed.skipped !== undefined) summary.skipped = parsed.skipped;
        if (parsed.duration) summary.duration = parsed.duration;
        broadcast("summary-update", summary);
      }
    }
  }

  proc.stdout.on("data", onData);
  proc.stderr.on("data", onData);

  proc.on("close", (code) => {
    if (buffer.trim()) broadcast("line", { text: buffer });
    onDone(summary, code);
  });

  proc.on("error", (err) => {
    broadcast("error", { message: err.message });
    onDone(summary, 1);
  });
}

function runComparison(config) {
  if (state.running) return { ok: false, error: "A run is already in progress." };
  if (!config.legacyUrl) return { ok: false, error: "legacyUrl is required." };
  if (!config.modernUrl) return { ok: false, error: "modernUrl is required." };

  const args      = buildArgs(config);
  const startedAt = new Date().toISOString();
  state.running   = true;

  broadcast("compare-start", {
    legacyUrl: config.legacyUrl,
    modernUrl: config.modernUrl,
    args: ["npx playwright"].concat(args).join(" "),
    startedAt,
  });

  const legacyResults = [];
  const modernResults = [];

  console.log(`[dashboard] Compare phase 1 â€” Legacy: ${config.legacyUrl}`);
  broadcast("compare-phase", { phase: "legacy", label: "Running against Legacyâ€¦" });

  // Phase 1 â€” Legacy
  spawnPlaywright(args, buildEnv(config, config.legacyUrl),
    (r) => { legacyResults.push(r); broadcast("compare-result", { phase: "legacy", ...r }); },
    (legacySummary, _code1) => {
      broadcast("compare-phase-done", { phase: "legacy", summary: legacySummary });
      console.log(`[dashboard] Compare phase 2 â€” Modern: ${config.modernUrl}`);
      broadcast("compare-phase", { phase: "modern", label: "Running against Modernâ€¦" });

      // Phase 2 â€” Modern
      spawnPlaywright(args, buildEnv(config, config.modernUrl),
        (r) => { modernResults.push(r); broadcast("compare-result", { phase: "modern", ...r }); },
        (modernSummary, _code2) => {
          state.running = false;
          const diff = computeDiff(legacyResults, modernResults);
          const entry = {
            startedAt,
            endedAt:       new Date().toISOString(),
            mode:          "compare",
            config,
            legacySummary,
            modernSummary,
            diff:          diff.summary,
          };
          state.history.unshift(entry);
          if (state.history.length > 20) state.history.pop();
          broadcast("compare-done", { diff, legacySummary, modernSummary });
          console.log(`[dashboard] Compare done â€” regressions: ${diff.summary.regression}`);
        }
      );
    }
  );

  return { ok: true };
}

// â”€â”€ Stop (works for both modes) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function stopRun() {
  if (!state.proc) return;
  const pid = state.proc.pid;
  const captured = state.proc;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/F", "/T", "/PID", String(pid)], { detached: true, stdio: "ignore" });
    } else {
      captured.kill("SIGTERM");
    }
  } catch { /* ignore */ }
  state.running = false;
  state.proc    = null;
  const entry = { startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
                  exitCode: -1, config: {}, summary: { passed: 0, failed: 0, skipped: 0 } };
  state.history.unshift(entry);
  if (state.history.length > 20) state.history.pop();
  broadcast("line",    { text: "â¹ Test run stopped by user." });
  broadcast("end",     { exitCode: -1, stopped: true, summary: { passed: 0, failed: 0, skipped: 0 } });
  broadcast("compare-done", { stopped: true, diff: { rows: [], summary: {} } });
  console.log(`[dashboard] Stopped PID ${pid}`);
}

// â”€â”€ HTTP server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
process.on("uncaughtException", (err) => {
  console.error("[dashboard] Uncaught exception (server kept alive):", err.message);
});

const server = http.createServer((req, res) => {
  const _parsed = new URL(req.url, "http://localhost");
  const url    = _parsed.pathname;
  const qs     = Object.fromEntries(_parsed.searchParams.entries());
  const method = req.method;

  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (method === "GET" && (url === "/" || url === "/index.html")) {
    try {
      const html = fs.readFileSync(HTML_FILE, "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      res.writeHead(500); res.end("Dashboard HTML not found — run: npm run dashboard");
    }
    return;
  }

  // ── /workspace — Phase 4 metadata-driven Automation Workspace ──────────
  if (method === "GET" && (url === "/workspace" || url === "/workspace.html")) {
    const wsFile = path.join(__dirname, "workspace.html");
    try {
      const html = fs.readFileSync(wsFile, "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      res.writeHead(404); res.end("workspace.html not found");
    }
    return;
  }

  if (method === "GET" && url === "/api/events") {
    if (req.socket) req.socket.setNoDelay(true);
    res.writeHead(200, { "Content-Type": "text/event-stream",
                         "Cache-Control": "no-cache, no-store, no-transform",
                         "Connection": "keep-alive", "X-Accel-Buffering": "no" });
    res.write(": connected\n\n");
    res.write(`data: ${JSON.stringify({ type: "state", running: state.running, history: state.history })}\n\n`);
    const hb = setInterval(() => { try { res.write(": heartbeat\n\n"); } catch { clearInterval(hb); } }, 15_000);
    state.clients.push(res);
    req.on("close", () => { clearInterval(hb); state.clients = state.clients.filter(c => c !== res); });
    return;
  }

  // ── /api/catalog — metadata-driven, supports ?clientId ?module ?status ?feature ──
  if (method === "GET" && url === "/api/catalog") {
    apiLog.request(method, url, qs);
    try {
      const entries = catalogService.getAll({
        clientId:  qs.clientId || qs.client,
        moduleId:  qs.module   || qs.moduleId,
        status:    qs.status,
        featureId: qs.feature  || qs.featureId,
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(entries));
    } catch (err) {
      apiLog.error("catalog", err.message, err);
      res.writeHead(500); res.end(JSON.stringify({ error: "Failed to load catalog" }));
    }
    return;
  }

  if (method === "GET" && url === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ running: state.running, history: state.history }));
    return;
  }

  // ── /api/health — Phase 5.5 pre-flight validation ─────────────────────────
  // ?full=1  → include async URL reachability probes (slow, ~8s per client)
  // ?client= → restrict to a single client
  // ?skipUrls=1 → skip URL probes even in full mode
  if (method === "GET" && url === "/api/health") {
    apiLog.request(method, url, qs);
    const full     = qs.full     === "1" || qs.full     === "true";
    const skipUrls = qs.skipUrls === "1" || qs.skipUrls === "true";
    const clientId = qs.client   || qs.clientId || undefined;

    const sendReport = (report) => {
      res.writeHead(report.ok ? 200 : 503, { "Content-Type": "application/json" });
      res.end(JSON.stringify(report));
    };
    const sendError = (err) => {
      apiLog.error("health", err.message, err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Health check failed", detail: err.message }));
    };

    if (full) {
      healthService.runHealthChecks({ clientId, skipUrls }).then(sendReport).catch(sendError);
    } else {
      try { sendReport(healthService.runQuickHealthChecks({ clientId })); } catch (err) { sendError(err); }
    }
    return;
  }

  // ── /api/clients ──────────────────────────────────────────────────────────
  if (method === "GET" && url === "/api/clients") {
    apiLog.request(method, url, qs);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(clientService.getClients()));
    return;
  }

  if (method === "GET" && url.startsWith("/api/clients/")) {
    const clientId = url.replace("/api/clients/", "").split("/")[0];
    apiLog.request(method, url, { clientId });
    const cfg = clientService.getClient(clientId);
    if (!cfg) { res.writeHead(404); res.end(JSON.stringify({ error: `Client "${clientId}" not found` })); return; }
    // Enrich with repo health
    const repoHealth = repositoryService.getHealth(clientId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ...cfg, repoHealth }));
    return;
  }

  // ── /api/modules?clientId=X ───────────────────────────────────────────────
  if (method === "GET" && url === "/api/modules") {
    apiLog.request(method, url, qs);
    const clientId = qs.clientId || qs.client || "demoportal";
    const modules  = clientService.getModules(clientId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ clientId, modules }));
    return;
  }

  // ── /api/migration-report — Phase 6 migration status ─────────────────────
  if (method === "GET" && url === "/api/migration-report") {
    apiLog.request(method, url, qs);
    const reportPath = path.join(__dirname, "migration-report.json");
    if (!fs.existsSync(reportPath)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        ok: false,
        error: "Migration report not yet generated",
        hint: "Run: npm run migrate  (or: npx ts-node tests/playwright/engine/migration-engine.ts)",
      }));
      return;
    }
    try {
      const report = fs.readFileSync(reportPath, "utf8");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(report);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Cannot read migration report", detail: err.message }));
    }
    return;
  }

  // ── /api/features?clientId=X&moduleId=Y&status=Z ─────────────────────────
  if (method === "GET" && url === "/api/features") {
    apiLog.request(method, url, qs);
    const features = featureService.getFeatures({
      clientId:  qs.clientId || qs.client,
      moduleId:  qs.moduleId || qs.module,
      status:    qs.status,
      role:      qs.role,
      featureId: qs.featureId || qs.feature,
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(features));
    return;
  }

  // ── /api/repository?clientId=X ───────────────────────────────────────────
  if (method === "GET" && url === "/api/repository") {
    apiLog.request(method, url, qs);
    const clientId = qs.clientId || qs.client;
    if (clientId) {
      const info   = repositoryService.getForClient(clientId);
      const health = repositoryService.getHealth(clientId);
      res.writeHead(info ? 200 : 404, { "Content-Type": "application/json" });
      res.end(JSON.stringify(info ? { ...info, health } : { error: `No repo registered for '${clientId}'` }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(repositoryService.getAll()));
    }
    return;
  }

  // ── /api/coverage?clientId=X&moduleId=Y ──────────────────────────────────
  if (method === "GET" && url === "/api/coverage") {
    apiLog.request(method, url, qs);
    const clientId = qs.clientId || qs.client;
    const moduleId = qs.moduleId || qs.module;
    const coverage = featureService.getCoverage(clientId, moduleId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ clientId: clientId || "all", moduleId: moduleId || "all", coverage }));
    return;
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (method === "POST" && url === "/api/run") {
    let body = "";
    req.on("data", d => body += d);
    req.on("end", async () => {
      let config = {};
      try { config = JSON.parse(body); } catch { /* defaults */ }
      apiLog.request("POST", "/api/run", { clientId: config.clientId, role: config.role, features: config.features });
      // Resolve & decrypt credentials from client config (non-custom roles)
      config = await resolveCredentials(config);
      // Log execution plan
      const plan = executionResolver.resolve(config);
      apiLog.execution(config.clientId || "demoportal", plan);
      if (plan.errors.length > 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, errors: plan.errors }));
        return;
      }
      const result = runTests(config);
      res.writeHead(result.ok ? 200 : 409, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
    return;
  }

  if (method === "POST" && url === "/api/compare") {
    let body = "";
    req.on("data", d => body += d);
    req.on("end", () => {
      let config = {};
      try { config = JSON.parse(body); } catch { /* defaults */ }
      const result = runComparison(config);
      res.writeHead(result.ok ? 200 : 409, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
    return;
  }

  if (method === "POST" && url === "/api/stop") {
    stopRun();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── Serve test-results screenshots ────────────────────────────────────────
  if (method === "GET" && url.startsWith("/test-results/")) {
    const relativePath = url.replace(/^\/test-results\//, "").split("?")[0];
    const filePath = path.join(ROOT_DIR, "test-results", relativePath);
    const resolvedPath = path.resolve(filePath);
    const trRoot = path.resolve(path.join(ROOT_DIR, "test-results"));
    if (!resolvedPath.startsWith(trRoot)) { res.writeHead(403); res.end("Forbidden"); return; }
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === ".png" ? "image/png"
               : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
               : ext === ".gif" ? "image/gif"
               : ext === ".webp" ? "image/webp"
               : "application/octet-stream";
    let content;
    try { content = fs.readFileSync(filePath); } catch { /* not found */ }
    if (content) { res.writeHead(200, { "Content-Type": mime }); res.end(content); }
    else         { res.writeHead(404); res.end(`Screenshot not found: ${relativePath}`); }
    return;
  }

  if (method === "GET" && url.startsWith("/docs/")) {
    // Serve catalog and documentation files.
    // catalogFile paths in the manifest are fully qualified relative to docs/:
    //   functional-catalogs/{clientId}/{module}/feature-{feature}/functional-units.html
    // URL: /docs/functional-catalogs/{clientId}/{module}/feature-{feature}/...
    const relativePath = url.replace(/^\/docs\//, "").split("?")[0];
    const docsRoot     = path.resolve(path.join(ROOT_DIR, "docs"));
    const filePath     = path.resolve(path.join(ROOT_DIR, "docs", relativePath));

    // Security: prevent directory traversal
    if (!filePath.startsWith(docsRoot)) {
      res.writeHead(403); res.end("Forbidden");
      return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = ext === ".html" ? "text/html; charset=utf-8"
               : ext === ".md"   ? "text/plain; charset=utf-8"
               : ext === ".css"  ? "text/css; charset=utf-8"
               : ext === ".js"   ? "application/javascript; charset=utf-8"
               : ext === ".png"  ? "image/png"
               : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
               : "application/octet-stream";

    let content;
    try { content = fs.readFileSync(filePath); } catch { /* not found */ }
    if (content) { res.writeHead(200, { "Content-Type": mime }); res.end(content); }
    else         { res.writeHead(404); res.end(`Not found: ${relativePath}`); }
    return;
  }

  res.writeHead(404); res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`\n  ðŸŽ­ DealerPlatform QA Dashboard`);
  console.log(`  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`);
  console.log(`  Open:  http://localhost:${PORT}`);
  console.log(`  Root:  ${ROOT_DIR}`);
  console.log(`\n  Press Ctrl+C to stop.\n`);
});
