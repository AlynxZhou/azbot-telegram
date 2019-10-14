/**
 * @module BotLogger
 */
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
    return super.info('\x1b[34mINFO:\x1b[0m', ...strs)
  }

  /**
   * @param {...*} strs
   */
  debug(...strs) {
    if (this.isDebug) {
      return super.debug('\x1b[32mDEBUG:\x1b[0m', ...strs)
    }
  }

  /**
   * @param {...*} strs
   */
  warn(...strs) {
    return super.warn('\x1b[33mWARN:\x1b[0m', ...strs)
  }

  /**
   * @param {...*} strs
   */
  error(...strs) {
    return super.warn('\x1b[31mERROR:\x1b[0m', ...strs)
  }
}

module.exports = BotLogger
