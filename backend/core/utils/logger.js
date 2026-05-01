/**
 * Multi-colored Logger Utility
 * Provides colored console output for different log categories
 */

// ANSI Color Codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

/**
 * Get current timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Format log message with color
 */
function formatLog(level, color, bgColor, message, data) {
  const timestamp = colors.dim + getTimestamp() + colors.reset;
  const levelStr = bgColor + colors.bright + ` ${level} ` + colors.reset;
  const messageStr = color + message + colors.reset;
  
  let logStr = `${timestamp} ${levelStr} ${messageStr}`;
  
  if (data) {
    logStr += '\n' + colors.dim + JSON.stringify(data, null, 2) + colors.reset;
  }
  
  return logStr;
}

const logger = {
  /**
   * Error - Red background with white text
   */
  error: (message, data) => {
    console.error(formatLog('ERROR', colors.red, colors.bgRed, message, data));
  },

  /**
   * Warning - Yellow background with black text
   */
  warn: (message, data) => {
    console.warn(formatLog('WARN', colors.yellow, colors.bgYellow, message, data));
  },

  /**
   * Info - Blue background with white text
   */
  info: (message, data) => {
    console.info(formatLog('INFO', colors.cyan, colors.bgBlue, message, data));
  },

  /**
   * Debug - Magenta color
   */
  debug: (message, data) => {
    console.log(formatLog('DEBUG', colors.magenta, colors.bgMagenta, message, data));
  },

  /**
   * Success - Green background with black text
   */
  success: (message, data) => {
    console.log(formatLog('SUCCESS', colors.green, colors.bgGreen, message, data));
  },

  /**
   * Server - Cyan color for server events
   */
  server: (message, data) => {
    console.log(formatLog('SERVER', colors.cyan, colors.bgCyan, message, data));
  },

  /**
   * Database - Blue color for DB events
   */
  db: (message, data) => {
    console.log(formatLog('DB', colors.blue, colors.bgBlue, message, data));
  },

  /**
   * Socket - Magenta for socket events
   */
  socket: (message, data) => {
    console.log(formatLog('SOCKET', colors.magenta, colors.bgMagenta, message, data));
  }
};

module.exports = logger;
