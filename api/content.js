// Oddly Enough API - /api/content?url=SOURCE_URL
// Fetches and extracts readable text from a source article URL
// Used by the share page to display full article content

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OddlyEnough/1.0)',
        'Accept': 'text/html',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const html = await response.text();

    // Extract article content from HTML
    const content = extractArticleContent(html);

    return res.status(200).json({ content, source: url });
  } catch (e) {
    console.error('[content] Fetch failed:', e.message);
    return res.status(200).json({ content: null, error: e.message });
  }
}

function extractArticleContent(html) {
  // Remove scripts, styles, nav, header, footer, aside
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Try to find article body
  let articleHtml = '';
  
  // Try <article> tag first
  const articleMatch = clean.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    articleHtml = articleMatch[1];
  } else {
    // Try common content selectors
    const contentPatterns = [
      /class="[^"]*article[_-]?(?:body|content|text)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /class="[^"]*(?:entry|post)[_-]?content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /class="[^"]*story[_-]?(?:body|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /id="article[_-]?body"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    for (const pat of contentPatterns) {
      const m = clean.match(pat);
      if (m) { articleHtml = m[1]; break; }
    }
  }

  if (!articleHtml) articleHtml = clean;

  // Extract text from paragraphs
  const paragraphs = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(articleHtml)) !== null) {
    // Strip remaining HTML tags
    let text = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    // Skip short junk paragraphs (ads, captions, etc.)
    if (text.length > 40 && !text.match(/^(advertisement|sponsored|subscribe|sign up|cookie|newsletter|read more|related)/i)) {
      paragraphs.push(text);
    }
  }

  // Return first ~2000 chars worth of paragraphs
  let result = '';
  for (const p of paragraphs) {
    if (result.length + p.length > 2000) break;
    result += p + '\n\n';
  }

  return result.trim() || null;
}

module.exports = handler;
module.exports.default = handler;
