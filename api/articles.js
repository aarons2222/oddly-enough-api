// Oddly Enough API - /api/articles
// Fetches and filters odd/weird news from RSS feeds

const RSS_FEEDS = [
  // Reddit weird news (the best source!) - use old.reddit.com to avoid 403
  // These subreddits link to real news articles, not just reddit images
  { url: 'https://old.reddit.com/r/nottheonion/.rss', category: 'viral', source: 'r/nottheonion', alwaysOdd: true },
  { url: 'https://old.reddit.com/r/FloridaMan/.rss', category: 'viral', source: 'r/FloridaMan', alwaysOdd: true },
  { url: 'https://old.reddit.com/r/offbeat/.rss', category: 'viral', source: 'r/offbeat', alwaysOdd: true },
  
  // Dedicated weird/odd news feeds (always include - no filtering)
  { url: 'https://rss.upi.com/news/odd_news.rss', category: 'viral', source: 'UPI Odd', alwaysOdd: true },
  { url: 'https://www.theregister.com/offbeat/headlines.atom', category: 'tech', source: 'The Register', alwaysOdd: true },
  { url: 'http://www.mirror.co.uk/news/weird-news/?service=rss', category: 'viral', source: 'Mirror Weird', alwaysOdd: true },
  { url: 'http://www.dailystar.co.uk/news/weird-news/?service=rss', category: 'viral', source: 'Daily Star', alwaysOdd: true },
  
  // General news feeds (filtered for oddness)
  { url: 'https://feeds.bbci.co.uk/news/england/rss.xml', category: 'viral', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sport', source: 'BBC Sport' },
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'animals', source: 'BBC' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'tech', source: 'BBC Tech' },
];

// Curated articles (guaranteed odd)
const CURATED_ARTICLES = [
  {
    id: 'curated-1',
    title: "Dad Buys Pirate Ship on eBay for £500, Lives in It",
    summary: "Sam Griffiss, 35, converted an eBay pirate ship into an off-grid home by the River Severn.",
    url: 'https://www.mirror.co.uk/news/weird-news/dad-buys-pirate-ship-ebay-36634191',
    imageUrl: 'https://i2-prod.mirror.co.uk/article36635314.ece/ALTERNATES/s1200/622779517_10162341983697843_2559324211036302931_n.jpg',
    source: 'Mirror',
    category: 'property',
    publishedAt: '2026-01-29T12:00:00Z',
  },
  {
    id: 'curated-2',
    title: "Seal Pup Found in Cornwall Garden After Storm",
    summary: "A seal pup escaped rough seas, crossed the coastal path, and ended up beside a chicken coop.",
    url: 'https://www.bbc.co.uk/news/articles/c99k2m78dl2o',
    imageUrl: 'https://ichef.bbci.co.uk/ace/branded_news/1200/cpsprodpb/86c1/live/33837de0-fd28-11f0-890b-55ca0a00c59d.jpg',
    source: 'BBC',
    category: 'animals',
    publishedAt: '2026-01-30T10:00:00Z',
  },
  {
    id: 'curated-3',
    title: "Raccoon Stows Away to Belarus in Shipped Car",
    summary: "Customs found a raccoon napping on the dashboard. He's now named Senya and loves eggs.",
    url: 'https://www.upi.com/Odd_News/2026/01/30/belarus-raccoon-stowaway-shipped/7831769792654/',
    imageUrl: 'https://cdnph.upi.com/ph/st/th/7831769792654/2026/i/17697927912453/v1.5/Raccoon-stows-away-to-Belarus-in-shipped-car.jpg?lg=5',
    source: 'UPI',
    category: 'animals',
    publishedAt: '2026-01-30T14:00:00Z',
  },
  {
    id: 'curated-4',
    title: "2-Year-Old Breaks Two World Records at Pool and Snooker",
    summary: "British toddler Jude Owens is a Guinness World Record holder for youngest snooker double pot.",
    url: 'https://www.upi.com/Odd_News/2026/01/28/Guinness-World-Records-toddler-pool-snooker/1551769621785/',
    imageUrl: 'https://cdnph.upi.com/ph/st/th/1551769621785/2026/i/17696219299295/v1.5/British-2-year-old-breaks-two-world-records-playing-pool-and-snooker.jpg?lg=5',
    source: 'UPI',
    category: 'sport',
    publishedAt: '2026-01-28T12:00:00Z',
  },
  {
    id: 'curated-5',
    title: "Capybara Named Prune Wins Japan's 'Long Bath Showdown'",
    summary: "Prune soaked for 1 hour 45 minutes. Last place: Theta with 17 seconds.",
    url: 'https://www.upi.com/Odd_News/2026/01/28/japan-capybara-long-bath-showdown/5321769625214/',
    imageUrl: 'https://cdnph.upi.com/ph/st/th/5321769625214/2026/i/17696256576458/v1.5/Capybara-named-Prune-wins-long-bath-showdown.jpg?lg=5',
    source: 'UPI',
    category: 'animals',
    publishedAt: '2026-01-28T09:00:00Z',
  },
  {
    id: 'curated-6',
    title: "Mini Donkey Named Dolly Parton Captured by Police",
    summary: "Michigan State Police rounded up a miniature donkey who escaped. Her friend Henry came home alone.",
    url: 'https://www.upi.com/Odd_News/2026/01/29/Michigan-State-Police-Dolly-Parton-donkey/8241769700516/',
    imageUrl: 'https://cdnph.upi.com/ph/st/th/8241769700516/2026/i/17697113492619/v1.5/Michigan-State-Police-capture-mini-donkey-named-Dolly-Parton.jpg?lg=5',
    source: 'UPI',
    category: 'animals',
    publishedAt: '2026-01-29T15:00:00Z',
  },
  {
    id: 'curated-7',
    title: "'Crying Horse' Production Error Goes Viral in China",
    summary: "A stuffed horse with an upside-down muzzle became a mascot for overworked employees.",
    url: 'https://www.upi.com/Odd_News/2026/01/29/year-of-the-horse-crying-stuffie-viral-toy/2521769711018/',
    imageUrl: 'https://cdnph.upi.com/ph/st/th/2521769711018/2026/i/17697112985011/v1.5/Production-error-turns-crying-horse-toy-into-viral-sensation.jpg?lg=5',
    source: 'UPI',
    category: 'viral',
    publishedAt: '2026-01-29T11:00:00Z',
  },
  {
    id: 'curated-8',
    title: "Lidl Shoppers Spot 'AI Fail' in Weekly Magazine",
    summary: "A wine listing included: 'Short form quote if that doesn't fit'. Reddit is losing it.",
    url: 'https://www.mirror.co.uk/news/weird-news/lidl-shoppers-spot-hilarious-ai-36635635',
    imageUrl: 'https://i2-prod.mirror.co.uk/article36624225.ece/ALTERNATES/s1200/0_Branch-of-Lidl-in-Bromley-High-Street.jpg',
    source: 'Mirror',
    category: 'tech',
    publishedAt: '2026-01-29T08:00:00Z',
  },
  {
    id: 'curated-9',
    title: "Kangaroo Found Hopping Down Texas Road",
    summary: "Police are trying to find the owner of a kangaroo found hopping down the middle of a road.",
    url: 'https://www.upi.com/Odd_News/2026/01/29/Cleveland-Police-Department-Texas-kangaroo/2161769699374/',
    imageUrl: 'https://cdnph.upi.com/ph/st/th/2161769699374/2026/i/17696995421777/v1.5/Kangaroo-found-hopping-loose-down-Texas-road.jpg?lg=5',
    source: 'UPI',
    category: 'world',
    publishedAt: '2026-01-29T16:00:00Z',
  },
  {
    id: 'curated-10',
    title: "Brooklyn Beckham's Bolognese Recipe Roasted by Fans",
    summary: "David Beckham's son shared his spaghetti recipe. Fans spotted 'major flaws'.",
    url: 'https://www.mirror.co.uk/3am/celebrity-news/brooklyn-beckhams-spaghetti-bolognese-recipe-36641320',
    imageUrl: 'https://i2-prod.mirror.co.uk/article36641355.ece/ALTERNATES/s1200/2_Plan-A-Summer-Party-With-Brooklyn-Peltz-Beckham-And-Airbnb-Experiences.jpg',
    source: 'Mirror',
    category: 'food',
    publishedAt: '2026-01-30T13:00:00Z',
  },
];

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
  try {
    const response = await fetch(feedUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; OddlyEnough/1.0; +https://oddlyenough.app)',
        'Accept': 'application/rss+xml,application/xml,text/xml,*/*',
      }
    });
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
    console.error(`RSS fetch error for ${feedUrl}:`, error.message);
    return [];
  }
}

// Default images for sources without thumbnails
const DEFAULT_IMAGES = {
  'The Register': 'https://www.theregister.com/design_picker/621fa76b064a476dc713ebf25bbf16451c706c03/graphics/icons/reg_logo_og_image_1200x630.jpg',
};

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
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  
  // Start with curated articles
  let articles = [...CURATED_ARTICLES];
  
  // Fetch from RSS feeds
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    const items = await fetchRSS(feed.url);
    const filtered = feed.alwaysOdd 
      ? items.slice(0, 5)
      : items.filter(item => isOddNews(item.title, item.description));
    
    // Process items and fetch og:images for Reddit if needed
    const articlePromises = filtered.map(async (item, i) => {
      let imageUrl = item.thumbnail;
      
      // For sources without thumbnail, try to get an image
      if (!imageUrl) {
        // Check for source default image first
        if (DEFAULT_IMAGES[feed.source]) {
          imageUrl = DEFAULT_IMAGES[feed.source];
        } else {
          // Fetch og:image from actual article
          try {
            const ogImage = await fetchOgImage(item.link, null);
            if (ogImage) {
              imageUrl = ogImage;
            }
          } catch (e) {
            // Failed to fetch, will use placeholder
          }
        }
      }
      
      // Fix BBC image URLs
      if (feed.source.includes('BBC') && imageUrl) {
        imageUrl = fixBbcImage(imageUrl);
      }
      // Fix Mirror/Daily Star low-res thumbnails
      if ((feed.source.includes('Mirror') || feed.source.includes('Daily Star')) && imageUrl) {
        imageUrl = fixMirrorImage(imageUrl);
      }
      // Strip HTML from summary
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
        .trim();
      
      // Clean up Reddit boilerplate (submitted by /u/... [link] [comments])
      if (feed.source.startsWith('r/')) {
        summary = summary
          .replace(/submitted by\s+\/u\/\w+/gi, '')
          .replace(/\[link\]/gi, '')
          .replace(/\[comments\]/gi, '')
          .replace(/&#32;/g, '')
          .trim();
        // If summary is now empty or just whitespace, leave it empty
        if (!summary || summary.length < 10) {
          summary = '';
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
      
      return {
        id: `${feed.source.replace(/\s/g, '-')}-${now}-${i}`,
        title: item.title,
        summary,
        url: item.link,
        imageUrl: imageUrl || generatePlaceholder(item.title),
        source: feed.source,
        category: articleCategory,
        publishedAt: item.pubDate,
      };
    });
    
    // Wait for all article og:image fetches to complete
    return Promise.all(articlePromises);
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
  
  // Fetch og:image for articles without images (limit 10)
  const needImages = articles.filter(a => !a.imageUrl).slice(0, 10);
  await Promise.all(needImages.map(async (article) => {
    const img = await fetchOgImage(article.url, article.source);
    if (img) article.imageUrl = img;
  }));
  
  // Sort by date
  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  // Cache results
  cachedArticles = articles.slice(0, 30);
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
