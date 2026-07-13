'use strict';

/**
 * Logger - writes structured entries to console and to a per-run log file.
 *
 * Consumers call:
 *   const log = require('./logger').createLogger(clientId, runId);
 *   log.info('message');
 *   log.warn('message');
 *   log.error('message', err);
 *   log.section('Section Title');
 *   log.stat({ filesScanned: 123, ... });
 *   await log.close();    // flush + write summary
 *
 * Log files are written to:
 *   logs/repository-analysis/{clientId}/{runId}.log
 */

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..', '..');
const LOG_DIR = path.join(ROOT, 'logs', 'repository-analysis');

// ANSI colour codes (no external deps)
const C = {
  reset:  '\x1b[0m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  bold:   '\x1b[1m',
  white:  '\x1b[37m',
};

function ts() {
  return new Date().toISOString();
}

function pad(str, len) {
  return String(str).padEnd(len);
}

/**
 * Creates a logger instance scoped to one analysis run.
 *
 * @param {string} clientId
 * @param {string} runId     - ISO timestamp string used in the file name
 * @returns {Logger}
 */
function createLogger(clientId, runId) {
  const clientLogDir = path.join(LOG_DIR, clientId);
  fs.mkdirSync(clientLogDir, { recursive: true });

  const logFile = path.join(clientLogDir, `${runId}.log`);
  const lines   = [];
  const stats   = {
    info:     0,
    warn:     0,
    error:    0,
    start:    Date.now(),
  };

  function append(level, message, extra) {
    const entry = `[${ts()}] [${pad(level, 5)}] ${message}`;
    lines.push(entry);
    if (extra) {
      const extraStr = extra instanceof Error
        ? `${extra.message}\n${extra.stack}`
        : JSON.stringify(extra, null, 2);
      lines.push(extraStr);
    }
  }

  function consoleOut(level, message, colour, extra) {
    const prefix = `${C.dim}[${new Date().toLocaleTimeString()}]${C.reset} ${colour}[${level}]${C.reset}`;
    process.stdout.write(`${prefix} ${message}\n`);
    if (extra instanceof Error) {
      process.stdout.write(`${C.red}  ${extra.message}${C.reset}\n`);
    }
  }

  const logger = {
    logFile,

    info(message) {
      stats.info++;
      append('INFO',  message);
      consoleOut('INFO ', message, C.cyan);
    },

    warn(message) {
      stats.warn++;
      append('WARN',  message);
      consoleOut('WARN ', message, C.yellow);
    },

    error(message, err) {
      stats.error++;
      append('ERROR', message, err);
      consoleOut('ERROR', message, C.red, err);
    },

    debug(message) {
      append('DEBUG', message);
      // debug not printed to console unless DEBUG env set
      if (process.env.ANALYSIS_DEBUG) {
        consoleOut('DEBUG', message, C.dim);
      }
    },

    section(title) {
      const line = `${'-'.repeat(60)}`;
      append('INFO',  line);
      append('INFO',  `  ${title}`);
      append('INFO',  line);
      process.stdout.write(`\n${C.bold}${C.white}${line}${C.reset}\n`);
      process.stdout.write(`${C.bold}${C.white}  ${title}${C.reset}\n`);
      process.stdout.write(`${C.bold}${C.white}${line}${C.reset}\n\n`);
    },

    stat(obj) {
      const formatted = Object.entries(obj)
        .map(([k, v]) => `  ${pad(k + ':', 30)} ${v}`)
        .join('\n');
      append('STAT', '\n' + formatted);
      process.stdout.write(`${C.green}${formatted}${C.reset}\n`);
    },

    skip(featureId, reason) {
      const msg = `SKIP  ${featureId}  - ${reason}`;
      append('SKIP', msg);
      consoleOut('SKIP ', msg, C.dim);
    },

    /**
     * Flush all buffered lines to disk and write a run summary footer.
     */
    async close() {
      const elapsed = ((Date.now() - stats.start) / 1000).toFixed(1);
      const summary = [
        '',
        '=' .repeat(60),
        '  RUN SUMMARY',
        '='.repeat(60),
        `  Elapsed  : ${elapsed}s`,
        `  Info     : ${stats.info}`,
        `  Warnings : ${stats.warn}`,
        `  Errors   : ${stats.error}`,
        '=' .repeat(60),
        '',
      ].join('\n');
      lines.push(summary);
      await fs.promises.writeFile(logFile, lines.join('\n'), 'utf8');
      process.stdout.write(`\n${C.dim}Log written to: ${logFile}${C.reset}\n\n`);
    },
  };

  return logger;
}

module.exports = { createLogger };
