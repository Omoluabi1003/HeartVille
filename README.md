# ❤️ Heartville – Dating App MVP

Heartville is an intentionally designed dating experience built with Expo (React Native) on the client and an Express + Socket.IO API on the server. The experience focuses on meaningful matches, thoughtful prompts, and actionable insights.

## Features

- **Curated discovery feed** with richly designed profile cards, compatibility highlights, interests, and conversation prompts.
- **Match management** that tracks your recent connections, including compatibility scores and conversation starters.
- **Live updates** via Socket.IO so you immediately see new matches and toasts without refreshing.
- **Message previews** that surface ongoing conversations with contextual timestamps.
- **Connection insights** summarizing likes, response rates, top-performing interests, and a weekly highlight.

## Getting started

### Requirements

- Node.js 18+
- Yarn or npm

### 1. Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### 2. Start the API server

```bash
cd server
npm start
```

The API will boot on [http://localhost:4000](http://localhost:4000).

### 3. Start the Expo client

```bash
cd client
npx expo start
```

Expo will open the development tools in your browser. Press `i` to launch the iOS simulator, `a` for the Android emulator, or scan the QR code using the Expo Go app on your device.

> **Tip:** When running the mobile app on an Android emulator, the API base URL automatically maps to `http://10.0.2.2:4000`. For iOS simulator and web it remains `http://localhost:4000`.

## Project structure

```
client/
  src/App.js        # React Native experience
server/
  src/index.js      # Express + Socket.IO API with sample data
```

## API overview

### `GET /api/profiles`
Returns the curated list of profiles. Profile `user-1` is the logged-in user used for demo purposes.

### `POST /api/matches`
Creates a new match for the logged-in user. Pass `{ "targetId": "user-2", "superLike": true }` to simulate a spark.

### `GET /api/matches`
Fetches the match history with compatibility scores and conversation starters.

### `GET /api/messages`
Returns message previews for your matches.

### `GET /api/insights`
Provides this week’s dating insights used by the Insights tab.

## Screenshot

The UI is best experienced through Expo — fire it up and start exploring your Heartville universe! ✨
