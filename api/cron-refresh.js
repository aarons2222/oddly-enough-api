// Vercel Cron Job - Pre-warms the article cache every 15 minutes
// This prevents cold cache misses that cause timeouts for users

async function handler(req, res) {
  const start = Date.now();
  
  // Verify this is a cron request (Vercel adds this header)
  // Also allow manual triggers for testing
  const isCron = req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query.manual === 'true';
  
  if (!isCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Hit our own articles endpoint to warm the cache
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://oddly-enough-api.vercel.app';
    
    console.log(`[cron-refresh] Warming cache at ${new Date().toISOString()}`);
    
    const response = await fetch(`${baseUrl}/api/articles?refresh=true`, {
      headers: { 'User-Agent': 'OddlyEnough-CronRefresh/1.0' },
    });
    
    const data = await response.json();
    const elapsed = Date.now() - start;
    
    console.log(`[cron-refresh] Done in ${elapsed}ms - ${data.articles?.length || 0} articles`);
    
    return res.status(200).json({
      success: true,
      articles: data.articles?.length || 0,
      cached: data.cached,
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const elapsed = Date.now() - start;
    console.error(`[cron-refresh] Failed after ${elapsed}ms:`, error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      elapsed: `${elapsed}ms`,
    });
  }
}

module.exports = handler;
module.exports.default = handler;
