
# G.A.M.E Platform Integrations

This repository contains platform integrations for the **G.A.M.E Framework**, enabling interactions with multiple services such as Discord, Telegram, and Warpcast through SDKs. It is built using **TypeScript** and related libraries.

## Features

- **Discord Integration**: Fetch and send messages via Discord using `discord.js`.
- **Telegram Bot Support**: Interact with Telegram chats using `telegraf`.
- **Warpcast Integration**: Publish and retrieve messages through the Warpcast platform using `neynar/nodejs-sdk`.

## Prerequisites

- **Node.js**: Ensure Node.js (v16+) is installed.
- **npm or yarn**: For managing dependencies.
- **Environment Variables**: Configure the `.env` file with the required keys:
  ```
  NEYNAR_API_KEY=YOUR_NEYNAR_API_KEY
  TG_BOT_TOKEN=YOUR_TG_BOT_TOKEN
  DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
  BEARER_TOKEN=YOUR_BEARNER_TOKEN
  SIGNER_UUID=YOUR_WARPCAST_SIGNER_UUID
  PORT=3000
  DISCORD_CHANNEL_ID=YOUR_DISCORD_CHANNEL_ID
  TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID
  WARPCAST_CHANNEL=YOUR_WARPCAST_CHANNEL
  FID=YOUR_WARPCAST_FID
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JumbleBumble/game-platform-integrations.git
   cd game-platform-integrations
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the `.env` file with your API keys and tokens.

## Usage

- Start the development server:
  ```bash
  npm run dev
  ```

- Build the project:
  ```bash
  npm run build
  ```

- Run the production server:
  ```bash
  npm start
  ```

## Scripts

- `npm run dev`: Starts the server with `nodemon` for live reloading.
- `npm run build`: Compiles TypeScript files into JavaScript.
- `npm start`: Runs the compiled JavaScript files.

# API Endpoints

## Discord Routes (Prefix: /dc)

### /dc/last_messages
- **Method**: GET
- **Description**: Fetches the last 60 messages from the Discord chat.
- **Body Parameters**: None

### /dc/post_message
- **Method**: POST
- **Description**: Posts a message to the Discord channel.
- **Body Parameters**: 
  - `message` (required): The content of the message to be posted.
- **Authorization**: Bearer token required in the `Authorization` header.

### /dc/reply_message
- **Method**: POST
- **Description**: Replies to a specific message in the Discord channel.
- **Body Parameters**: 
  - `message` (required): The content of the message to be posted.
  - `id` (required): The ID of the message to reply to.
- **Authorization**: Bearer token required in the `Authorization` header.

---

## Telegram Routes (Prefix: /tg)

### /tg/last_messages
- **Method**: GET
- **Description**: Fetches the last 100 messages from the Telegram chat.
- **Body Parameters**: None

### /tg/post_message
- **Method**: POST
- **Description**: Posts a message to the Telegram chat.
- **Body Parameters**: 
  - `message` (required): The content of the message to be posted.
- **Authorization**: Bearer token required in the `Authorization` header.

### /tg/reply_message
- **Method**: POST
- **Description**: Replies to a specific message in the Telegram chat.
- **Body Parameters**: 
  - `message` (required): The content of the message to be posted.
  - `id` (required): The ID of the message to reply to.
- **Authorization**: Bearer token required in the `Authorization` header.

---

## Warpcast Routes (Prefix: /wc)

### /wc/feed
- **Method**: GET
- **Description**: Fetches the feed for the Warpcast channel.
- **Body Parameters**: None

### /wc/post_message
- **Method**: POST
- **Description**: Posts a message to the Warpcast channel.
- **Body Parameters**: 
  - `message` (required): The content of the message to be posted.
- **Authorization**: Bearer token required in the `Authorization` header.

### /wc/reply_message
- **Method**: POST
- **Description**: Replies to a specific message in the Warpcast channel.
- **Body Parameters**: 
  - `message` (required): The content of the message to be posted.
  - `hash` (required): The hash of the message to reply to.
- **Authorization**: Bearer token required in the `Authorization` header.


## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contribution

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss your ideas.
