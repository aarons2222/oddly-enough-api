# Oddly Enough — Autonomous Agent Architecture

## Overview

Replace the current "fetch → cache → serve" pipeline with autonomous agents that find, curate, summarise, and publish weird news 24/7 without human intervention.

## Stack

| Layer | Tool | Role |
|-------|------|------|
| Brain + Execution | OpenClaw (Milo's Mac) | Agent crons, research, writing |
| Control Plane | Vercel (existing API) | Approve, monitor, serve to app |
| State | Supabase (free tier) | Articles, drafts, queue, events |
| Cache | Upstash Redis (existing) | Hot article cache for app |
| App | React Native/Expo (existing) | Consumer |

## Agents (3 roles)

### 🔍 Scout — Article Hunter
- **Job:** Find weird/quirky news from diverse sources
- **Cron:** Every 2 hours (OpenClaw isolated agentTurn)
- **Process:**
  1. Search web for weird, unusual, bizarre news
  2. Check Supabase `articles` table for duplicates (by URL/title similarity)
  3. Score each article 1-10 on "weirdness factor"
  4. Insert qualifying articles (score ≥ 6) into `article_drafts` with status `found`
  5. Emit event: `article:found`

### ✍️ Quill — Summariser
- **Job:** Write engaging, punchy summaries for found articles
- **Trigger:** `article:found` event → auto-fires
- **Process:**
  1. Claim draft with status `found` → set to `summarising`
  2. Fetch full article content
  3. Write a short, witty summary (2-3 sentences, match Oddly Enough tone)
  4. Generate category tag (Science, Crime, Florida Man, Animals, etc.)
  5. Update draft: summary, category, status → `ready`
  6. Emit event: `article:ready`

### 🛡️ Editor — Quality Gate
- **Job:** Final check before publishing
- **Trigger:** `article:ready` event → auto-fires
- **Process:**
  1. Check: Is it actually weird/interesting? (reject boring)
  2. Check: Duplicate of recent article? (reject if too similar)
  3. Check: Appropriate content? (reject offensive/graphic)
  4. Check: Daily publish quota not exceeded?
  5. If passes → status `published`, insert into `articles` table
  6. Warm Redis cache with new article batch
  7. Emit event: `article:published`

## Database Schema (Supabase)

```sql
-- Core articles table (what the app reads)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  source_name TEXT,
  category TEXT,
  image_url TEXT,
  weirdness_score INT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draft pipeline
CREATE TABLE article_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT,
  raw_content TEXT,
  summary TEXT,
  category TEXT,
  image_url TEXT,
  weirdness_score INT,
  status TEXT DEFAULT 'found', -- found → summarising → ready → published / rejected
  reject_reason TEXT,
  found_by TEXT DEFAULT 'scout',
  claimed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event log (drives triggers + reactions)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- article:found, article:ready, article:published, etc.
  source TEXT,        -- scout, quill, editor
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent activity log
CREATE TABLE agent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Cron Schedule (OpenClaw)

| Cron | Agent | Type | Schedule |
|------|-------|------|----------|
| Scout Run | Scout | isolated agentTurn | Every 2 hours |
| Quill Check | Quill | isolated agentTurn | Every 30 min |
| Editor Check | Editor | isolated agentTurn | Every 30 min |
| Cache Warmer | System | isolated agentTurn | Every 20 min (existing) |
| Stale Cleanup | System | isolated agentTurn | Daily at 03:00 |

## API Changes (Vercel)

### Existing endpoints (keep as-is)
- `GET /api/articles` — serve from Redis cache → fallback Supabase

### New endpoints
- `GET /api/articles` — now reads from Supabase `articles` table (cached in Redis)
- `GET /api/stats` — article count, agent activity, pipeline status
- `POST /api/webhook/event` — receive events from OpenClaw agents (auth'd)

### Remove
- All the source-scraping logic in the current API
- Groq LLM summary calls (agents handle this now)

## Data Flow

```
Scout (every 2h)
  │
  ├─ Searches web for weird news
  ├─ Deduplicates against existing articles
  ├─ Inserts into article_drafts (status: found)
  └─ Emits article:found event
        │
        ▼
Quill (triggered by article:found, checks every 30m)
  │
  ├─ Claims draft (status: summarising)
  ├─ Fetches full article
  ├─ Writes witty summary + categorises
  ├─ Updates draft (status: ready)
  └─ Emits article:ready event
        │
        ▼
Editor (triggered by article:ready, checks every 30m)
  │
  ├─ Quality check (weird enough? appropriate? duplicate?)
  ├─ Quota check (max 20 articles/day?)
  ├─ If pass → publish to articles table
  ├─ Warm Redis cache
  └─ Emits article:published event
        │
        ▼
App reads from Redis cache → Supabase fallback
```

## Self-Healing

- **Stuck drafts:** If status is `summarising` for >30 min → reset to `found`
- **Failed summaries:** Retry once, then mark `rejected` with reason
- **Cache stale:** If Redis empty/expired → rebuild from Supabase
- **Quota overflow:** Editor rejects at the gate (VoxYZ pattern)

## Migration Path

### Phase 1 — Supabase Setup
1. Create Supabase project (or reuse existing)
2. Run schema migrations
3. Keep-alive cron to prevent free tier pause

### Phase 2 — Scout Agent
1. Create OpenClaw cron for Scout
2. Test: articles appearing in article_drafts table
3. No app changes needed yet

### Phase 3 — Quill Agent
1. Create OpenClaw cron for Quill
2. Test: drafts getting summaries
3. Tune summary quality/tone

### Phase 4 — Editor + Publish
1. Create Editor cron
2. Update API to read from Supabase articles table
3. Update Redis cache warming
4. Test end-to-end: Scout finds → Quill writes → Editor publishes → App shows

### Phase 5 — Kill Old Pipeline
1. Remove old scraping/Groq logic from API
2. Full autonomous operation

## Cost Estimate

| Service | Tier | Cost |
|---------|------|------|
| Supabase | Free | $0 (with keep-alive ping) |
| Upstash Redis | Free | $0 (existing) |
| Vercel | Free/Hobby | $0 |
| OpenClaw agents | Sonnet | ~$2-5/day depending on volume |

**Total: ~$2-5/day** for fully autonomous weird news curation.

---

## Phase 2: Full Business Automation

### Additional Agents

### 📱 Releaser — App Store Management
- **Job:** Track app health, prepare releases, manage store presence
- **Cron:** Daily at 09:00
- **Capabilities:**
  - Monitor crash reports / reviews on App Store & Play Store
  - Flag negative reviews for attention
  - Draft release notes for new versions
  - Track version adoption rates
  - **ASO tasks** (critical — currently 0 screenshots uploaded!):
    - Generate screenshot descriptions
    - Suggest keyword optimisations
    - Title should be "Oddly Enough: Weird News" (not just "Oddly Enough")

### 📣 Promoter — Social Media & Marketing
- **Job:** Grow the audience autonomously
- **Cron:** 3x daily (09:00, 13:00, 18:00)
- **Capabilities:**
  - Pick the weirdest published article of the day
  - Draft social posts (X/Twitter, TikTok captions, Reddit posts)
  - Tone: quirky, funny, shareable — "You won't believe what happened in Florida"
  - Auto-post to X (with approval gate initially, full auto later)
  - Track engagement — which categories/headlines get most clicks
  - React to viral posts (VoxYZ trigger pattern): engagement spike → post more like it
  - Draft weekly "Top 5 Weirdest Stories" thread

### Social Channels to Build

| Platform | Strategy | Frequency |
|----------|----------|-----------|
| X/Twitter | Individual weird headlines + links | 3x/day |
| TikTok | "Weird news of the day" short clips (text-on-screen) | 1x/day |
| Reddit | Post to r/offbeat, r/nottheonion, r/weird | 2-3x/week |
| Instagram | Story cards with weird headlines | Daily |
| Newsletter | Weekly "Top 10 Weirdest" email digest | Weekly |

### 📈 Growth — Analytics & Optimisation
- **Job:** Track what's working, optimise everything
- **Cron:** Weekly (Monday 08:00)
- **Capabilities:**
  - Which categories get most reads? (adjust Scout priorities)
  - Which headlines get most clicks? (tune Quill's style)
  - App download trends
  - Social engagement metrics
  - Generate weekly growth report → send to Aaron
  - Suggest A/B tests for headlines/categories
  - Track competitor weird news apps

### Marketing Automation Flow

```
Scout finds article (weirdness: 9/10)
  │
  ▼
Quill writes summary + social-optimised headline
  │
  ▼
Editor publishes to app
  │
  ▼
Promoter (triggered by article:published, score ≥ 8)
  │
  ├─ Drafts X post: "🤯 [headline] — only on Oddly Enough"
  ├─ Drafts Reddit post for r/offbeat
  ├─ Drafts TikTok caption
  └─ Queues all with status: draft
        │
        ▼
  Auto-approve gate (or Aaron approves initially)
        │
        ▼
  Posts go live → track engagement
        │
        ▼
  Growth agent analyses weekly:
    "Florida Man stories get 3x engagement → tell Scout to find more"
```

### App Release Pipeline

```
Growth agent detects:
  - 10+ new articles/day stable ✓
  - Crash rate < 0.1% ✓
  - 5 new features since last release ✓
        │
        ▼
Releaser drafts:
  - Release notes (from git commits + feature list)
  - Screenshot suggestions
  - ASO keyword update
  - Sends to Aaron for review
        │
        ▼
Aaron approves → Releaser creates GitHub release tag
  → CI/CD handles the rest (if configured)
```

### Immediate ASO Fixes Needed (Pre-Agent)

These should happen NOW, agents or not:

1. **Screenshots** — 0 uploaded. This kills conversion rate
   - Need 6.7" (iPhone 15 Pro Max) + 5.5" (iPhone 8 Plus)
   - Show: article feed, article detail, categories, dark mode
2. **Title** — Change to "Oddly Enough: Weird News"
3. **Subtitle** — "Quirky Stories for the Wonderfully Weird"
4. **Keywords** — weird news, strange, bizarre, offbeat, unusual, funny news, florida man
5. **Description** — needs rewrite focused on benefits, not features

### Cost Estimate (Full Business)

| Agent | Model | Runs/Day | Est. Cost/Day |
|-------|-------|----------|---------------|
| Scout | Sonnet | 12 | ~$1 |
| Quill | Sonnet | ~24 articles | ~$1 |
| Editor | Sonnet | ~24 articles | ~$0.50 |
| Promoter | Sonnet | 3 | ~$0.50 |
| Growth | Sonnet | 0.14 (weekly) | ~$0.10 |
| Releaser | Sonnet | 1 | ~$0.20 |
| **Total** | | | **~$3-5/day** |

That's ~$100-150/month for a fully autonomous weird news business.

---

## Advantages Over Current System

| Current | Agent-Powered |
|---------|---------------|
| API scrapes on request (slow) | Articles pre-curated and ready |
| Groq summaries at serve time (30s+) | Summaries written ahead of time |
| Cache miss = slow load | Cache always warm |
| Single source scrape | Scout searches broadly |
| No quality control | Editor checks every article |
| Manual intervention needed | Fully autonomous |
| JSON decode errors | Structured DB, no parsing issues |
