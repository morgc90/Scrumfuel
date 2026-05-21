# ScrumFuel 🏉

AI-powered nutrition and fitness coaching for rugby players. Built with React + Anthropic Claude API, deployed on Vercel.

---

## Project structure

```
scrumfuel/
├── api/
│   └── chat.js          ← Secure backend proxy (keeps API key secret)
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          ← Main React app
│   ├── App.css          ← Styles
│   └── index.js         ← Entry point
├── package.json
├── vercel.json          ← Vercel routing config
└── README.md
```

---

## Deploy in 5 steps

### 1. Get an Anthropic API key
Sign up at https://console.anthropic.com and create an API key.

### 2. Install dependencies
```bash
npm install
```

### 3. Test locally
Create a `.env` file in the root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Then run:
```bash
npm start
```
The app runs at http://localhost:3000. The `/api/chat` proxy is handled by Vercel Dev:
```bash
npx vercel dev
```

### 4. Deploy to Vercel
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Follow the prompts — it detects React automatically
```

### 5. Add your API key to Vercel
In your Vercel dashboard:
- Go to your project → Settings → Environment Variables
- Add: `ANTHROPIC_API_KEY` = `sk-ant-your-key-here`
- Redeploy: `vercel --prod`

Your app is now live at `https://your-project.vercel.app` 🎉

---

## How the API proxy works

The app NEVER sends your Anthropic API key to the browser.

```
Browser → POST /api/chat (no key)
              ↓
         Vercel function (api/chat.js)
              ↓ adds API key from environment
         Anthropic API
              ↓
         Reply → Browser
```

This means:
- Your key is safe even if someone views page source
- You can add rate limiting, auth, and usage tracking here
- You control costs server-side

---

## Adding user authentication (optional next step)

To gate access behind a login (e.g. paid users only), add:
1. **Clerk** (https://clerk.com) — drop-in auth, free tier
2. Check `req.headers.authorization` in `api/chat.js`
3. Only forward to Anthropic if the user is verified

---

## Adding Stripe payments (optional)

1. Sign up at https://stripe.com
2. Add a `/api/create-checkout` serverless function
3. Gate the AI coach behind a subscription check in `api/chat.js`

---

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required) |

---

## Tech stack

- **Frontend**: React 18
- **AI**: Anthropic Claude (claude-sonnet-4-20250514)
- **Backend**: Vercel Serverless Functions
- **Hosting**: Vercel (free tier works fine)
