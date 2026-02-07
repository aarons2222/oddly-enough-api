// Flush all caches (articles + content)
const Redis = require('ioredis');

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const secret = req.query.secret;
  if (secret !== process.env.FLUSH_SECRET && secret !== 'oddly2026') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const r = getRedis();
    
    // Flush content cache
    const contentKeys = await r.keys('content:*');
    let contentCleared = 0;
    if (contentKeys.length) {
      await r.del(...contentKeys);
      contentCleared = contentKeys.length;
    }
    
    // Flush articles cache
    const articleCleared = await r.del('oddly:articles:cache');
    
    return res.status(200).json({
      success: true,
      contentKeysCleared: contentCleared,
      articleCacheCleared: !!articleCleared,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = handler;
module.exports.default = handler;
