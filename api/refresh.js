// Cron endpoint to refresh cache
// Called every 30 mins by Vercel cron

async function handler(req, res) {
  // Call the articles endpoint with refresh flag
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/articles?refresh=true`);
    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      articlesRefreshed: data.total,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message,
    });
  }
}


module.exports = handler;
module.exports.default = handler;
