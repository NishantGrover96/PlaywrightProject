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

// â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PORT           = process.env.DASHBOARD_PORT || 3333;
const ROOT_DIR       = path.join(__dirname, "..");
const HTML_FILE      = path.join(__dirname, "index.html");
const MANIFEST_FILE  = path.join(__dirname, "catalog-manifest.json");

const FEATURE_FOLDERS = {
  "coop-submit-claim":           "tests/playwright/specs/coop/feature-submit-claim",
  "coop-submit-preapproval":     "tests/playwright/specs/coop/feature-submit-preapproval",
  "coop-admin-reports":          "tests/playwright/specs/coop/feature-admin-reports",
  "coop-dealer-dashboard":       "tests/playwright/specs/coop/feature-dealer-dashboard",
  "coop-api-submit-claim":       "tests/api/coop/feature-submit-claim",
  "coop-api-submit-preapproval": "tests/api/coop/feature-submit-preapproval",
  "popshop-new-order":           "tests/playwright/specs/popshop/feature-new-order",
  "engage-ads-view-package":     "tests/playwright/specs/engage-ads/feature-view-package",
};

const TIER_TAGS = { smoke: "@smoke", regression: "@regression", e2e: "@e2e" };

const ROLE_PROJECTS = {
  "dealer":        ["setup", "chromium"],
  "dealer-custom": ["setup", "chromium"],
  "admin":         ["setup-admin", "chromium-admin"],
  "admin-custom":  ["setup-admin", "chromium-admin"],
};

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
  if (fs.existsSync(envFile)) {
    return parseEnv(fs.readFileSync(envFile, "utf8"));
  }
  const fallbackFile = path.join(ROOT_DIR, ".env.production");
  if (fs.existsSync(fallbackFile)) {
    return parseEnv(fs.readFileSync(fallbackFile, "utf8"));
  }
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

  const passRx = /^\s*ok\s+(\d+)\s+\[.*?\]\s+[â€º>]\s+.*[â€º>]\s+(.*?)\s+\((\S+)\)\s*$/;
  const failRx = /^\s*x\s+(\d+)\s+\[.*?\]\s+[â€º>]\s+.*[â€º>]\s+(.*?)\s+\((\S+)\)\s*$/;
  const skipRx = /^\s*[-]\s+(\d+)\s+\[.*?\]\s+[â€º>]\s+.*[â€º>]\s+(.*?)(\s+\(\S+\))?\s*$/;
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
    return { kind: "summary",
      passed:   spm  ? +spm[1]  : 0,
      failed:   sfm  ? +sfm[1]  : 0,
      skipped:  sskm ? +sskm[1] : 0,
      duration: spm  ? spm[2]   : "" };
  }
  return { kind: "line", text: raw };
}

// â”€â”€ Build args â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildArgs(config) {
  const args = ["test"];
  if (config.features && config.features.length > 0 && !config.features.includes("all")) {
    for (const f of config.features) {
      if (FEATURE_FOLDERS[f]) args.push(FEATURE_FOLDERS[f]);
    }
  }
  if (config.tiers && config.tiers.length > 0 && !config.tiers.includes("all")) {
    args.push("--grep", config.tiers.map(t => TIER_TAGS[t] || t).join("|"));
  }
  const isApiOnly = config.features && config.features.every(f => f.includes("api"));
  if (isApiOnly) {
    args.push("--project=api");
  } else {
    const projects = ROLE_PROJECTS[config.role] || ROLE_PROJECTS["dealer"];
    for (const p of projects) args.push(`--project=${p}`);
  }
  args.push("--reporter=list");
  return args;
}

// â”€â”€ Build env vars â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildEnv(config, urlOverride) {
  const isAdmin  = config.role === "admin" || config.role === "admin-custom";
  const isCustom = config.role === "dealer-custom" || config.role === "admin-custom";
  const fileEnv  = loadEnvForTestEnv(config.testEnv || "production");
  const env = {
    ...process.env,
    ...fileEnv,
    TEST_ENV:           config.testEnv  || "production",
    TEST_USER_EMAIL:    isCustom && config.username ? config.username : fileEnv.TEST_USER_EMAIL    || process.env.TEST_USER_EMAIL    || "",
    TEST_USER_PASSWORD: isCustom && config.password ? config.password : fileEnv.TEST_USER_PASSWORD || process.env.TEST_USER_PASSWORD || "",
    ...(isAdmin && { ADMIN_EMAIL:    isCustom && config.username ? config.username : fileEnv.ADMIN_EMAIL    || process.env.ADMIN_EMAIL    || "" }),
    ...(isAdmin && { ADMIN_PASSWORD: isCustom && config.password ? config.password : fileEnv.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "" }),
  };
  const url = urlOverride || config.baseUrl;
  if (url) env.BASE_URL = url;
  return env;
}

// â”€â”€ Single Run â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        summary = { passed: parsed.passed || 0, failed: parsed.failed || 0,
                    skipped: parsed.skipped || 0, duration: parsed.duration || summary.duration };
        broadcast("summary-update", summary);
      } else if (pendingDetail && pendingDetail.lines.length < 80) {
        // Cap at 80 lines to avoid huge payloads for very verbose failures
        pendingDetail.lines.push(raw);
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

    broadcast("end", { exitCode: code, summary });
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
  const url    = req.url.split("?")[0];
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
      res.writeHead(500); res.end("Dashboard HTML not found â€” run: npm run dashboard");
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

  if (method === "GET" && url === "/api/catalog") {
    let content = "{}";
    try { content = fs.readFileSync(MANIFEST_FILE, "utf8"); } catch { /* no manifest */ }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(content);
    return;
  }

  if (method === "GET" && url === "/api/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ running: state.running, history: state.history }));
    return;
  }

  if (method === "POST" && url === "/api/run") {
    let body = "";
    req.on("data", d => body += d);
    req.on("end", () => {
      let config = {};
      try { config = JSON.parse(body); } catch { /* defaults */ }
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

  if (method === "GET" && url.startsWith("/docs/")) {
    // Serve catalog and documentation files from nested paths
    const relativePath = url.replace(/^\/docs\//, "").split("?")[0];
    const filePath = path.join(ROOT_DIR, "docs", relativePath);
    
    // Security: prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const docsRoot = path.resolve(path.join(ROOT_DIR, "docs"));
    if (!resolvedPath.startsWith(docsRoot)) {
      res.writeHead(403); res.end("Forbidden");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
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
