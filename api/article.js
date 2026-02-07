// Oddly Enough API - /api/article?id=UUID or /api/article?url=SOURCE_URL
// Returns a single article by ID or source URL for deep linking / share pages
// Fetches a content snippet from the original source for the share page

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wzvvfsuumtmewrogiqed.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

// Extract readable text from an HTML page (first ~500 words of article body)
async function fetchArticleContent(url) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000); // 5s timeout

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OddlyEnoughBot/1.0)',
        'Accept': 'text/html',
      },
    });
    if (!resp.ok) return null;
    
    const html = await resp.text();
    
    // Try to extract article body text
    // Remove scripts, styles, nav, header, footer, aside
    let clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '')
      .replace(/<figure[\s\S]*?<\/figure>/gi, '');
    
    // Try to find article/main content
    let articleMatch = clean.match(/<article[\s\S]*?<\/article>/i)
      || clean.match(/<main[\s\S]*?<\/main>/i)
      || clean.match(/<div[^>]*class="[^"]*(?:entry-content|post-content|article-body|story-body|article-text|content-body)[^"]*"[\s\S]*?<\/div>/i);
    
    let text = articleMatch ? articleMatch[0] : clean;
    
    // Extract paragraphs
    const paragraphs = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match;
    while ((match = pRegex.exec(text)) !== null) {
      // Strip remaining HTML tags
      const p = match[1].replace(/<[^>]+>/g, '').trim();
      // Skip very short paragraphs (ads, captions, etc.)
      if (p.length > 40) {
        paragraphs.push(p);
      }
    }
    
    if (paragraphs.length === 0) return null;
    
    // Take first ~500 words worth of paragraphs
    let wordCount = 0;
    const selected = [];
    for (const p of paragraphs) {
      selected.push(p);
      wordCount += p.split(/\s+/).length;
      if (wordCount > 500) break;
    }
    
    return selected.join('\n\n');
  } catch (e) {
    console.log('[article] Content fetch failed:', e.message);
    return null;
  }
}

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
    
    // Fetch full content from source (non-blocking — return partial if it times out)
    const fullContent = await fetchArticleContent(a.source_url);
    
    return res.status(200).json({
      article: {
        id: a.id,
        title: a.title,
        summary: a.summary,
        fullContent: fullContent || null,
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
