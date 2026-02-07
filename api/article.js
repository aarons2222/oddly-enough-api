// Oddly Enough API - /api/article?id=UUID or /api/article?url=SOURCE_URL
// Returns a single article by ID or source URL for deep linking / share pages

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wzvvfsuumtmewrogiqed.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, url: sourceUrl } = req.query;

  if (!id && !sourceUrl) {
    return res.status(400).json({ error: 'Missing article id or url' });
  }

  try {
    const select = 'id,title,summary,source_url,source_name,category,image_url,weirdness_score,published_at';
    let url;
    if (id) {
      url = `${SUPABASE_URL}/rest/v1/articles?id=eq.${encodeURIComponent(id)}&select=${select}&limit=1`;
    } else {
      // Strip UTM params for matching — try exact first, fall back to LIKE base URL
      const baseUrl = sourceUrl.split('?')[0];
      url = `${SUPABASE_URL}/rest/v1/articles?or=(source_url.eq.${encodeURIComponent(sourceUrl)},source_url.like.${encodeURIComponent(baseUrl + '*')})&select=${select}&limit=1`;
    }
    
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[article] Supabase error:', response.status, errText);
      throw new Error(`Supabase fetch failed: ${response.status} - ${errText}`);
    }

    const articles = await response.json();
    
    if (!articles || articles.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const a = articles[0];
    return res.status(200).json({
      article: {
        id: a.id,
        title: a.title,
        summary: a.summary,
        content: a.summary,
        url: a.source_url,
        imageUrl: a.image_url,
        source: a.source_name || 'Oddly Enough',
        category: (a.category || 'world').toLowerCase(),
        publishedAt: a.published_at,
        weirdnessScore: a.weirdness_score,
      },
    });
  } catch (e) {
    console.error('[article] Fetch failed:', e.message);
    return res.status(500).json({ error: 'Failed to fetch article', detail: e.message });
  }
}

module.exports = handler;
module.exports.default = handler;

