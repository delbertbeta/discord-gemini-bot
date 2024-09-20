FROM node:20
ADD dist/* /discord-gemini-bot/
WORKDIR /discord-gemini-bot
CMD ["node", "index.js"]
