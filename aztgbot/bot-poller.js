"use strict";

/**
 * @module bot-poller
 */

const {isFunction} = require("./bot-utils");
const BotLogger = require("./bot-logger");

/**
 * @description A Poller that automatically run `getUpdates()` and call `onUpdates()`.
 * @example
 * new BotPoller(botAPI, onUpdates, opts)
 */
class BotPoller {
  /**
   * @param {BotAPI} botAPI
   * @param {Function} onUpdates A callback Function to process Updates.
   * @param {Object} [opts] Optional arguments.
   * @param {Number} [opts.pollingInterval=1500] Polling interval.
   * @param {Boolean} [opts.skippingUpdates=true] Whether to skip initial Updates.
   * @param {BotLogger} [opts.botLogger] Pass a custom BotLogger.
   * @return {BotPoller}
   */
  constructor(botAPI, onUpdates, opts = {}) {
    this.botAPI = botAPI;
    if (!isFunction(onUpdates)) {
      throw new TypeError("Expect a Function as `onUpdates`");
    }
    this.onUpdates = onUpdates;
    this.pollingInterval = opts["pollingInterval"] || 1500;
    this.coolDownInterval = 6000;
    this.skippingUpdates = opts["skippingUpdates"];
    this.botLogger = opts["botLogger"] || new BotLogger(false);
    this.isPolling = false;
    this.pollingID = null;
    this.pollingParam = {
      "offset": 0,
      "timeout": 1
    };
  }

  /**
   * @private
   * @description Skip unread updates, useful if you don't want to reply a lot of messages when bot start.
   * @return {Promise<Update[]>}
   */
  async skipUpdates() {
    this.pollingParam["offset"] = -1;
    try {
      const updates = await this.botAPI.getUpdates(this.pollingParam);
      // Should be only one or zero update here because we set offset to `-1`.
      if (updates.length > 0) {
        this.pollingParam["offset"] = updates[0]["update_id"] + 1;
      }
    } catch (error) {
      this.botLogger.error(error);
    }
  }

  /**
   * @return {Boolean} Polling or not.
   */
  async startPollUpdates() {
    if (!this.isPolling) {
      // By default we skip Updates.
      if (this.skippingUpdates == null || this.skippingUpdates === true) {
        await this.skipUpdates();
      }
      this.isPolling = true;
      this.pollUpdates();
    }
    return this.isPolling;
  }

  /**
   * @private
   * @return {Number} Polling ID.
   */
  async pollUpdates() {
    this.botLogger.debug(
      `poller: polling updates since offset ${this.pollingParam["offset"]}…`
    );
    let coolDown = false;
    try {
      const updates = await this.botAPI.getUpdates(this.pollingParam);
      this.onUpdates(updates);
      if (updates.length > 0) {
        const last = updates[updates.length - 1];
        this.pollingParam["offset"] = last["update_id"] + 1;
      }
    } catch (error) {
      this.botLogger.error(error);
      coolDown = true;
    }
    // Stop updating pollingID when stopPollUpdates() is called.
    if (this.isPolling) {
      this.pollingID = setTimeout(
        this.pollUpdates.bind(this),
        coolDown ? this.skippingUpdates : this.pollingInterval
      );
    }
    return this.pollingID;
  }

  /**
   * @return {Boolean} Polling or not.
   */
  stopPollUpdates() {
    if (this.isPolling) {
      this.isPolling = false;
      clearTimeout(this.pollingID);
    }
    return this.isPolling;
  }
}

module.exports = BotPoller;
