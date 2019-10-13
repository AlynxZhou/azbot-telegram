/**
 * @module botUtils
 */
const fs = require('fs')
const path = require('path')

const FormData = require('form-data')

/**
 * @param {Object} update Telegram update.
 * @return {String} A string which can be used as key.
 */
const perFromID = (update) => {
  if (update != null &&
      update['message'] != null &&
      update['message']['from'] != null &&
      update['message']['from']['id'] != null) {
    return `${update['message']['from']['id']}`
  }
  return `0`
}

/**
 * @param {Object} update Telegram update.
 * @return {String} A string which can be used as key.
 */
const perChatID = (update) => {
  if (update != null &&
      update['message'] != null &&
      update['message']['chat'] != null &&
      update['message']['chat']['id'] != null) {
    return `${update['message']['chat']['id']}`
  }
  return `0`
}

/**
 * @param {*} o
 * @return {Boolean}
 */
const isString = (o) => {
  return typeof(o) === "string"
}

/**
 * @param {*} o
 * @return {Boolean}
 */
const isArray = (o) => {
  return Array.isArray(o)
}

/**
 * @param {*} o
 * @return {Boolean}
 */
const isFunction = (o) => {
  return o instanceof Function
}

/**
 * @param {*} o
 * @return {Boolean} Return `false` when `o == null`.
 */
const isObject = (o) => {
  return typeof(o) === "object" && o != null
}

/**
 * @param {*} o
 * @return {Boolean}
 */
const isBuffer = (o) => {
  return Buffer.isBuffer(o)
}

/**
 * @param {*} o
 * @return {Boolean}
 */
const isFormData = (o) => {
  return o instanceof FormData
}

/**
 * @description Replace camelCase to snake_case, e.g. `_ChatID` to `_chat_id`.
 * @param {String} camelCase
 * @return {String} snake_case of input.
 */
const toSnakeCase = (camelCase) => {
  // ['chatId', 'chatID', 'chat_ID', 'chat_id', 'chat__ID', 'chat_I_D', '_ChatID', 'chatID_', '_ID', 'ChatID'].map(toSnakeCase)
  return camelCase
    // CamelCase in line head is replaced by lower case.
    // This must be the first to escape from the 3rd regexp.
    // `Chat_id` to `chat_id`
    .replace(/^([A-Z]+)/g, (match, p1) => {
      return p1.toLowerCase()
    })
    // CamelCase after a underscore is replaced by lower case.
    // `chat_ID` to `chat_id`
    .replace(/(_[A-Z]+)/g, (match, p1) => {
      return p1.toLowerCase()
    })
    // CamelCase without a underscore and not in line head
    // is replaced by lower case with underscore.
    // `chatID` to `chat_id`
    .replace(/([A-Z]+)/g, (match, p1) => {
      return `_${p1.toLowerCase()}`
    })
}

/**
 * @description Assign Objects into one Object which keys are all transfered into snake_case.
 * @param {...Object}
 * @return {Object} Assigned snake_case Object.
 */
const toSnakeCaseObject = (...objects) => {
  return Object.assign(...objects.map((object) => {
    return Object.fromEntries(Object.entries(object).map((entry) => {
      return [toSnakeCase(entry[0]), entry[1]]
    }))
  }))
}

/**
 * @description Assign Objects into one FormData which keys are all transfered into snake_case.
 * @param {...Object}
 * @return {FormData} Assigned snake_case FormData.
 */
const toSnakeCaseFormData = (...objects) => {
  const formData = new FormData()
  for (let object of objects) {
    for (let entry of Object.entries) {
      formData.append(toSnakeCase(entry[0]), entry[1])
    }
  }
  return formData
}

module.exports = {
  perFromID,
  perChatID,
  isString,
  isArray,
  isFunction,
  isObject,
  isBuffer,
  isFormData,
  toSnakeCase,
  toSnakeCaseObject,
  toSnakeCaseFormData
}
