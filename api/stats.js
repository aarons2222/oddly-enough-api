// Get stats for articles
// GET /api/stats?ids=id1,id2,id3

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ error: 'Missing ids parameter' });
    }
    
    const client = getRedis();
    const articleIds = ids.split(',').map(id => id.trim()).filter(Boolean);
    
    // Fetch all stats in parallel
    const keys = articleIds.map(id => `stats:${id}`);
    const values = await client.mget(...keys);
    
    const result = {};
    articleIds.forEach((id, i) => {
      const raw = values[i];
      result[id] = raw ? JSON.parse(raw) : {
        views: 0,
        reactions: { '🤯': 0, '😂': 0, '🤮': 0 },
      };
    });
    
    return res.status(200).json({ stats: result });
    
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

module.exports = handler;
module.exports.default = handler;
