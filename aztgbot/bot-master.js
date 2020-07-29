'use strict'

/**
 * @module bot-master
 */

const {isFunction} = require('./bot-utils')
const BotPoller = require('./bot-poller')
const BotLogger = require('./bot-logger')

/**
 * @description Create BotServant per identifier.
 * @example
 * new BotAPI(botAPI, BotServant, identify)
 */
class BotMaster {
  /**
   * @param {BotAPI} botAPI
   * @param {BotServant} BotServant Servant template.
   * @param {Function} identify Return identifier from Update.
   * @param {Object} [opts] Optional arguments.
   * @param {BotLogger} [opts.botLogger] Pass a custom BotLogger.
   * @param {Number} [opts.pollingInterval] Polling interval.
   * @param {Boolean} [opts.skippingUpdates] Whether to skip initial Updates.
   * @return {BotMaster}
   */
  constructor(botAPI, BotServant, identify, opts = {}) {
    this.botAPI = botAPI
    this.BotServant = BotServant
    if (!isFunction(identify)) {
      throw new TypeError("Expect a Function as `identify`")
    }
    this.identify = identify
    this.botLogger = opts['botLogger'] || new BotLogger()
    this.destroyTimeout = opts['destroyTimeout'] || 5 * 60 * 1000
    this.botPoller = new BotPoller(this.botAPI, this.onUpdates.bind(this), {
      'pollingInterval': opts["pollingInterval"],
      'skippingUpdates': opts["skippingUpdates"],
      'botLogger': this.botLogger
    })
    this.bots = {}
    this.botID = null
    this.botName = null
  }

  /**
   * @param {Object} [opts]
   * @param {Function} [opts.startCallback]
   * @param {Function} [opts.stopCallback]
   */
  async loop(opts = {}) {
    const startCallback = opts['startCallback'] || null
    const stopCallback = opts['stopCallback'] || null
    process.on('SIGINT', () => {
      process.exit(0)
    })
    process.on('exit', async () => {
      this.botPoller.stopPollUpdates()
      for (const [identifier, bot] of Object.entries(this.bots)) {
        if (isFunction(bot['instance'].onRemove)) {
          await bot['instance'].onRemove()
        }
        delete this.bots[identifier]
      }
      if (isFunction(stopCallback)) {
        await stopCallback()
      }
    })
    if (isFunction(startCallback)) {
      await startCallback()
    }
    const me = await this.botAPI.getMe()
    this.botID = me['id']
    this.botName = me['username']
    this.botLogger.debug(`${this.botName}#${this.botID}: I am listening…`)
    this.botPoller.startPollUpdates()
  }

  /**
   * @private
   * @param {Update[]} updates
   */
  async onUpdates(updates) {
    for (const update of updates) {
      const identifier = this.identify(update)
      if (this.bots[identifier] == null) {
        this.bots[identifier] = {
          'lastActiveTime': 0,
          'instance': new this.BotServant(
            this.botAPI, identifier, this.botID, this.botName
          )
        }
        if (isFunction(this.bots[identifier]['instance'].onCreate)) {
          await this.bots[identifier]['instance'].onCreate()
        }
      }
      this.bots[identifier]['instance'].processUpdate(update)
      this.bots[identifier]['lastActiveTime'] = Date.now()
    }
    if (this.destroyTimeout != null) {
      for (const [identifier, bot] of Object.entries(this.bots)) {
        if (Date.now() - bot['lastActiveTime'] > this.destroyTimeout) {
          if (isFunction(bot['instance'].onRemove)) {
            await bot['instance'].onRemove()
          }
          delete this.bots[identifier]
        }
      }
    }
  }
}

module.exports = BotMaster
