/**
 * PM2 Ecosystem Config — Dealer Platform QA Dashboard
 *
 * Usage:
 *   pm2 start ecosystem.config.js          # start
 *   pm2 restart dealer-qa-dashboard        # restart after code update
 *   pm2 stop dealer-qa-dashboard           # stop
 *   pm2 save                               # persist across reboots
 *   pm2 startup                            # register PM2 as Windows service
 *
 * All sensitive values come from environment variables set by the
 * ADO pipeline — never hardcoded here.
 */

module.exports = {
  apps: [
    {
      name:    "dealer-qa-dashboard",
      script:  "./dashboard/server.js",
      cwd:     __dirname + "/..",   // repo root (QAAutomationDealerPlatform/)

      // Restart policy
      watch:               false,
      max_memory_restart:  "512M",
      restart_delay:       3000,
      max_restarts:        5,

      // Logging
      log_date_format:  "YYYY-MM-DD HH:mm:ss",
      error_file:       "./dashboard/logs/dashboard-error.log",
      out_file:         "./dashboard/logs/dashboard-out.log",
      merge_logs:       true,

      // Environment — overridden by ADO pipeline at deploy time
      env: {
        NODE_ENV:          "production",
        DASHBOARD_PORT:    process.env.DASHBOARD_PORT    || "3333",
        BASE_URL:          process.env.BASE_URL          || "",
        APP_USERNAME:      process.env.APP_USERNAME      || "",
        APP_PASSWORD:      process.env.APP_PASSWORD      || "",
      },
    },
  ],
};
