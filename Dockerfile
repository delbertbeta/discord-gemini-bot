FROM node:20-slim
ADD dist/* /discord-gemini-bot/
WORKDIR /discord-gemini-bot
CMD ["node", "index.js"]
