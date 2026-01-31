// Fetch and parse article content from source URL

async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OddlyEnough/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const html = await response.text();
    
    // Extract article content
    const content = extractContent(html);
    
    return res.status(200).json({ 
      content,
      url,
      fetchedAt: new Date().toISOString(),
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
    .replace(/<!--[\s\S]*?-->/g, '');

  // Try to find article body
  let articleContent = '';
  
  // BBC pattern
  const bbcMatch = text.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (bbcMatch) {
    articleContent = bbcMatch[1];
  }
  
  // Mirror/tabloid pattern
  const articleBodyMatch = text.match(/class="article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!articleContent && articleBodyMatch) {
    articleContent = articleBodyMatch[1];
  }
  
  // Generic content patterns
  const contentMatch = text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!articleContent && contentMatch) {
    articleContent = contentMatch[1];
  }

  // Fallback to paragraphs
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
    
    // Filter out short/junk paragraphs
    const junkPatterns = [
      'Share', 'Cookie', 'Subscribe', 'Newsletter', 'Follow BBC', 'Follow us',
      'Listen to', 'Watch on', 'Download the', 'Get the app', 'Sign up',
      'Related internet', 'External link', 'Send your story', 'highlights from'
    ];
    const isJunk = junkPatterns.some(p => para.includes(p));
    
    if (para.length > 50 && !isJunk) {
      paragraphs.push(para);
    }
  }

  // Limit to reasonable length
  const result = paragraphs.slice(0, 15).join('\n\n');
  
  return result || 'Content not available. Tap below to read on the original source.';
}

module.exports = handler;
module.exports.default = handler;
