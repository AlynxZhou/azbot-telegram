'use strict'

/**
 * @module bot-api
 */

const {
  get,
  post,
  isArray,
  isString,
  isFunction,
  isObject,
  isBuffer,
  isFormData,
  toSnakeCaseObject,
  toSnakeCaseFormData
} = require('./bot-utils')

/**
 * @description JavaScript implemention for Telegram Bot API.
 * @example
 * new BotAPI(token)
 */
class BotAPI {
  /**
   * @param {String} token Telegram Bot token.
   * @return {BotAPI}
   */
  constructor(token) {
    /**
     * @property {String} token Telegram Bot token.
     * @property {String} version Telegram Bot API version.
     */
    this.token = token
    this.version = '4.9'
  }

  /**
   * @param {*} o
   * @return {Boolean}
   */
  isBotAPI(o) {
    return o instanceof BotAPI
  }

  /**
   * @private
   * @description Warpper for HTTP requests.
   * @param {String} method Telegram Bot API method.
   * @param {FormData|Object} body Request body.
   * @return {Promise} Promise of Telegram result.
   */
  request(method, body) {
    const url = `https://api.telegram.org/bot${this.token}/${method}`
    let promise
    if (body != null) {
      if (isFormData(body)) {
        promise = post(url, body.getBuffer(), body.getHeaders())
      } else {
        promise = post(url, body)
      }
    } else {
      promise = get(url)
    }
    return promise.then((response) => {
      let data = JSON.parse(response.toString('utf8'))
      if (!data['ok']) {
        throw new Error(
          `Telegram Error: ${data['error_code']} ${data['description']}`,
          data
        )
      }
      return data['result']
    })
  }

  /**
   * @see https://core.telegram.org/bots/api#getupdates
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Update[]>}
   */
  getUpdates(opts = {}) {
    return this.request('getUpdates', toSnakeCaseObject(opts))
  }

  /**
   * @see https://core.telegram.org/bots/api#setwebhook
   * @param {String} url
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Boolean>}
   */
  setWebhook(url, opts = {}) {
    let body
    if (opts['certificate'] == null) {
      body = toSnakeCaseObject({url}, opts)
    } else {
      body = toSnakeCaseFormData({url}, opts)
    }
    return this.request('setWebhook', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#deletewebhook
   * @return {Promise<Boolean>}
   */
  deleteWebhook() {
    return this.request('deleteWebhook')
  }

  /**
   * @see https://core.telegram.org/bots/api#getwebhookinfo
   * @return {Promise<WebHookInfo>}
   */
  getWebhookInfo() {
    return this.request('getWebhookInfo')
  }

  /**
   * @see https://core.telegram.org/bots/api#getme
   * @return {Promise<User>}
   */
  getMe() {
    return this.request('getMe')
  }

  /**
   * @see https://core.telegram.org/bots/api#sendmessage
   * @param {(Number|String)} chatID Telegram chat ID.
   * @param {String} text Message content.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendMessage(chatID, text, opts = {}) {
    return this.request('sendMessage', toSnakeCaseObject({chatID, text}, opts))
  }

  /**
   * @see https://core.telegram.org/bots/api#sendmessage
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(Number|String)} fromChatID Source Telegram chat ID.
   * @param {Number} messageID Message ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Message>}
   */
  forwardMessage(chatID, fromChatID, messageID, opts = {}) {
    return this.request(
      'forwardMessage',
      toSnakeCaseObject({chatID, fromChatID, messageID}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#sendphoto
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} photo File ID, photo URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendPhoto(chatID, photo, opts = {}) {
    let body
    if (isString(photo)) {
      body = toSnakeCaseObject({chatID, photo}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, photo}, opts)
    }
    return this.request('sendPhoto', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#sendaudio
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} audio File ID, audio URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @param {(String|Object)} [opts.thumb] Thumb URL or InputFile.
   * @return {Promise<Message>}
   */
  sendAudio(chatID, audio, opts = {}) {
    let body
    if (isString(audio)) {
      body = toSnakeCaseObject({chatID, audio}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, audio}, opts)
    }
    return this.request('sendAudio', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#senddocument
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} document File ID, document URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @param {(String|Object)} [opts.thumb] Thumb URL or InputFile.
   * @return {Promise<Message>}
   */
  sendDocument(chatID, document, opts = {}) {
    let body
    if (isString(document) &&
        (opts['thumb'] == null || isString(opts['thumb']))) {
      body = toSnakeCaseObject({chatID, document}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, document}, opts)
    }
    return this.request('sendDocument', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#senddocument
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} video File ID, video URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @param {(String|Object)} [opts.thumb] Thumb URL or InputFile.
   * @return {Promise<Message>}
   */
  sendVideo(chatID, video, opts = {}) {
    let body
    if (isString(video) &&
        (opts['thumb'] == null || isString(opts['thumb']))) {
      body = toSnakeCaseObject({chatID, video}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, video}, opts)
    }
    return this.request('sendVideo', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#sendanimation
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} animation File ID, animation URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @param {(String|Object)} [opts.thumb] Thumb URL or InputFile.
   * @return {Promise<Message>}
   */
  sendAnimation(chatID, animation, opts = {}) {
    let body
    if (isString(animation) &&
        (opts['thumb'] == null || isString(opts['thumb']))) {
      body = toSnakeCaseObject({chatID, animation}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, animation}, opts)
    }
    return this.request('sendAnimation', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#sendvoice
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} voice File ID, voice URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendVoice(chatID, voice, opts = {}) {
    let body
    if (isString(voice)) {
      body = toSnakeCaseObject({chatID, voice}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, voice}, opts)
    }
    return this.request('sendVoice', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#sendvideonote
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} videoNote File ID, video note URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @param {(String|Object)} [opts.thumb] Thumb URL or InputFile.
   * @return {Promise<Message>}
   */
  sendVideoNote(chatID, videoNote, opts = {}) {
    let body
    if (isString(videoNote) &&
        (opts['thumb'] == null || isString(opts['thumb']))) {
      body = toSnakeCaseObject({chatID, videoNote}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, videoNote}, opts)
    }
    return this.request('sendVideoNote', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#sendmediagroup
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {InputMedia[]} media Set `InputMedia.media` or `InputMedia.thumb` to InputFile for uploading a file.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Message>}
   */
  sendMediaGroup(chatID, media, opts = {}) {
    let body
    const inputMedia = media
    const outputMedia = []
    let useFormData = false
    for (let i = 0; i < inputMedia.length; ++i) {
      const input = inputMedia[i]
      const output = toSnakeCaseObject(input)
      if (isObject(input['media'])) {
        useFormData = true
        opts[`input${i}`] = input['media']
        output['media'] = `attach://input${i}`
      }
      if (isObject(input['thumb'])) {
        useFormData = true
        opts[`inputthumb${i}`] = input['thumb']
        output['thumb'] = `attach://inputthumb${i}`
      }
      outputMedia.push(output)
    }
    if (!useFormData) {
      body = toSnakeCaseObject(
        {chatID, 'media': JSON.stringify(outputMedia)},
        opts
      )
    } else {
      body = toSnakeCaseFormData(
        {chatID, 'media': JSON.stringify(outputMedia)},
        opts
      )
    }
    return this.request('sendMediaGroup', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#sendlocation
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} latitude
   * @param {Number} longitude
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendLocation(chatID, latitude, longitude, opts = {}) {
    return this.request(
      'sendLocation',
      toSnakeCaseObject({chatID, latitude, longitude}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#editmessagelivelocation
   * @param {Number} latitude
   * @param {Number} longitude
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkupp.
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<Message>}
   */
  editMessageLiveLocation(latitude, longitude, opts = {}) {
    const body = toSnakeCaseObject({latitude, longitude}, opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    return this.request('editMessageLiveLocation', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#stopmessagelivelocation
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkupp.
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<Message>}
   */
  stopMessageLiveLocation(opts = {}) {
    const body = toSnakeCaseObject(opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    return this.request('stopMessageLiveLocation', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#sendvenue
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} latitude
   * @param {Number} longitude
   * @param {String} title
   * @param {String} address
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendVenue(chatID, latitude, longitude, title, address, opts = {}) {
    return this.request(
      'sendVenue',
      toSnakeCaseObject({chatID, latitude, longitude, title, address}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#sendcontact
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} phoneNumber User's phone number.
   * @param {String} firstName User's first name.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendContact(chatID, phoneNumber, firstName, opts = {}) {
    return this.request(
      'sendContact',
      toSnakeCaseObject({chatID, phoneNumber, firstName}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#sendpoll
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} question
   * @param {String} options JSON-serialized Array of String.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendPoll(chatID, question, options, opts = {}) {
    return this.request('sendPoll', toSnakeCaseObject(
      {chatID, question, options},
      opts
    ))
  }

  /**
   * @see https://core.telegram.org/bots/api#senddice
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendDice(chatID, opts = {}) {
    return this.request('sendDice', toSnakeCaseObject({chatID}, opts))
  }

  /**
   * @see https://core.telegram.org/bots/api#sendchataction
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} action
   * @return {Promise<Message>}
   */
  sendChatAction(chatID, action) {
    return this.request('sendChatAction', toSnakeCaseObject({chatID, action}))
  }

  /**
   * @see https://core.telegram.org/bots/api#getuserprofilephotos
   * @param {Number} userID Target Telegram user ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<UserProfilePhotos>}
   */
  getUserProfilePhotos(userID, opts = {}) {
    return this.request(
      'getUserProfilePhotos',
      toSnakeCaseObject({userID}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#getfile
   * @param {(Number|String)} fileID Target Telegram file ID.
   * @return {Promise<File>}
   */
  getFile(fileID) {
    return this.request('getFile', toSnakeCaseObject({fileID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#kickchatmember
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} userID Target Telegram user ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Boolean>}
   */
  kickChatMember(chatID, userID, opts = {}) {
    return this.request(
      'kickChatMember',
      toSnakeCaseObject({chatID, userID}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#unbanchatmember
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} userID Target Telegram user ID.
   * @return {Promise<Boolean>}
   */
  unbanChatMember(chatID, userID) {
    return this.request('unbanChatMember', toSnakeCaseObject({chatID, userID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#restrictchatmember
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} userID Target Telegram user ID.
   * @param {String} permissions JSON-serialized ChatPermissions.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Boolean>}
   */
  restrictChatMember(chatID, userID, permissions, opts = {}) {
    return this.request(
      'restrictChatMember',
      toSnakeCaseObject({chatID, userID, permissions}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#promotechatmember
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} userID Target Telegram user ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Boolean>}
   */
  promoteChatMember(chatID, userID, opts = {}) {
    return this.request(
      'promoteChatMember',
      toSnakeCaseObject({chatID, userID}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#setchatadministratorcustomtitle
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} userID Target Telegram user ID.
   * @param {String} customTitle
   * @return {Promise<Boolean>}
   */
  setChatAdministratorCustomTitle(chatID, userID, customTitle) {
    return this.request(
      'setChatAdministratorCustomTitle',
      toSnakeCaseObject({chatID, userID, customTitle})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#setchatpermissions
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} permissions JSON-serialized ChatPermissions.
   * @return {Promise<Boolean>}
   */
  setChatPermissions(chatID, permissions) {
    return this.request(
      'setChatPermissions',
      toSnakeCaseObject({chatID, permissions})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#exportchatinvitelink
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<String>}
   */
  exportChatInviteLink(chatID) {
    return this.request('exportChatInviteLink', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#setchatphoto
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Object} photo InputFile.
   * @return {Promise<Boolean>}
   */
  setChatPhoto(chatID, photo) {
    return this.request('setChatPhoto', toSnakeCaseFormData({chatID, photo}))
  }

  /**
   * @see https://core.telegram.org/bots/api#deletechatphoto
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<Boolean>}
   */
  deleteChatPhoto(chatID) {
    return this.request('deleteChatPhoto', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#setchattitle
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} title
   * @return {Promise<Boolean>}
   */
  setChatTitle(chatID, title) {
    return this.request('setChatTitle', toSnakeCaseObject({chatID, title}))
  }

  /**
   * @see https://core.telegram.org/bots/api#setdescription
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} description
   * @return {Promise<Boolean>}
   */
  setChatDescription(chatID, description) {
    return this.request(
      'setChatDescription',
      toSnakeCaseObject({chatID, description})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#pinchatmessage
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(Number|String)} messageID Target Telegram message ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Boolean>}
   */
  pinChatMessage(chatID, messageID, opts = {}) {
    return this.request(
      'pinChatMessage',
      toSnakeCaseObject({chatID, messageID}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#unpinchatmessage
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<Boolean>}
   */
  unpinChatMessage(chatID) {
    return this.request('unpinChatMessage', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#leavechat
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<Boolean>}
   */
  leaveChat(chatID) {
    return this.request('leaveChat', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#getchat
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<Chat>}
   */
  getChat(chatID) {
    return this.request('getChat', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#getchatadministrators
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<ChatMember[]>}
   */
  getChatAdministrators(chatID) {
    return this.request('getChatAdministrators', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#getchatmemberscount
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<Number>}
   */
  getChatMembersCount(chatID) {
    return this.request('getChatMembersCount', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#getchatmember
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {Number} userID Target Telegram user ID.
   * @return {Promise<ChatMember>}
   */
  getChatMember(chatID, userID) {
    return this.request('getChatMember', toSnakeCaseObject({chatID, userID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#setchatstickerset
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} stickerSetName
   * @return {Promise<Boolean>}
   */
  setChatStickerSet(chatID, stickerSetName) {
    return this.request(
      'setChatStickerSet',
      toSnakeCaseObject({chatID, stickerSetName})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#deletechatstickerset
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @return {Promise<Boolean>}
   */
  deleteChatStickerSet(chatID) {
    return this.request('deleteChatStickerSet', toSnakeCaseObject({chatID}))
  }

  /**
   * @see https://core.telegram.org/bots/api#deletechatstickerset
   * @param {String} callbackQueryID Target Telegram callback query ID.
   * @return {Promise<Boolean>}
   */
  answerCallbackQuery(callbackQueryID, opts = {}) {
    return this.request(
      'answerCallbackQuery',
      toSnakeCaseObject({callbackQueryID}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#setmycommands
   * @param {String} commands JSON-serialized Array of BotCommand.
   * @return {Promise<Boolean>}
   */
  setMyCommands(commands) {
    return this.request('setMyCommands', toSnakeCaseObject({commands}))
  }

  /**
   * @see https://core.telegram.org/bots/api#getmycommands
   * @return {Promise<BotCommand[]>}
   */
  getMyCommands() {
    return this.request('getMyCommands')
  }

  /**
   * @see https://core.telegram.org/bots/api#editmessagetext
   * @param {String} text Message content.
   * @param {Object} opts Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<Message>}
   */
  editMessageText(text, opts = {}) {
    const body = toSnakeCaseObject({text}, opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    return this.request('editMessageText', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#editmessagecaption
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkupp .
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<Message>}
   */
  editMessageCaption(opts = {}) {
    const body = toSnakeCaseObject(opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    return this.request('editMessageCaption', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#editmessagemedia
   * @param {InputMedia} media Set InputMedia.media or InputMedia.thumb to Buffer for uploading a file.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkupp.
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<Message>}
   */
  editMessageMedia(media, opts = {}) {
    let body = toSnakeCaseObject(opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    const input = media
    const output = toSnakeCaseObject(input)
    let useFormData = false
    if (isObject(input['media'])) {
      useFormData = true
      opts[`input${i}`] = input['media']
      output['media'] = `attach://input${i}`
    }
    if (isObject(input['thumb'])) {
      useFormData = true
      opts[`inputthumb${i}`] = input['thumb']
      output['thumb'] = `attach://inputthumb${i}`
    }
    if (!useFormData) {
      body = toSnakeCaseObject({chatID, 'media': JSON.stringify(output)}, opts)
    } else {
      body = toSnakeCaseFormData(
        {chatID, 'media': JSON.stringify(output)},
        opts
      )
    }
    return this.request('editMessageMedia', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#editmessagereplymarkup
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkupp.
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<Message>}
   */
  editMessageReplyMarkup(opts = {}) {
    const body = toSnakeCaseObject(opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    return this.request('editMessageReplyMarkup', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#stoppoll
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(Number|String)} messageID Target Telegram message ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkupp.
   * @return {Promise<Poll>}
   */
  stopPoll(chatID, messageID, opts = {}) {
    return this.request(
      'stopPoll',
      toSnakeCaseObject({chatID, messageID}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#deletemessage
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(Number|String)} messageID Target Telegram message ID.
   * @return {Promise<Boolean>}
   */
  deleteMessage(chatID, messageID) {
    return this.request(
      'deleteMessage',
      toSnakeCaseObject({chatID, messageID})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#sendsticker
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {(String|Object)} sticker File ID, sticker URL or InputFile.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendSticker(chatID, sticker, opts = {}) {
    let body
    if (isString(sticker)) {
      body = toSnakeCaseObject({chatID, sticker}, opts)
    } else {
      body = toSnakeCaseFormData({chatID, sticker}, opts)
    }
    return this.request('sendSticker', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#getstickerset
   * @param {String} name
   * @return {Promise<StickerSet>}
   */
  getStickerSet(name) {
    return this.request('getStickerSet', toSnakeCaseObject({name}))
  }

  /**
   * @see https://core.telegram.org/bots/api#uploadstickerfile
   * @param {Number} userID Telegram user ID of sticker file.
   * @param {Object} pngSticker Sticker InputFile.
   * @return {Promise<Message>}
   */
  uploadStickerFile(userID, pngSticker) {
    return this.request(
      'uploadStickerFile',
      toSnakeCaseFormData({userID, pngSticker})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#createnewstickerset
   * @param {Number} userID Telegram user ID for created sticker set owner.
   * @param {String} name Short name of sticker set.
   * @param {String} title Sticker set title.
   * @param {(String|Object)} pngSticker File ID, sticker URL or InputFile.
   * @param {(String|Object)} tgsSticker InputFile.
   * @param {String} emojis One or more emoji corresponding to the sticker.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.maskPosition] JSON-serialized MaskPosition.
   * @return {Promise<Boolean>}
   */
  createNewStickerSet(userID, name, title, pngSticker, tgsSticker, emojis, opts = {}) {
    const parameters = {userID, name, title, emojis}
    let body
    if (tgsSticker != null) {
      parameters['tgsSticker'] = tgsSticker
    }
    if (pngSticker != null) {
      parameters['pngSticker'] = pngSticker
    }
    if (tgsSticker != null || (pngSticker != null && !isString(pngSticker))) {
      body = toSnakeCaseFormData(parameters, opts)
    } else {
      body = toSnakeCaseObject(parameters, opts)
    }
    return this.request('createNewStickerSet', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#addstickertoset
   * @param {Number} userID Telegram user ID for sticker set owner.
   * @param {String} name
   * @param {(String|Object)} pngSticker File ID, sticker URL or InputFile.
   * @param {(String|Object)} tgsSticker InputFile.
   * @param {String} emojis One or more emoji corresponding to the sticker.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.maskPosition] JSON-serialized MaskPosition.
   * @return {Promise<Boolean>}
   */
  addStickerToSet(userID, name, pngSticker, tgsSticker, emojis, opts = {}) {
    const parameters = {userID, name, emojis}
    let body
    if (tgsSticker != null) {
      parameters['tgsSticker'] = tgsSticker
    }
    if (pngSticker != null) {
      parameters['pngSticker'] = pngSticker
    }
    if (tgsSticker != null || (pngSticker != null && !isString(pngSticker))) {
      body = toSnakeCaseFormData(parameters, opts)
    } else {
      body = toSnakeCaseObject(parameters, opts)
    }
    return this.request('addStickerToSet', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#setstickerpositioninset
   * @param {String} sticker File ID of the sticker.
   * @param {Number} position New sticker position in the set, zero-based.
   * @return {Promise<Boolean>}
   */
  setStickerPositionInSet(sticker, position) {
    return this.request(
      'setStickerPositionInSet',
      toSnakeCaseObject({sticker, position})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#deletestickerpositioninset
   * @param {String} sticker File ID of the sticker.
   * @return {Promise<Boolean>}
   */
  deleteStickerFromSet(sticker) {
    return this.request('deleteStickerFromSet', toSnakeCaseObject({sticker}))
  }

  /**
   * @see https://core.telegram.org/bots/api#setstickersetthumb
   * @param {String} name Sticker set name.
   * @param {Number} userID Telegram user ID of the sticker set owner.
   * @param {(String|Object)} thumb File ID, sticker URL or InputFile.
   * @return {Promise<Boolean>}
   */
  setStickerSetThumb(name, userID, thumb) {
    let body
    if (!isString(thumb)) {
      body = toSnakeCaseFormData({name, userID, thumb})
    } else {
      body = toSnakeCaseObject({name, userID, thumb})
    }
    return this.request('setStickerSetThumb', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#answerinlinequery
   * @param {String} inlineQueryID Target inline query ID.
   * @param {String} results JSON-serialized Array of InlineQueryResult.
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Boolean>}
   */
  answerInlineQuery(inlineQueryID, results, opts = {}) {
    return this.request(
      'answerInlineQuery',
      toSnakeCaseObject({inlineQueryID, results}, opts)
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#sendinvoice
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} title Product name.
   * @param {String} description Product description.
   * @param {String} payload Bot-defined internal invoice payload.
   * @param {String} providerToken Payments provider token.
   * @param {String} startParameter Unique deep-linking parameter used to generate this invoice as a start parameter.
   * @param {String} currency Three-letter ISO 4217 currency code.
   * @param {String} prices Price breakdown, a list of components.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendInvoice(
    chatID, title, description, payload, providerToken,
    startParameter, currency, prices, opts = {}
  ) {
    return this.request('sendInvoice', toSnakeCaseObject(
      {chatID, title, description, payload, providerToken, startParameter, currency, prices},
      opts
    ))
  }

  /**
   * @see https://core.telegram.org/bots/api#answershippingquery
   * @param {String} shippingQueryID Target shipping query ID.
   * @param {Boolean} ok
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.shippingOptions] JSON-serialized Array of ShippingOption.
   * @return {Promise<Boolean>}
   */
  answerShippingQuery(shippingQueryID, ok, opts = {}) {
    const body = toSnakeCaseObject({shippingQueryID, ok}, opts)
    if (!body['ok'] && body['error_message'] == null) {
      throw new Error('Need `opts[\'error_message\']` when `ok` is `false`')
    }
    return this.request('answerShippingQuery', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#answerprecheckoutquery
   * @param {String} preCheckoutQueryID Target pre checkout query ID.
   * @param {Boolean} ok
   * @param {Object} [opts] Optional Telegram patameters.
   * @return {Promise<Boolean>}
   */
  answerPreCheckoutQuery(preCheckoutQueryID, ok, opts = {}) {
    const body = toSnakeCaseObject({preCheckoutQueryID, ok}, opts)
    if (!body['ok'] && body['error_message'] == null) {
      throw new Error('Need `opts[\'error_message\']` when `ok` is `false`')
    }
    return this.request('answerPreCheckoutQuery', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#setpassportdataerrors
   * @param {String} userID Target Telegram user ID.
   * @param {String} errors JSON-serialized Array of PassportElementError.
   * @return {Promise<Boolean>}
   */
  setPassportDataErrors(userID, errors) {
    return this.request(
      'setPassportDataErrors',
      toSnakeCaseObject({userID, errors})
    )
  }

  /**
   * @see https://core.telegram.org/bots/api#sendgame
   * @param {(Number|String)} chatID Target Telegram chat ID.
   * @param {String} gameShortName Short name of the game.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {String} [opts.replyMarkup] JSON-serialized InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply.
   * @return {Promise<Message>}
   */
  sendGame(chatID, gameShortName, opts = {}) {
    return this.request('sendGame', toSnakeCaseObject(
      {chatID, gameShortName}, opts
    ))
  }

  /**
   * @see https://core.telegram.org/bots/api#setgamescore
   * @param {Number} userID Target Telegram user ID.
   * @param {Number} score New non-negative score.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<Message|Boolean|Error>}
   */
  setGameScore(userID, score, opts = {}) {
    const body = toSnakeCaseObject({userID, score}, opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    return this.request('setGameScore', body)
  }

  /**
   * @see https://core.telegram.org/bots/api#getGameHighScores
   * @param {Number} userID Target Telegram user ID.
   * @param {Object} [opts] Optional Telegram patameters.
   * @param {Number} [opts.chatID] Required if inlineMessageID is not given.
   * @param {Number} [opts.messageID] Required if inlineMessageID is not given.
   * @param {String} [opts.inlineMessageID] Required if chatID and inlineMessageID are not given.
   * @return {Promise<GameHighScore[]>}
   */
  getGameHighScores(userID, opts = {}) {
    const body = toSnakeCaseObject({userID}, opts)
    if (!(body['inline_message_id'] != null ||
          (body['message_id'] != null && body['chat_id'] != null))) {
      throw new Error('Need either `opts[\'inline_message_id\']` or both `opts[\'message_id\']` and `opts[\'chat_id\']`')
    }
    return this.request('getGameHighScores', body)
  }
}

module.exports = BotAPI
