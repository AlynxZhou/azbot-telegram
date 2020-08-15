"use strict";

/**
 * @module bot-servant
 */

const BotMaster = require("./bot-master");
const BotServant = require("./bot-servant");
const BotAPI = require("./bot-api");
const BotPoller = require("./bot-poller");
const BotLogger = require("./bot-logger");
const botUtils = require("./bot-utils");

module.exports = {
  BotMaster,
  BotServant,
  BotAPI,
  BotPoller,
  BotLogger,
  botUtils
};
