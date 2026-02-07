// Fetch and parse article content from source URL
// Uses Groq LLM to clean and rewrite content for consistency
// Caches rewritten content in Redis (7 days) to avoid repeated API calls

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const Redis = require('ioredis');

// Lazy Redis connection - reuse across invocations
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

const CACHE_TTL = 86400 * 7; // 7 days

// Rewrite article content with Groq for clean, consistent formatting
async function rewriteContent(rawContent, title) {
  if (!GROQ_API_KEY || !rawContent || rawContent.length < 100) {
    return rawContent;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `Rewrite this news article to be clean, well-formatted, and engaging. Rules:
- Fix any broken sentences (missing words at start, orphaned punctuation)
- Remove any metadata cruft (bylines, timestamps, image credits)
- Keep the same facts and information
- Use clear paragraph breaks
- Make it flow naturally
- Keep similar length to original
- Start sentences properly (no orphaned "'s" or ",")
- Do NOT add any commentary or introduction

Article title: ${title || 'News Article'}

Raw content:
${rawContent.slice(0, 3000)}

Rewritten article:`
        }],
        max_tokens: 1500,
        temperature: 0.3, // Lower temp for more consistent rewrites
      }),
    });

    if (!response.ok) {
      console.error('Groq content rewrite failed:', response.status);
      return rawContent;
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (rewritten && rewritten.length > 100) {
      return rewritten;
    }
    return rawContent;
  } catch (e) {
    console.error('Groq rewrite error:', e.message);
    return rawContent;
  }
}

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, title } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  const cacheKey = `content:${url}`;
  
  try {
    // Check cache first
    const r = getRedis();
    const cached = await r.get(cacheKey);
    if (cached) {
      return res.status(200).json({ 
        content: cached,
        url,
        cached: true,
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const html = await response.text();
    
    // Extract article content
    const rawContent = extractContent(html);
    
    // Rewrite with Groq for clean formatting
    const content = await rewriteContent(rawContent, title);
    
    // Cache the rewritten content
    await r.set(cacheKey, content, 'EX', CACHE_TTL);
    
    return res.status(200).json({ 
      content,
      url,
      cached: false,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function extractContent(html) {
  // Remove scripts, styles, and other non-content elements
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove byline/author elements
    .replace(/<div[^>]*class="[^"]*byline[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*author[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<span[^>]*class="[^"]*byline[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<time[^>]*>[\s\S]*?<\/time>/gi, '')
    // Remove figure captions
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, '')
    // Remove image credit lines
    .replace(/<div[^>]*class="[^"]*image-credit[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<span[^>]*class="[^"]*credit[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');

  // Try to find article body — check multiple patterns (most specific first)
  let articleContent = '';
  
  const contentSelectors = [
    // Specific article body classes
    /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*story-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*body-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    // Broader article tag
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    // WordPress/CMS patterns
    /<div[^>]*class="[^"]*content-area[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*single-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    // Catch-all content div
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];
  
  for (const selector of contentSelectors) {
    const match = text.match(selector);
    if (match && match[1]) {
      // Check it has actual paragraph content
      const paraCount = (match[1].match(/<p[\s>]/gi) || []).length;
      if (paraCount >= 2) {
        articleContent = match[1];
        break;
      }
    }
  }

  // Fallback: extract ALL paragraphs from the page
  if (!articleContent) {
    articleContent = text;
  }

  // Extract paragraphs
  const paragraphs = [];
  const pMatches = articleContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  
  for (const match of pMatches) {
    let para = match[1]
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x22;/g, '"')
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\s+/g, ' ')
      .trim();
    
    // Clean up UI element cruft that gets mashed in
    para = para
      .replace(/^Comments/i, '')
      .replace(/View\s*\d*\s*Images?/gi, '')
      .replace(/^View\s*Image/gi, '')
      .replace(/Image\s*source[,:]\s*[^\s]*/gi, '')
      .replace(/Image\s*caption[,:]\s*/gi, '')
      .replace(/Getty\s*Images?/gi, '')
      .replace(/PA\s*Media/gi, '')
      .replace(/Reuters/gi, '')
      .replace(/\(Image:\s*[^)]*\)/gi, '')
      .replace(/\(Photo:\s*[^)]*\)/gi, '')
      .replace(/Credit:\s*[^\n]*/gi, '')
      .replace(/^\s*[,;:.]\s*/, '')
      .trim();
    
    // Filter out short/junk paragraphs
    const junkPatterns = [
      'Share', 'Cookie', 'Subscribe', 'Newsletter', 'Follow BBC', 'Follow us',
      'Listen to', 'Watch on', 'Download the', 'Get the app', 'Sign up',
      'Related internet', 'External link', 'Send your story', 'highlights from',
      'Read more:', 'See also:', 'MORE:', 'ALSO READ', 'View gallery',
      'View images', 'View image', 'Image source', 'Comments'
    ];
    const isJunk = junkPatterns.some(p => para.toLowerCase().includes(p.toLowerCase()));
    
    if (para.length > 30 && !isJunk) {
      paragraphs.push(para);
    }
  }

  // Limit to reasonable length (up to 25 paragraphs for longer articles)
  const result = paragraphs.slice(0, 25).join('\n\n');
  
  return result || 'Content not available. Tap below to read on the original source.';
}

module.exports = handler;
module.exports.default = handler;
