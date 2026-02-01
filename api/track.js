// Track article views and reactions
// POST /api/track
// Body: { articleId, event: 'view' | 'reaction', reaction?: '🤯' | '😂' | '🤮' }

// In-memory storage (fallback - resets on cold start)
// For production, connect Vercel KV: https://vercel.com/docs/storage/vercel-kv
const stats = global._oddlyStats || (global._oddlyStats = {});

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
    
    // Initialize article stats if needed
    if (!stats[articleId]) {
      stats[articleId] = {
        views: 0,
        reactions: { '🤯': 0, '😂': 0, '🤮': 0 },
        lastUpdated: null,
      };
    }
    
    const articleStats = stats[articleId];
    
    if (event === 'view') {
      articleStats.views++;
    } else if (event === 'reaction' && reaction) {
      // Validate reaction emoji
      if (['🤯', '😂', '🤮'].includes(reaction)) {
        articleStats.reactions[reaction]++;
      }
    }
    
    articleStats.lastUpdated = new Date().toISOString();
    
    return res.status(200).json({ 
      success: true, 
      stats: articleStats,
    });
    
  } catch (error) {
    console.error('Track error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
module.exports.default = handler;
