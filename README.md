<p align="center"><img height="160" src="assets/logo.png" /></p>

## Discord Gemini Bot 🤖

### Features

<p align="center"><img width="600" src="assets/screenshot_1.png" /></p>

- [x] 😀 Chat using texts
- [x] 👋🏼 Chat with context
- [x] 🥷🏼 Clear context with `/clear` command
- [x] 🚀 Streaming output
- [ ] Multimodal support

<br />

### Deploy

#### Get the codes

This project is written in TypeScript, before deploy, ensure you have NodeJS (>= v20 is recommended) installed. If you don't have NodeJS, [fnm](https://github.com/Schniz/fnm) is the NodeJS installer recommended.

```bash
git clone https://github.com/delbertbeta/discord-gemini-bot.git
cd discord-gemini-bot
npm i
```

<br />

#### Making APIs Ready

1. Get Discord API Key and Client ID via : https://discord.com/developers/applications
   1. If you do not have a bot, just create one.
   2. After create, click `Bot` in the nav.
   3. In `Privileged Gateway Intents`, enable following permissions:
      1. `Presence Intent`
      2. `Server Members Intent`
      3. `Message Content Intent`
2. Get Gemini API Key via: https://aistudio.google.com/app/apikey

```bash
cp .env.example .env
```

Then replace your key into `.env` file, reminder to keep these keys safely and **DO NOT** upload this file to public place.

<br />

#### Run Server

```js
npm run dev
```

You will see this output if everthing is working fine: `Bot is ready!`

**The Bot only works if your process is running which means if you stop the process then the bot won't give you response.**

To make the bot server as a background service, use `systemd`, `tmux` or `screen`.

<br />

#### Add Gemini bot to your Discord Server

1. Open https://discord.com/developers/applications and select the bot you just created.
2. Click `OAuth2` in the nav.
3. In `OAuth2 URL Generator`, check the following options:
   1. `bot`
   2. `applications.commands`
4. In `Bot Permissions`, check the following options:
   1. `Send Messages`
   2. `Create Public Threads`
   3. `Manage Messages`
   4. `Embed Links`
   5. `Attach Files`
   6. `Read Message History`
   7. `Mention Everyone`
   8. `Use Slash Commands`
   9. `View Channels`
5. `Integration Type` choose `Guild Install`
6. Copy the `Generated URL` and open it in your browser, now you can add it into your discord server.

Congrats on making your own Gemini Bot.

<br />

### Thanks

- [Bibekdhkl/Gemini-discord-bot](https://github.com/Bibekdhkl/Gemini-discord-bot)
