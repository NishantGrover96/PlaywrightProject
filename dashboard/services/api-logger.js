'use strict';

/**
 * API Logger - lightweight structured logger for dashboard API requests,
 * execution decisions, and metadata resolution.
 *
 * Writes to:
 *   dashboard/logs/api-{YYYY-MM-DD}.log
 *   console (condensed)
 *
 * Usage:
 *   const apiLog = require('./api-logger');
 *   apiLog.request(method, url, query);
 *   apiLog.execution(clientId, plan);
 *   apiLog.resolution(clientId, featureId, result);
 *   apiLog.warn(context, message);
 *   apiLog.error(context, message, err?);
 */

const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');

// Ensure log dir exists
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch { /* ignore */ }

function _todayFile() {
  const d = new Date().toISOString().slice(0, 10);
  return path.join(LOG_DIR, `api-${d}.log`);
}

function _ts() {
  return new Date().toISOString();
}

function _write(level, context, message, extra) {
  const line = `[${_ts()}] [${level.padEnd(5)}] [${context}] ${message}` +
    (extra ? ` | ${JSON.stringify(extra)}` : '');

  // Append to daily log file (non-blocking best-effort)
  try {
    fs.appendFileSync(_todayFile(), line + '\n', 'utf8');
  } catch { /* disk full / permission - graceful */ }

  // Console output
  if (level === 'ERROR') console.error(`[api] ${line}`);
  else if (level === 'WARN') console.warn(`[api] ${line}`);
  else if (process.env.DASHBOARD_DEBUG) console.log(`[api] ${line}`);
}

const apiLog = {

  /**
   * Log an incoming API request.
   */
  request(method, url, query) {
    _write('INFO', 'request', `${method} ${url}`, query && Object.keys(query).length ? query : undefined);
  },

  /**
   * Log an execution plan decision.
   */
  execution(clientId, plan) {
    _write('INFO', 'execution', `client=${clientId}`, {
      specPaths: plan.specPaths,
      projects:  plan.projects,
      warnings:  plan.warnings,
      errors:    plan.errors,
    });
  },

  /**
   * Log a metadata resolution result.
   */
  resolution(clientId, featureId, result) {
    _write('INFO', 'resolution', `client=${clientId} feature=${featureId}`, { result });
  },

  /**
   * Log a warning.
   */
  warn(context, message) {
    _write('WARN', context, message);
  },

  /**
   * Log an error.
   */
  error(context, message, err) {
    _write('ERROR', context, message, err ? { message: err.message } : undefined);
  },

  /**
   * Log a repository event.
   */
  repository(clientId, event, detail) {
    _write('INFO', 'repository', `client=${clientId} event=${event}`, detail);
  },
};

module.exports = apiLog;
