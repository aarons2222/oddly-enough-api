// Cron refresh - warms Redis cache from Supabase
// Called by Vercel cron or manually

module.exports = async (req, res) => {
  try {
    // Just call our own articles endpoint with refresh=true
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://oddly-enough-api.vercel.app';
    
    const response = await fetch(`${baseUrl}/api/articles?refresh=true`);
    const data = await response.json();
    
    res.status(200).json({ 
      success: true, 
      articlesCount: data.articles?.length || 0,
      source: data.source,
    });
  } catch (e) {
    console.error('[cron-refresh] Failed:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
};
