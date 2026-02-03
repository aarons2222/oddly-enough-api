// Oddly Enough API - /api/article
// Get a single article by ID with full content

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Import Redis for caching
let Redis;
let redis;
try {
  Redis = require('ioredis');
} catch (e) {
  // Redis not available
}

function getRedis() {
  if (!redis && Redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

const CONTENT_CACHE_TTL = 86400 * 7; // 7 days

// Rewrite article content with Groq for clean formatting
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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return rawContent;
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (rewritten && rewritten.length > 100) {
      return rewritten;
    }
    return rawContent;
  } catch (e) {
    return rawContent;
  }
}

function extractContent(html) {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div[^>]*class="[^"]*byline[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*author[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<span[^>]*class="[^"]*byline[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<time[^>]*>[\s\S]*?<\/time>/gi, '')
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, '')
    .replace(/<div[^>]*class="[^"]*image-credit[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<span[^>]*class="[^"]*credit[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');

  let articleContent = '';
  
  const bbcMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (bbcMatch) {
    articleContent = bbcMatch[1];
  }
  
  const articleBodyMatch = text.match(/class="article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!articleContent && articleBodyMatch) {
    articleContent = articleBodyMatch[1];
  }
  
  const contentMatch = text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!articleContent && contentMatch) {
    articleContent = contentMatch[1];
  }

  if (!articleContent) {
    articleContent = text;
  }

  const paragraphs = [];
  const pMatches = articleContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  
  for (const match of pMatches) {
    let para = match[1]
      .replace(/<[^>]+>/g, '')
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
    
    para = para
      .replace(/^Comments/i, '')
      .replace(/View\s*\d+\s*Images?/gi, '')
      .replace(/^\s*[,;:.]\s*/, '')
      .trim();
    
    const junkPatterns = [
      'Share', 'Cookie', 'Subscribe', 'Newsletter', 'Follow BBC', 'Follow us',
      'Listen to', 'Watch on', 'Download the', 'Get the app', 'Sign up',
      'Related internet', 'External link', 'Send your story', 'highlights from',
      'Read more:', 'See also:', 'MORE:', 'ALSO READ', 'View gallery',
      'View images', 'Comments'
    ];
    const isJunk = junkPatterns.some(p => para.toLowerCase().includes(p.toLowerCase()));
    
    if (para.length > 40 && !isJunk) {
      paragraphs.push(para);
    }
  }

  const result = paragraphs.slice(0, 15).join('\n\n');
  
  return result || 'Content not available.';
}

async function fetchContent(url, title) {
  const cacheKey = `content:${url}`;
  
  try {
    // Check cache first
    const r = getRedis();
    if (r) {
      const cached = await r.get(cacheKey);
      if (cached) {
        return { content: cached, cached: true };
      }
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OddlyEnough/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return { content: null, cached: false };
    }

    const html = await response.text();
    const rawContent = extractContent(html);
    const content = await rewriteContent(rawContent, title);
    
    // Cache the rewritten content
    if (r) {
      await r.set(cacheKey, content, 'EX', CONTENT_CACHE_TTL);
    }
    
    return { content, cached: false };
  } catch (error) {
    return { content: null, cached: false };
  }
}

async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Article ID required' });
  }

  try {
    // First, fetch the articles list to find the article
    const articlesResponse = await fetch('https://oddly-enough-api.vercel.app/api/articles');
    const { articles } = await articlesResponse.json();
    
    const article = articles.find(a => a.id === id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Fetch full content
    const { content, cached: contentCached } = await fetchContent(article.url, article.title);
    
    return res.status(200).json({
      article: {
        ...article,
        content: content || 'Content not available. Visit the source to read the full article.',
      },
      contentCached,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = handler;
module.exports.default = handler;
