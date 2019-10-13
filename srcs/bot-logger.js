/**
 * @module BotLogger
 */
const colors = require('colors/safe')

/**
 * @description A Logger with colored output.
 * @extends console.Console
 * @example
 * new BotLogger(isDebug)
 */
class BotLogger extends console.Console {
  /**
   * @param {Boolean} isDebug
   * @param {Object} [opts] Optional arguments for `console.Console`.
   * @return {BotLogger}
   */
  constructor(isDebug, opts = {
    'stdout': process.stdout,
    'stderr': process.stderr
  }) {
    super(opts)
    this.isDebug = isDebug
  }

  /**
   * @param {*} o
   * @return {Boolean}
   */
  isBotLogger(o) {
    return o instanceof BotLogger
  }

  /**
   * @param {...*} strs
   */
  log(...strs) {
    return super.log('LOG:', ...strs)
  }

  /**
   * @param {...*} strs
   */
  info(...strs) {
    return super.info(colors.blue('INFO:'), ...strs)
  }

  /**
   * @param {...*} strs
   */
  debug(...strs) {
    if (this.isDebug) {
      return super.debug(colors.green('DEBUG:'), ...strs)
    }
  }

  /**
   * @param {...*} strs
   */
  warn(...strs) {
    return super.warn(colors.yellow('WARN:'), ...strs)
  }

  /**
   * @param {...*} strs
   */
  error(...strs) {
    return super.warn(colors.red('ERROR:'), ...strs)
  }
}

module.exports = BotLogger
