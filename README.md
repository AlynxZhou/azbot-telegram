AZBot-Telegram
==============

Alynx Zhou's zero-dependency Telegram Bot API implemention.
-----------------------------------------------------------

[![npm-version](https://img.shields.io/npm/v/azbot-telegram?style=for-the-badge)](https://www.npmjs.com/package/azbot-telegram)
[![npm-downloads](https://img.shields.io/npm/dt/azbot-telegram?style=for-the-badge)](https://www.npmjs.com/package/azbot-telegram)
[![node-version](https://img.shields.io/node/v/azbot-telegram?style=for-the-badge)](https://www.npmjs.com/package/azbot-telegram)
[![github-license](https://img.shields.io/github/license/AlynxZhou/azbot-telegram?style=for-the-badge)](https://github.com/AlynxZhou/azbot-telegram/blob/master/LICENSE)

# Usage

```
$ npm i -s azbot-telegram
```

**NOTE**: Since v3.0.0 this package is renamed from `aztgbot` to `azbot-telegram`.

# Example

## Echo Bot with BotMaster and BotServant

```JavaScript
import {
  BotMaster,
  BotServant,
  BotAPI,
  BotLogger,
  botUtils
} from 'azbot-telegram'

class EchoBot extends BotServant {
  constructor(botAPI, identifier, botID, botName) {
    super(botAPI, identifier, botID, botName)
  }

  async processUpdate(update) {
    if (update['message'] != null &&
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
).loop()
```

## Media Bot with BotPoller Directly

```JavaScript
import {
  BotPoller,
  BotAPI,
  botUtils
} from 'azbot-telegram'

class MediaBot {
  constructor(token) {
    this.botAPI = new BotAPI(token)
    this.botPoller = new BotPoller(this.botAPI, this.onUpdates.bind(this))
  }

  loop() {
    process.on('SIGINT', () => {
      this.botPoller.stopPollUpdates()
      process.exit(0)
    })
    this.botPoller.startPollUpdates()
  }

  async onUpdates(updates) {
    for (const update of updates) {
      if (update['message'] != null &&
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

Docs: [Here](https://tgbot.alynx.one/)

Repo: [GitHub](https://github.com/AlynxZhou/azbot-telegram/)
