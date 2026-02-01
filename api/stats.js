// Get stats for articles
// GET /api/stats?ids=id1,id2,id3

// Shared storage with track.js
const stats = global._oddlyStats || (global._oddlyStats = {});

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
      // Return all stats (for debugging)
      return res.status(200).json({ stats });
    }
    
    const articleIds = ids.split(',').map(id => id.trim()).filter(Boolean);
    
    const result = {};
    for (const id of articleIds) {
      if (stats[id]) {
        result[id] = stats[id];
      } else {
        // Return empty stats for unknown articles
        result[id] = {
          views: 0,
          reactions: { '🤯': 0, '😂': 0, '🤮': 0 },
        };
      }
    }
    
    return res.status(200).json({ stats: result });
    
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = handler;
module.exports.default = handler;
