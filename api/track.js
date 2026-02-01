// Track article views and reactions
// POST /api/track
// Body: { articleId, event: 'view' | 'reaction', reaction?: '🤯' | '😂' | '🤮' }

const Redis = require('ioredis');

// Lazy connection - reuse across invocations
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
    
    const client = getRedis();
    const key = `stats:${articleId}`;
    
    // Get current stats or initialize
    const raw = await client.get(key);
    let stats = raw ? JSON.parse(raw) : {
      views: 0,
      reactions: { '🤯': 0, '😂': 0, '🤮': 0 },
    };
    
    if (event === 'view') {
      stats.views++;
    } else if (event === 'reaction' && reaction) {
      if (['🤯', '😂', '🤮'].includes(reaction)) {
        stats.reactions[reaction]++;
      }
    }
    
    stats.lastUpdated = new Date().toISOString();
    
    // Save to Redis
    await client.set(key, JSON.stringify(stats));
    
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
