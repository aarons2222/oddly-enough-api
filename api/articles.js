// Oddly Enough API - /api/articles
// Now powered by Supabase + Agent Pipeline (switched 2026-02-07)
// Old RSS version backed up at articles.old.js

const Redis = require('ioredis');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wzvvfsuumtmewrogiqed.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Redis cache (same as before)
let redis;
function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

const REDIS_CACHE_KEY = 'oddly:articles:cache';
const REDIS_CACHE_TTL = 60 * 60; // 1 hour

// In-memory cache for ultra-fast responses
let cachedArticles = null;
let cacheTime = 0;
const MEMORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch articles from Supabase
async function fetchFromSupabase(limit = 60) {
  const url = `${SUPABASE_URL}/rest/v1/articles?select=id,title,summary,source_url,source_name,category,image_url,weirdness_score,published_at&order=published_at.desc&limit=${limit}`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Supabase fetch failed: ${response.status}`);
  }
  
  const articles = await response.json();
  
  // Map to the format the app expects
  return articles.map(a => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    enhanced_summary: a.summary, // App may use either field
    url: a.source_url,
    link: a.source_url,
    imageUrl: a.image_url || `https://dummyimage.com/800x450/14B8A6/FFFFFF.png&text=${encodeURIComponent(a.category || 'Weird')}`,
    source: a.source_name || 'Oddly Enough',
    category: (a.category || 'world').toLowerCase(),
    publishedAt: a.published_at,
    weirdness_score: a.weirdness_score,
  }));
}

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const category = req.query?.category || 'all';
  const refresh = req.query?.refresh === 'true';
  const now = Date.now();

  const filterByCategory = (articles) => {
    if (category === 'all') return articles;
    return articles.filter(a => a.category === category);
  };

  // 1. Try in-memory cache (fastest)
  if (!refresh && cachedArticles && (now - cacheTime < MEMORY_CACHE_TTL)) {
    const filtered = filterByCategory(cachedArticles);
    return res.status(200).json({ articles: filtered, cached: true, source: 'memory' });
  }

  // 2. Try Redis cache
  if (!refresh) {
    try {
      const r = getRedis();
      const redisData = await r.get(REDIS_CACHE_KEY);
      if (redisData) {
        const parsed = JSON.parse(redisData);
        cachedArticles = parsed;
        cacheTime = now;
        const filtered = filterByCategory(parsed);
        return res.status(200).json({ articles: filtered, cached: true, source: 'redis' });
      }
    } catch (e) {
      console.error('[articles] Redis read failed:', e.message);
    }
  }

  // 3. Fetch from Supabase (source of truth)
  try {
    const articles = await fetchFromSupabase(100);
    
    // Update caches
    cachedArticles = articles;
    cacheTime = now;
    
    // Write to Redis
    try {
      const r = getRedis();
      await r.set(REDIS_CACHE_KEY, JSON.stringify(articles), 'EX', REDIS_CACHE_TTL);
    } catch (e) {
      console.error('[articles] Redis write failed:', e.message);
    }

    const filtered = filterByCategory(articles);
    return res.status(200).json({ 
      articles: filtered, 
      cached: false, 
      source: 'supabase',
      total: articles.length,
    });
  } catch (e) {
    console.error('[articles] Supabase fetch failed:', e.message);
    
    // Fallback: try Redis even on refresh failure
    try {
      const r = getRedis();
      const redisData = await r.get(REDIS_CACHE_KEY);
      if (redisData) {
        const parsed = JSON.parse(redisData);
        const filtered = filterByCategory(parsed);
        return res.status(200).json({ articles: filtered, cached: true, source: 'redis-fallback' });
      }
    } catch (e2) {
      console.error('[articles] Redis fallback also failed:', e2.message);
    }

    // Ultimate fallback
    return res.status(200).json({ 
      articles: [], 
      cached: false, 
      source: 'error',
      message: 'Articles temporarily unavailable. Please try again.',
    });
  }
}

module.exports = handler;
module.exports.default = handler;
