"use strict";

/**
 * @module bot-servant
 */

/**
 * @description Bot template
 */
class BotServant {
  /**
   * @param {BotAPI} botAPI
   * @param {String} identifier
   * @param {Number} botID
   * @param {String} botName
   */
  constructor(botAPI, identifier, botID, botName) {
    this.botAPI = botAPI;
    this.identifier = identifier;
    this.botID = botID;
    this.botName = botName;
  }

  /**
   * @description This will be called on BotServant created.
   */
  onCreate() {

  }

  /**
   * @description This will be called when a Update comes.
   * @param {Update} update
   */
  processUpdate(update) {

  }

  /**
   * @description This will be called on BotServant removed.
   */
  onRemove() {

  }
}

module.exports = BotServant;
