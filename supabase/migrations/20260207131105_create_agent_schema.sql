-- Oddly Enough Agent Pipeline Schema
-- Core articles table (what the app reads)
CREATE TABLE IF NOT EXISTS articles (
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

-- Index for app queries: latest articles, category filtering
CREATE INDEX idx_articles_published_at ON articles (published_at DESC);
CREATE INDEX idx_articles_category ON articles (category);
CREATE INDEX idx_articles_source_url ON articles (source_url);

-- Draft pipeline (Scout → Quill → Editor)
CREATE TABLE IF NOT EXISTS article_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT,
  raw_content TEXT,
  summary TEXT,
  category TEXT,
  image_url TEXT,
  weirdness_score INT,
  status TEXT DEFAULT 'found',  -- found → summarising → ready → published / rejected
  reject_reason TEXT,
  found_by TEXT DEFAULT 'scout',
  claimed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for agent queries: claim next draft, check duplicates
CREATE INDEX idx_drafts_status ON article_drafts (status);
CREATE INDEX idx_drafts_source_url ON article_drafts (source_url);
CREATE INDEX idx_drafts_created_at ON article_drafts (created_at DESC);
CREATE INDEX idx_drafts_status_updated ON article_drafts (status, updated_at);

-- Event log (drives triggers + agent reactions)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,       -- article:found, article:ready, article:published, etc.
  source TEXT,              -- scout, quill, editor
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events (type);
CREATE INDEX idx_events_created_at ON events (created_at DESC);

-- Agent activity log (observability)
CREATE TABLE IF NOT EXISTS agent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT NOT NULL,      -- scout, quill, editor
  action TEXT NOT NULL,     -- search, claim, summarise, publish, reject, etc.
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_log_agent ON agent_log (agent);
CREATE INDEX idx_agent_log_created_at ON agent_log (created_at DESC);

-- Add constraint to article_drafts status for safety
ALTER TABLE article_drafts
  ADD CONSTRAINT chk_draft_status
  CHECK (status IN ('found', 'summarising', 'ready', 'published', 'rejected'));

-- Self-healing: function to reset stuck drafts (status = 'summarising' for > 30 min)
CREATE OR REPLACE FUNCTION reset_stuck_drafts()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  UPDATE article_drafts
  SET status = 'found',
      claimed_by = NULL,
      updated_at = NOW()
  WHERE status = 'summarising'
    AND updated_at < NOW() - INTERVAL '30 minutes';

  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$;

-- Row-Level Security (enable but allow service key full access)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_log ENABLE ROW LEVEL SECURITY;

-- Service role policies (agents use service key)
CREATE POLICY "Service role full access" ON articles
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON article_drafts
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON events
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON agent_log
  FOR ALL USING (auth.role() = 'service_role');

-- Anon read access for articles (app reads via public API)
CREATE POLICY "Public read articles" ON articles
  FOR SELECT USING (true);

-- Keep-alive: a simple function the cron can call to prevent free-tier pause
CREATE OR REPLACE FUNCTION keepalive()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT 'alive'::TEXT;
$$;
