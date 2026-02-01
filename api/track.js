// Track article views and reactions
// POST /api/track
// Body: { articleId, event: 'view' | 'reaction', reaction?: '🤯' | '😂' | '🤮' }

const { Redis } = require('@upstash/redis');

// Initialize Redis (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { articleId, event, reaction } = req.body || {};
    
    if (!articleId || !event) {
      return res.status(400).json({ error: 'Missing articleId or event' });
    }
    
    const key = `stats:${articleId}`;
    
    // Get current stats or initialize
    let stats = await redis.get(key);
    if (!stats) {
      stats = {
        views: 0,
        reactions: { '🤯': 0, '😂': 0, '🤮': 0 },
      };
    }
    
    if (event === 'view') {
      stats.views++;
    } else if (event === 'reaction' && reaction) {
      if (['🤯', '😂', '🤮'].includes(reaction)) {
        stats.reactions[reaction]++;
      }
    }
    
    stats.lastUpdated = new Date().toISOString();
    
    // Save to Redis
    await redis.set(key, stats);
    
    return res.status(200).json({ 
      success: true, 
      stats,
    });
    
  } catch (error) {
    console.error('Track error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

module.exports = handler;
module.exports.default = handler;
