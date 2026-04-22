<<<<<<< HEAD
# LinkedPulse — LinkedIn Keyword Monitor & Auto-Commenter

A full-stack Next.js application that monitors LinkedIn posts for keywords and auto-generates contextual comments using Claude AI.

---

## 🏗 Architecture

```
linkedpulse/
├── app/
│   ├── api/
│   │   ├── stream/route.ts       # SSE real-time stream
│   │   ├── pipeline/route.ts     # Start/stop/config pipeline
│   │   ├── keywords/route.ts     # CRUD keyword management
│   │   ├── posts/route.ts        # Post retrieval + filtering
│   │   └── comments/route.ts     # Manual comment generation
│   ├── dashboard/
│   │   ├── page.tsx              # Main dashboard (client)
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Redirects to /dashboard
├── components/
│   ├── NavBar.tsx                # Top navigation
│   ├── StatsCards.tsx            # Animated stats
│   ├── PipelineControl.tsx       # Start/stop + config
│   ├── KeywordManager.tsx        # Add/toggle/delete keywords
│   ├── PostFeed.tsx              # Live post stream
│   ├── ActivityLog.tsx           # Terminal-style log
│   └── useSSE.ts                 # SSE hook with auto-reconnect
├── lib/
│   ├── store.ts                  # In-memory state + SSE broadcast
│   ├── linkedin.ts               # Mock + real Unipile API
│   ├── keywords.ts               # NLP keyword detection engine
│   ├── claude.ts                 # Claude AI comment generation
│   └── pipeline.ts               # Automation orchestrator
├── types/index.ts                # TypeScript types
└── .env.local                    # Environment config
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env.local`:
```bash
# Keep MOCK_MODE=true to run without real API keys
MOCK_MODE=true

# Optional: Add real keys to use live APIs
ANTHROPIC_API_KEY=sk-ant-...
UNIPILE_API_KEY=your-unipile-key
UNIPILE_DSN=your-dsn.unipile.com
```

### 3. Run development server
```bash
npm run dev
```

### 4. Open dashboard
```
http://localhost:3000
```

---

## 🔌 Connecting Real APIs

### Claude AI (Anthropic)
1. Get API key from https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY=sk-ant-...` in `.env.local`
3. Set `MOCK_MODE=false`

The system uses `claude-sonnet-4-20250514` for comment generation.

### Unipile (LinkedIn)
1. Sign up at https://unipile.com
2. Connect your LinkedIn account via their OAuth flow
3. Copy your `API Key`, `DSN`, and `Account ID`
4. Set them in `.env.local`
5. In `lib/pipeline.ts`, replace the mock call with:
```typescript
const posts = await fetchRealLinkedInFeed(accountId, apiKey, dsn)
```

---

## 📡 How the Pipeline Works

```
1. User clicks START
   └─> pipeline.ts: startPipeline()

2. Poll cycle runs every N seconds
   └─> linkedin.ts: fetchLinkedInFeed()
       └─> Returns array of LinkedInPost

3. Each post scanned by keyword engine
   └─> keywords.ts: detectKeywords()
       └─> Returns matches with confidence scores

4. Matched posts → Claude generates comment
   └─> claude.ts: generateComment(post, keyword, author)
       └─> Returns natural, context-aware comment string

5. Comment posted via Unipile API
   └─> linkedin.ts: postLinkedInComment()

6. All events broadcast via SSE
   └─> store.ts: broadcast()
       └─> Dashboard updates in real-time
```

---

## 🎛 Dashboard Features

| Panel | Description |
|---|---|
| **Stats Cards** | Live animated counters — posts scanned, matches, comments, success rate |
| **Pipeline Control** | Start/stop button, visual pipeline steps, config panel |
| **Keyword Manager** | Add/remove/toggle keywords, AI vs template mode |
| **Post Feed** | Live post stream with match highlighting, filter by status, click to expand |
| **Activity Log** | Terminal-style auto-scrolling log of all system events |

---

## ⚙️ Configuration Options

| Setting | Default | Description |
|---|---|---|
| `pollIntervalSeconds` | 30 | How often to fetch new posts |
| `dailyCommentLimit` | 50 | Max comments per day (anti-spam) |
| `minDelaySeconds` | 15 | Min delay between comments |
| `maxDelaySeconds` | 60 | Max delay between comments |
| `feedScope` | network | network / personal / all |
| `confidenceThreshold` | 0.65 | Min score to consider a keyword match |

---

## 🛡 Safety Features

- **Daily comment limits** — configurable cap prevents overposting
- **Randomized delays** — human-like timing between comments
- **Confidence threshold** — avoids false positive matches
- **Deduplication** — posts tracked by URN, never double-commented
- **Token encryption** — OAuth tokens stored securely
- **Graceful error handling** — failed comments logged, pipeline continues

---

## 📦 Tech Stack

- **Next.js 14** (App Router) — fullstack framework
- **TypeScript** — end-to-end type safety
- **Tailwind CSS** — utility styling
- **Anthropic SDK** — Claude AI integration
- **Server-Sent Events** — real-time dashboard updates
- **In-memory store** — zero-DB demo mode (swap for PostgreSQL/Redis in production)

---

## 🔧 Production Checklist

- [ ] Replace in-memory store with PostgreSQL + Prisma
- [ ] Add Redis queue (BullMQ) for comment scheduling
- [ ] Add user authentication (NextAuth)
- [ ] Store OAuth tokens encrypted in DB
- [ ] Add rate limiting middleware
- [ ] Deploy to Vercel / Railway / Render
- [ ] Set up monitoring (Sentry, Axiom)
=======
# linkedpulse
LinkedIn automation tool project
>>>>>>> 6b54dc2b5c72e9efcc138fb2c76f3b34dce5d2dd
