## Agentic Shorts Studio

Agentic Shorts Studio transforms a single idea into a fully produced vertical short and pushes it live to YouTube in one run. The automation flow covers:

- Script ideation and beat structuring via the OpenAI Responses API.
- Natural-sounding narration with OpenAI text-to-speech.
- Visual generation through OpenAI Images with an optional Pexels fallback.
- 1080x1920 video assembly using Node.js and ffmpeg.
- Automatic metadata, thumbnail, and publishing through the YouTube Data API.

### 1. Configure secrets

Duplicate `.env.example` to `.env.local` and fill in the values:

- `OPENAI_API_KEY` – required for script, audio, and image synthesis.
- `PEXELS_API_KEY` – optional fallback if image generation fails.
- `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` – required for auto-upload. Tokens need the `youtube.upload` scope.
- `YOUTUBE_CHANNEL_ID`, `YOUTUBE_DEFAULT_TAGS`, `YOUTUBE_PRIVACY_STATUS` – optional, used to fine-tune publishing defaults.

### 2. Run locally

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) and launch new shorts from the dashboard.

### 3. Production build

```bash
npm run build
npm start
```

### 4. Deploy to Vercel

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-0fdc3114
```

After deploy, confirm availability:

```bash
curl https://agentic-0fdc3114.vercel.app
```
