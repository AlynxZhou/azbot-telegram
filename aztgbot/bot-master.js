/**
 * @module bot-master
 */

import BotPoller from "./bot-poller.js";
import BotLogger from "./bot-logger.js";
import {isFunction} from "./bot-utils.js";

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
    this.botAPI = botAPI;
    this.BotServant = BotServant;
    if (!isFunction(identify)) {
      throw new TypeError("Expect a Function as `identify`");
    }
    this.identify = identify;
    this.botLogger = opts["botLogger"] || new BotLogger();
    this.destroyTimeout = opts["destroyTimeout"] || 5 * 60 * 1000;
    this.botPoller = new BotPoller(this.botAPI, this.onUpdates.bind(this), {
      "pollingInterval": opts["pollingInterval"],
      "skippingUpdates": opts["skippingUpdates"],
      "botLogger": this.botLogger
    });
    this.bots = {};
    this.botID = null;
    this.botName = null;
  }

  /**
   * @param {Object} [opts]
   * @param {Function} [opts.startCallback]
   * @param {Function} [opts.stopCallback]
   */
  async loop(opts = {}) {
    const startCallback = opts["startCallback"] || null;
    const stopCallback = opts["stopCallback"] || null;
    // If we close all scheduled works, Node.js will exit automatically.
    const cleanup = async () => {
      this.botPoller.stopPollUpdates();
      for (const [identifier, bot] of Object.entries(this.bots)) {
        if (isFunction(bot["instance"].onRemove)) {
          await bot["instance"].onRemove();
        }
        delete this.bots[identifier];
      }
      this.botLogger.debug(`${this.botName}#${this.botID}: I am exiting…`);
      if (isFunction(stopCallback)) {
        await stopCallback();
      }
      // Don't call `process.exit()` here, it will break async operations.
      // Let users call it instead.
      // process.exit(0);
    };
    // So we just call cleanup on SIGINT and SIGTERM to make a graceful exit.
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    if (isFunction(startCallback)) {
      await startCallback();
    }
    try {
      const me = await this.botAPI.getMe();
      this.botID = me["id"];
      this.botName = me["username"];
      this.botLogger.debug(`${this.botName}#${this.botID}: I am listening…`);
    } catch (error) {
      this.botLogger.warn("Failed to get bot info, exit.");
      this.botLogger.error(error);
      if (isFunction(stopCallback)) {
        await stopCallback();
      }
      return;
    }
    this.botPoller.startPollUpdates();
  }

  /**
   * @private
   * @param {Update[]} updates
   */
  async onUpdates(updates) {
    for (const update of updates) {
      const identifier = this.identify(update);
      if (this.bots[identifier] == null) {
        this.bots[identifier] = {
          "lastActiveTime": 0,
          "instance": new this.BotServant(
            this.botAPI, identifier, this.botID, this.botName
          )
        };
        this.botLogger.debug(
          `${this.botName}#${this.botID}: ` +
          `Creating instance for identifier ${identifier}…`
        );
        if (isFunction(this.bots[identifier]["instance"].onCreate)) {
          await this.bots[identifier]["instance"].onCreate();
        }
      }
      this.bots[identifier]["instance"].processUpdate(update);
      this.bots[identifier]["lastActiveTime"] = Date.now();
    }
    if (this.destroyTimeout != null) {
      for (const [identifier, bot] of Object.entries(this.bots)) {
        if (Date.now() - bot["lastActiveTime"] > this.destroyTimeout) {
          if (isFunction(bot["instance"].onRemove)) {
            await bot["instance"].onRemove();
          }
          this.botLogger.debug(
            `${this.botName}#${this.botID}: " +
            "Removing instance for identifier ${identifier}…`
          );
          delete this.bots[identifier];
        }
      }
    }
  }
}

export default BotMaster;
