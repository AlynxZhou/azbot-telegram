aztgbot
=======

Alynx Zhou's Telegram Bot API implemention.
-------------------------------------------

# Usage

```
$ npm i -s aztgbot
```

# Example

## Echo Bot with BotMaster and BotServant

```JavaScript
const {BotMaster, BotServant, BotAPI, BotLogger, botUtils} = require('aztgbot')

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

## Echo Bot with BotPoller Directly

```JavaScript
const {BotPoller, BotAPI, BotLogger, botUtils} = require('aztgbot')

class EchoBot {
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
        await this.botAPI.sendChatAction(update['message']['chat']['id'], 'typing')
        await this.botAPI.sendMessage(update['message']['chat']['id'], update['message']['text'], {'replyToMessageID': update['message']['message_id']})
      }
    }
  }
}

new EchoBot(process.argv[2]).loop()
```

# License

Apache-2.0

# Other

Docs: [Here](https://alynx.moe/aztgbot/)
