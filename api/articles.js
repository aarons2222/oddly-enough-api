// Oddly Enough API - /api/articles
// Fetches and filters odd/weird news from RSS feeds

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Simple delay helper
const delay = ms => new Promise(r => setTimeout(r, ms));

// Enhance summary with Groq LLM - DISABLED for speed (was causing 30s+ load times)
async function enhanceSummary(title, summary, source, retries = 2) {
  // Skip LLM enhancement for now - too slow
  if (summary && summary.length > 20) {
    return summary.slice(0, 150) + (summary.length > 150 ? '...' : '');
  }
  return `${title.slice(0, 100)}${title.length > 100 ? '...' : ''}`;
  
  /* DISABLED - Groq calls were causing 30s+ load times
  if (!GROQ_API_KEY) return summary || `${title.slice(0, 100)}...`;
  
  // Use title if summary is missing or is a generic placeholder
  const genericPatterns = ['Tap to read', 'unusual story', 'wild Florida Man', 'sounds like satire', 'From r/'];
  const isGeneric = !summary || summary.length < 15 || genericPatterns.some(p => summary.includes(p));
  const inputText = isGeneric ? title : summary;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) await delay(500 * attempt); // Backoff on retry
      
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
            content: `Write a punchy, engaging one-liner summary for this weird news story. Rules:
- Max 120 characters
- No quotes around the text  
- No clickbait ("you won't believe", "shocking")
- Be witty but clear
- Start with the interesting part

Title: ${title}
Context: ${inputText}

Summary:`
          }],
          max_tokens: 80,
          temperature: 0.7,
        }),
      });
      
      if (response.status === 429) {
        console.log('Groq rate limited, retrying...');
        continue; // Retry on rate limit
      }
      
      if (!response.ok) {
        console.error('Groq API error:', response.status);
        continue;
      }
      
      const data = await response.json();
      const enhanced = data.choices?.[0]?.message?.content?.trim();
      
      // Return enhanced if valid
      if (enhanced && enhanced.length > 10 && enhanced.length < 180) {
        return enhanced.replace(/^["'"]+|["'"]+$/g, '').trim();
      }
    } catch (e) {
      console.error('Groq enhancement failed:', e.message);
    }
  }
  
  // All retries failed - generate a simple summary from title
  return `${title.slice(0, 100)}${title.length > 100 ? '...' : ''}`;
  */
}

// REDUCED feed list for faster loading (Vercel has 10s timeout)
const RSS_FEEDS = [
  // Reddit - best source, usually fast
  { url: 'https://old.reddit.com/r/nottheonion/.rss', category: 'viral', source: 'r/nottheonion', alwaysOdd: true },
  { url: 'https://old.reddit.com/r/offbeat/.rss', category: 'viral', source: 'r/offbeat', alwaysOdd: true },
  
  // Fast UK tabloid feeds with images
  { url: 'https://www.mirror.co.uk/news/weird-news/rss.xml', category: 'viral', source: 'Mirror Weird', alwaysOdd: true },
  { url: 'https://www.dailystar.co.uk/news/weird-news/rss.xml', category: 'viral', source: 'Daily Star', alwaysOdd: true },
  
  // UPI Odd - reliable and fast
  { url: 'https://rss.upi.com/news/odd_news.rss', category: 'viral', source: 'UPI Odd', alwaysOdd: true },
  
  // The Register - tech weirdness
  { url: 'https://www.theregister.com/offbeat/headlines.atom', category: 'tech', source: 'The Register', alwaysOdd: true },
];

// Curated articles (guaranteed odd)
// Curated articles removed - now using only fresh RSS content
const CURATED_ARTICLES = [];

// Strict odd news patterns
const ODD_PATTERNS = [
  /\b(seal|raccoon|snake|donkey|capybara|kangaroo|dog|cat|parrot|squirrel|fox|deer|bear|monkey|elephant)\b.*\b(found|escaped|rescue|viral|spotted|caught|stowaway|loose|wander)/i,
  /\b(world record|guinness|youngest|oldest|largest|smallest|longest|fastest|first ever)\b/i,
  /\b(viral|goes viral|meme|tiktok|reddit)\b.*\b(video|photo|post)/i,
  /\b(hilarious|bizarre|weird|strange|unusual|oddly|quirky)\b/i,
  /\b(lottery|jackpot|win|winner)\b.*\b(million|fortune)/i,
  /\b(fail|glitch|mistake|error)\b.*\b(ai|chatbot|robot)/i,
  /\b(ai|chatbot|robot)\b.*\b(fail|wrong|bizarre|funny)/i,
];

// Patterns to detect "fails" category
const FAIL_PATTERNS = [
  /\b(fail|fails|failed|failing|epic fail)\b/i,
  /\b(mistake|blunder|oops|disaster|backfire|backfired)\b/i,
  /\b(embarrassing|humiliating|cringe|awkward)\b/i,
  /\b(wrong|badly wrong|goes wrong|went wrong)\b/i,
];

// Patterns to detect "british" category
const BRITISH_PATTERNS = [
  /\b(uk|britain|british|england|english|wales|welsh|scotland|scottish)\b/i,
  /\b(london|manchester|birmingham|liverpool|leeds|bristol|cornwall|devon)\b/i,
  /\b(pub|chippy|greggs|wetherspoons|tesco|asda|lidl|aldi)\b/i,
  /\b(nhs|bbc|council|high street|queue|queueing)\b/i,
];

// Patterns to detect "mystery" category  
const MYSTERY_PATTERNS = [
  /\b(mystery|mysterious|unexplained|unknown|unsolved)\b/i,
  /\b(ufo|alien|paranormal|ghost|haunted|supernatural)\b/i,
  /\b(bizarre|baffled|puzzled|strange|eerie|creepy)\b/i,
  /\b(disappeared|vanished|discovered|found.*strange)\b/i,
];

function isFail(title, description) {
  const text = `${title} ${description}`;
  return FAIL_PATTERNS.some(p => p.test(text));
}

function isBritish(title, description) {
  const text = `${title} ${description}`;
  return BRITISH_PATTERNS.some(p => p.test(text));
}

function isMystery(title, description) {
  const text = `${title} ${description}`;
  return MYSTERY_PATTERNS.some(p => p.test(text));
}

const BORING_PATTERNS = [
  /\b(killed|murdered|dead|death|died|fatal|war|conflict|attack|terror)\b/i,
  /\b(government|minister|parliament|election|vote|policy|budget)\b/i,
  /\b(stock|market|economy|inflation|recession)\b/i,
  /\b(match|score|defeat|victory|league|championship)\b(?!.*record|bizarre)/i,
];

function isOddNews(title, description) {
  const text = `${title} ${description}`;
  if (BORING_PATTERNS.some(p => p.test(text))) return false;
  return ODD_PATTERNS.some(p => p.test(text));
}

// Filter out non-English content
function isEnglish(title) {
  if (!title) return false;
  // Reject if contains non-Latin scripts (Cyrillic, Chinese, Arabic, etc.)
  if (/[\u0400-\u04FF\u4E00-\u9FFF\u0600-\u06FF\u3040-\u30FF\uAC00-\uD7AF]/.test(title)) return false;
  // Reject common non-English patterns
  if (/\b(der|die|das|und|für|avec|dans|pour|está|tiene|sobre)\b/i.test(title)) return false;
  // Must have some English articles/words
  if (!/\b(the|a|an|is|are|was|were|has|have|in|on|at|to|for|of|and|or|but|with)\b/i.test(title)) return false;
  return true;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : null;
}

function extractAttr(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#32;/g, ' ')
    .replace(/&#91;/g, '[')
    .replace(/&#93;/g, ']')
    // Smart quotes and other special chars
    .replace(/[\u2018\u2019]/g, "'")  // curly single quotes
    .replace(/[\u201C\u201D]/g, '"')  // curly double quotes
    .replace(/\u2014/g, '—')  // em dash
    .replace(/\u2013/g, '–')  // en dash
    .replace(/\u2026/g, '...')  // ellipsis
    // Decode numeric entities
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return new Date().toISOString();
}

async function fetchRSS(feedUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout per feed
  
  try {
    const response = await fetch(feedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; OddlyEnough/1.0; +https://oddlyenough.app)',
        'Accept': 'application/rss+xml,application/xml,text/xml,*/*',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await response.text();
    
    const items = [];
    const itemMatches = text.match(/<item>[\s\S]*?<\/item>/g) || 
                        text.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    
    for (const itemXml of itemMatches.slice(0, 15)) {
      const title = extractTag(itemXml, 'title');
      const content = extractTag(itemXml, 'content') || '';
      const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'summary') || content;
      
      // Try multiple ways to get the link (RSS vs Atom differences)
      let link = extractTag(itemXml, 'link');
      if (!link || link.length < 5) {
        // Atom format: <link href="..."/> - get first non-rel link
        const linkMatch = itemXml.match(/<link(?![^>]*rel=)[^>]*href="([^"]+)"/);
        link = linkMatch ? linkMatch[1] : extractAttr(itemXml, 'link', 'href');
      }
      
      // For Reddit: extract actual article link from content (not comments page)
      if (link && link.includes('reddit.com') && content) {
        // Decode HTML entities first
        const decoded = content
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
          .replace(/&#91;/g, '[').replace(/&#93;/g, ']');
        // Reddit format: <span><a href="actual-url">[link]</a></span>
        const articleMatch = decoded.match(/href="([^"]+)"[^>]*>\s*\[link\]/i);
        if (articleMatch && articleMatch[1] && !articleMatch[1].includes('reddit.com')) {
          link = articleMatch[1];
        }
      }
      
      const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published') || extractTag(itemXml, 'updated');
      const thumbnail = extractAttr(itemXml, 'media:thumbnail', 'url');
      
      if (title && link) {
        // Skip Reddit-hosted media (not real articles)
        const cleanedLink = link.split('?at_medium=')[0].trim();
        const isRedditMedia = /^https?:\/\/(i\.redd\.it|v\.redd\.it|preview\.redd\.it|old\.reddit\.com|www\.reddit\.com)/i.test(cleanedLink);
        
        // For Reddit sources, only include if it links to external articles
        const isRedditSource = feedUrl.includes('reddit.com');
        if (isRedditSource && isRedditMedia) {
          continue; // Skip reddit-hosted content
        }
        
        items.push({
          title: cleanText(title),
          description: cleanText(description || ''),
          link: cleanedLink,
          pubDate: parseDate(pubDate),
          thumbnail: thumbnail ? thumbnail.replace(/&amp;/g, '&') : null,
        });
      }
    }
    return items;
  } catch (error) {
    clearTimeout(timeout);
    console.error(`RSS fetch error for ${feedUrl}:`, error.message);
    return [];
  }
}

// Default images for sources without thumbnails
const DEFAULT_IMAGES = {
  'The Register': 'https://www.theregister.com/design_picker/621fa76b064a476dc713ebf25bbf16451c706c03/graphics/icons/reg_logo_og_image_1200x630.jpg',
};

// Weird placeholder messages
const WEIRD_PLACEHOLDERS = [
  '👽+Image+Abducted',
  '🔮+No+Image+Found',
  '🛸+UFO+Took+This',
  '👀+Nothing+To+See',
  '🌀+Image+Lost+In+Void',
  '🎭+Mystery+Image',
  '🦑+Kraken+Ate+It',
  '👻+Ghost+Image',
  '🌈+Imagine+Something',
  '🐙+Tentacles+Only',
  '💀+RIP+Image',
  '🤖+Beep+Boop+No+Pic',
];

// Generate a funky placeholder image URL for articles without images
function getPlaceholderImage(title, source) {
  const colors = GRADIENT_COLORS[Math.abs(hashCode(title)) % GRADIENT_COLORS.length];
  const weirdText = WEIRD_PLACEHOLDERS[Math.abs(hashCode(title)) % WEIRD_PLACEHOLDERS.length];
  return `https://dummyimage.com/800x450/${colors[0]}/${colors[1]}.png&text=${weirdText}`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Vibrant color pairs for gradient placeholders
const GRADIENT_COLORS = [
  ['FF6B6B', '4ECDC4'], // coral to teal
  ['A8E6CF', 'FFD93D'], // mint to yellow
  ['6C5CE7', 'A29BFE'], // purple gradient
  ['FD79A8', 'FDCB6E'], // pink to gold
  ['00B894', '00CEC9'], // green to cyan
  ['E17055', 'FDCB6E'], // orange to yellow
  ['0984E3', '74B9FF'], // blue gradient
  ['E84393', 'FD79A8'], // magenta to pink
  ['00B5AD', '21D4FD'], // teal to sky
  ['F8B500', 'FF6F61'], // gold to coral
  ['7F00FF', 'E100FF'], // violet to magenta
  ['11998E', '38EF7D'], // emerald gradient
];

// Generate a colorful placeholder based on article title hash
function generatePlaceholder(title) {
  // Simple hash from title
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % GRADIENT_COLORS.length;
  const [color1, color2] = GRADIENT_COLORS[index];
  
  // Use placeholder.com gradient
  return `https://placehold.co/800x600/${color1}/${color2}?text=`;
}

async function fetchOgImage(url, source) {
  // Use source default if available
  if (source && DEFAULT_IMAGES[source]) {
    return DEFAULT_IMAGES[source];
  }
  
  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; OddlyEnough/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });
    const html = await response.text();
    const match = html.match(/property="og:image"\s+content="([^"]+)"/i) ||
                  html.match(/content="([^"]+)"\s+property="og:image"/i) ||
                  html.match(/name="twitter:image"\s+content="([^"]+)"/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Fetch og:description from article URL with timeout
async function fetchOgDescription(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  
  try {
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const html = await response.text();
    const match = html.match(/property="og:description"\s+content="([^"]+)"/i) ||
                  html.match(/content="([^"]+)"\s+property="og:description"/i) ||
                  html.match(/name="description"\s+content="([^"]+)"/i) ||
                  html.match(/content="([^"]+)"\s+name="description"/i);
    if (match && match[1]) {
      // Clean and truncate
      let desc = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      return desc.slice(0, 200) + (desc.length > 200 ? '...' : '');
    }
    return null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// Generate a fallback summary from title
function generateFallbackSummary(title, source) {
  // Just indicate where the story is from
  return `Read the full story from ${source.replace('r/', '')}...`;
}

// Validate image URL exists (HEAD request)
async function validateImage(url) {
  if (!url) return false;
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'OddlyEnough/1.0' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Get best image URL for BBC - just keep original, it's the most reliable
function fixBbcImage(url) {
  return url;
}

// Fix Mirror/Daily Star thumbnail URLs to get higher resolution
function fixMirrorImage(url) {
  if (!url) return url;
  // Replace s98 (98px) with s615 (615px) for better quality
  return url.replace('/ALTERNATES/s98/', '/ALTERNATES/s615/');
}

// In-memory cache
let cachedArticles = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (was 5 min, caused too many slow refreshes)

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { category = 'all', refresh } = req.query;
  const now = Date.now();
  
  // Return cached if fresh
  if (!refresh && cachedArticles && (now - cacheTime) < CACHE_TTL) {
    const filtered = category === 'all' 
      ? cachedArticles 
      : cachedArticles.filter(a => a.category === category);
    return res.status(200).json({ articles: filtered, cached: true });
  }
  
  // Start with curated articles - also enhance their summaries for consistency
  const curatedPromises = CURATED_ARTICLES.map(async (article) => {
    const enhancedSummary = await enhanceSummary(article.title, article.summary, article.source);
    return { ...article, summary: enhancedSummary };
  });
  let articles = await Promise.all(curatedPromises);
  
  // Fetch from RSS feeds
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    const items = await fetchRSS(feed.url);
    // Filter for odd news and English only
    const filtered = (feed.alwaysOdd 
      ? items.slice(0, 12)
      : items.filter(item => isOddNews(item.title, item.description))
    ).filter(item => isEnglish(item.title)).slice(0, 8);
    
    // Process items and fetch og:images for Reddit if needed
    const articlePromises = filtered.map(async (item, i) => {
      let imageUrl = item.thumbnail;
      
      // For sources without thumbnail, use default image (skip slow og:image fetch)
      if (!imageUrl && DEFAULT_IMAGES[feed.source]) {
        imageUrl = DEFAULT_IMAGES[feed.source];
      }
      // Skip articles without images (fetching og:image was too slow)
      
      // Fix BBC image URLs
      if (feed.source.includes('BBC') && imageUrl) {
        imageUrl = fixBbcImage(imageUrl);
      }
      // Fix Mirror/Daily Star low-res thumbnails
      if ((feed.source.includes('Mirror') || feed.source.includes('Daily Star')) && imageUrl) {
        imageUrl = fixMirrorImage(imageUrl);
      }
      // Strip HTML and clean summary
      let summary = item.description
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/\s+/g, ' ')
        // Remove common cruft
        .replace(/^(Image|Photo|Video|Picture)\s*:/i, '')
        .replace(/\(Image:\s*[^)]+\)/gi, '')
        .replace(/\(Photo:\s*[^)]+\)/gi, '')
        .replace(/Credit:\s*[^\s]+/gi, '')
        .replace(/Getty Images?/gi, '')
        .replace(/PA Media/gi, '')
        .replace(/Reuters/gi, '')
        .replace(/Read more:.*$/i, '')
        .replace(/Click here.*$/i, '')
        .replace(/Continue reading.*$/i, '')
        .replace(/\[.*?\]/g, '') // Remove [anything in brackets]
        .replace(/Updated\s+\d+[:\d]*\s*(am|pm)?/gi, '')
        .replace(/Published\s+\d+[:\d]*\s*(am|pm)?/gi, '')
        .replace(/\d{1,2}:\d{2}\s*(am|pm)/gi, '') // Remove times
        .replace(/^\s*[-–—]\s*/, '') // Remove leading dashes
        .replace(/\s+/g, ' ')
        .trim();
      
      // Clean up Reddit boilerplate (submitted by /u/... [link] [comments])
      if (feed.source.startsWith('r/')) {
        summary = summary
          .replace(/submitted by\s+\/u\/\w+/gi, '')
          .replace(/\[link\]/gi, '')
          .replace(/\[comments\]/gi, '')
          .replace(/&#32;/g, '')
          .trim();
        // Reddit posts rarely have useful summaries - use fallback
        if (!summary || summary.length < 20) {
          // Generate a contextual fallback based on subreddit
          const subreddit = feed.source.replace('r/', '');
          if (subreddit === 'FloridaMan') {
            summary = 'Another wild Florida Man story. Tap to read the full article...';
          } else if (subreddit === 'nottheonion') {
            summary = 'A real headline that sounds like satire. Tap to read more...';
          } else if (subreddit === 'offbeat') {
            summary = 'An unusual story from around the web. Tap to read the full article...';
          } else {
            summary = `From r/${subreddit}. Tap to read the full story...`;
          }
        }
      }
      
      summary = summary.slice(0, 200) + (summary.length > 200 ? '...' : '');
      
      // Detect special categories based on content
      let articleCategory = feed.category;
      if (isFail(item.title, summary)) {
        articleCategory = 'fails';
      } else if (isMystery(item.title, summary)) {
        articleCategory = 'mystery';
      } else if (isBritish(item.title, summary)) {
        articleCategory = 'british';
      }
      
      // Skip articles without images
      if (!imageUrl) {
        return null;
      }
      
      // Clean title - remove source suffixes
      let cleanTitle = item.title
        .replace(/\s*[-–|]\s*(BBC News?|Mirror|Daily Star|UPI|The Register|Sky News|Independent|NDTV).*$/i, '')
        .replace(/\s*\|\s*.*$/, '') // Remove anything after |
        .replace(/\s*[-–]\s*[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*$/, '') // Remove "- Source Name" at end
        .trim();
      
      // Enhance summary with Groq LLM (if available)
      const enhancedSummary = await enhanceSummary(cleanTitle, summary, feed.source);
      
      return {
        id: `${feed.source.replace(/\s/g, '-')}-${now}-${i}`,
        title: cleanTitle,
        summary: enhancedSummary,
        url: item.link,
        imageUrl,
        source: feed.source,
        category: articleCategory,
        publishedAt: item.pubDate,
      };
    });
    
    // Wait for all article og:image fetches to complete, filter out nulls
    const results = await Promise.all(articlePromises);
    return results.filter(a => a !== null);
  });
  
  const feedResults = await Promise.all(feedPromises);
  feedResults.forEach(items => articles.push(...items));
  
  // Dedupe by URL
  const seenUrls = new Set();
  articles = articles.filter(a => {
    // Normalize URL (remove tracking params, www, trailing slash)
    const normalizedUrl = a.url
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')
      .split('?')[0];
    
    if (seenUrls.has(normalizedUrl)) return false;
    seenUrls.add(normalizedUrl);
    return true;
  });
  
  // Dedupe by similar titles (fuzzy match)
  const seenTitles = new Set();
  articles = articles.filter(a => {
    // Normalize title for comparison
    const normalizedTitle = a.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 50); // First 50 chars
    
    if (seenTitles.has(normalizedTitle)) return false;
    seenTitles.add(normalizedTitle);
    return true;
  });
  
  // Dedupe images
  const seenImages = new Set();
  articles.forEach(a => {
    if (a.imageUrl && seenImages.has(a.imageUrl)) {
      a.imageUrl = null;
    } else if (a.imageUrl) {
      seenImages.add(a.imageUrl);
    }
  });
  
  // DISABLED - og:image fetching was too slow
  // Just filter out articles without images instead
  articles = articles.filter(a => a.imageUrl);
  
  // Separate curated and RSS articles
  const curatedIds = CURATED_ARTICLES.map(a => a.id);
  const curated = articles.filter(a => curatedIds.includes(a.id));
  const rss = articles.filter(a => !curatedIds.includes(a.id));
  
  // Sort RSS by date
  rss.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  // Mix: all curated + top RSS (curated first, then recent RSS)
  const mixed = [...curated, ...rss.slice(0, 30 - curated.length)];
  
  // Shuffle slightly to mix curated into the feed
  mixed.sort(() => Math.random() - 0.5);
  
  // Cache results
  cachedArticles = mixed;
  cacheTime = now;
  
  const filtered = category === 'all' 
    ? cachedArticles 
    : cachedArticles.filter(a => a.category === category);
  
  return res.status(200).json({ 
    articles: filtered, 
    cached: false,
    total: cachedArticles.length,
    fetchedAt: new Date().toISOString(),
  });
}


module.exports = handler;
module.exports.default = handler;
