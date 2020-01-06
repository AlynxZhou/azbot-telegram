AZTGBot
=======

Alynx Zhou's zero-dependency Telegram Bot API implemention.
-----------------------------------------------------------

[![npm-version](https://img.shields.io/npm/v/aztgbot?style=for-the-badge)](https://www.npmjs.com/package/aztgbot)
[![npm-downloads](https://img.shields.io/npm/dt/aztgbot?style=for-the-badge)](https://www.npmjs.com/package/aztgbot)
[![node-version](https://img.shields.io/node/v/aztgbot?style=for-the-badge)](https://www.npmjs.com/package/aztgbot)
[![github-license](https://img.shields.io/github/license/AlynxZhou/aztgbot?style=for-the-badge)](https://github.com/AlynxZhou/aztgbot/blob/master/LICENSE)

# Usage

```
$ npm i -s aztgbot
```

# Example

## Echo Bot with BotMaster and BotServant

```JavaScript
const {
  BotMaster,
  BotServant,
  BotAPI,
  BotLogger,
  botUtils
} = require('aztgbot')

class EchoBot extends BotServant {
  constructor(botAPI, identifier, botID, botName) {
    super(botAPI, identifier, botID, botName)
  }

  async processUpdate(update) {
    if (update != null &&
        update['message'] != null &&
        update['message']['text'] != null) {
      await this.botAPI.sendChatAction(
        update['message']['chat']['id'],
        'typing'
      )
      await this.botAPI.sendMessage(
        update['message']['chat']['id'],
        update['message']['text'],
        {'replyToMessageID': update['message']['message_id']}
      )
    }
  }
}

new BotMaster(
  new BotAPI(process.argv[2]),
  EchoBot,
  botUtils.perFromID,
  {'botLogger': new BotLogger(true)}
).loop(null, null)
```

## Media Bot with BotPoller Directly

```JavaScript
const {
  BotPoller,
  BotAPI,
  BotLogger,
  botUtils
} = require('aztgbot')

class MediaBot {
  constructor(token) {
    this.botAPI = new BotAPI(token)
    this.botPoller = new BotPoller(this.botAPI, this.onUpdates.bind(this))
  }

  loop() {
    if (process.platform === 'win32') {
      require('readline').createInterface({
        'input': process.stdin,
        'output': process.stdout
      }).on('SIGINT', () => {
        process.emit('SIGINT')
      })
    }
    process.on('SIGINT', () => {
      this.botPoller.stopPollUpdates()
      process.exit()
    })
    this.botPoller.startPollUpdates()
  }

  async onUpdates(updates) {
    for (const update of updates) {
      if (update != null &&
          update['message'] != null &&
          update['message']['text'] != null) {
        await this.botAPI.sendChatAction(
          update['message']['chat']['id'],
          'typing'
        )
        await this.botAPI.sendMediaGroup(update['message']['chat']['id'], [
          new botUtils.InputMediaPhoto(new botUtils.InputFile('1.png')),
          new botUtils.InputMediaPhoto(new botUtils.InputFile('2.png')),
          new botUtils.InputMediaPhoto(new botUtils.InputFile('3.png'))
        ], {'replyToMessageID': update['message']['message_id']})
      }
    }
  }
}

new MediaBot(process.argv[2]).loop()
```

# License

Apache-2.0

# Other

Docs: [Here](https://alynx.moe/aztgbot/)
