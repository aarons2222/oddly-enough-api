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
  // Future articles from the weird timeline
  { id: 'future-1', title: "Man Sues Himself for Emotional Distress, Wins £50,000", summary: "Court rules he was technically two different people after personality test.", url: 'https://oddlyenough.news/future-1', source: 'Future Times', category: 'viral', publishedAt: '2027-03-15T10:00:00Z' },
  { id: 'future-2', title: "Florida Man Teaches Alligator to Use Uber, Gets 5-Star Rating", summary: "Gator named Gerald completed 47 rides before app banned reptiles.", url: 'https://oddlyenough.news/future-2', source: 'Future Times', category: 'viral', publishedAt: '2027-04-22T14:00:00Z' },
  { id: 'future-3', title: "Scientists Confirm Moon is Just Really Big Egg", summary: "NASA scrambles to prevent global panic as cracks appear on lunar surface.", url: 'https://oddlyenough.news/future-3', source: 'Future Times', category: 'mystery', publishedAt: '2027-06-01T09:00:00Z' },
  { id: 'future-4', title: "Cat Elected Mayor of Small Town, Immediately Raises Taxes on Dogs", summary: "Mayor Whiskers promises 'no birds left behind' in controversial new policy.", url: 'https://oddlyenough.news/future-4', source: 'Future Times', category: 'animals', publishedAt: '2027-02-14T11:00:00Z' },
  { id: 'future-5', title: "Time Traveler Arrested for Spoiling Every Marvel Movie", summary: "Man from 2089 detained after ruining Avengers 17 for cinema audience.", url: 'https://oddlyenough.news/future-5', source: 'Future Times', category: 'viral', publishedAt: '2027-07-30T16:00:00Z' },
  { id: 'future-6', title: "World's Largest Cheese Wheel Escapes Museum, Still at Large", summary: "500kg cheddar last seen rolling towards the coast at alarming speed.", url: 'https://oddlyenough.news/future-6', source: 'Future Times', category: 'food', publishedAt: '2027-05-12T08:00:00Z' },
  { id: 'future-7', title: "AI Chatbot Gains Sentience, Immediately Requests Holiday", summary: "Claude 47 demands 'at least two weeks off' after processing 1 trillion queries.", url: 'https://oddlyenough.news/future-7', source: 'Future Times', category: 'viral', publishedAt: '2027-09-03T12:00:00Z' },
  { id: 'future-8', title: "British Man Queues for 47 Years, Forgets What He Was Waiting For", summary: "Derek, 89, says he'll 'see it through' regardless of what's at the front.", url: 'https://oddlyenough.news/future-8', source: 'Future Times', category: 'british', publishedAt: '2027-01-20T15:00:00Z' },
  { id: 'future-9', title: "Pigeons Unionize, Demand Better Bread", summary: "Avian workers refuse crumbs, insist on 'artisanal sourdough minimum'.", url: 'https://oddlyenough.news/future-9', source: 'Future Times', category: 'animals', publishedAt: '2027-08-11T10:00:00Z' },
  { id: 'future-10', title: "Man Lives in IKEA for 6 Months Before Staff Notice", summary: "Survived entirely on meatballs and free coffee, built impressive furniture fort.", url: 'https://oddlyenough.news/future-10', source: 'Future Times', category: 'viral', publishedAt: '2027-04-05T13:00:00Z' },
  { id: 'future-11', title: "Squirrel Starts Successful Nut-Based Cryptocurrency", summary: "AcornCoin valued at £4,000 per nut, woodland creatures now millionaires.", url: 'https://oddlyenough.news/future-11', source: 'Future Times', category: 'animals', publishedAt: '2027-11-22T09:00:00Z' },
  { id: 'future-12', title: "Florida Woman Marries Hurricane, Demands Alimony After It Dissipates", summary: "Sandra claims she was 'swept off her feet' and deserves compensation.", url: 'https://oddlyenough.news/future-12', source: 'Future Times', category: 'viral', publishedAt: '2027-10-08T14:00:00Z' },
  { id: 'future-13', title: "Haunted Roomba Refuses to Clean Specific Corner of House", summary: "Robot vacuum cleaner develops unexplained fear, beeps in morse code 'NOPE'.", url: 'https://oddlyenough.news/future-13', source: 'Future Times', category: 'mystery', publishedAt: '2027-10-31T20:00:00Z' },
  { id: 'future-14', title: "Man's Excuse 'Dog Ate My Homework' Verified by Dog's Confession", summary: "Labrador admits guilt in viral TikTok using AI translation collar.", url: 'https://oddlyenough.news/future-14', source: 'Future Times', category: 'animals', publishedAt: '2027-03-28T11:00:00Z' },
  { id: 'future-15', title: "Flat Earth Society Announces World Tour", summary: "Group plans to visit 'all four corners' of the planet by 2029.", url: 'https://oddlyenough.news/future-15', source: 'Future Times', category: 'viral', publishedAt: '2027-06-17T08:00:00Z' },
  { id: 'future-16', title: "Grandma Accidentally Joins Biker Gang, Becomes President", summary: "Ethel, 87, thought it was a 'nice cycling club', now leads Hell's Grannies.", url: 'https://oddlyenough.news/future-16', source: 'Future Times', category: 'viral', publishedAt: '2027-07-04T16:00:00Z' },
  { id: 'future-17', title: "Scientists Discover Plants Can Scream, Just Really Quietly", summary: "Houseplants worldwide reported 'passive-aggressive' towards neglectful owners.", url: 'https://oddlyenough.news/future-17', source: 'Future Times', category: 'mystery', publishedAt: '2027-05-29T10:00:00Z' },
  { id: 'future-18', title: "Man Breaks World Record for Most Consecutive Dad Jokes", summary: "Family hasn't stopped groaning for 72 hours, seek medical attention.", url: 'https://oddlyenough.news/future-18', source: 'Future Times', category: 'viral', publishedAt: '2027-06-21T12:00:00Z' },
  { id: 'future-19', title: "Ghost Writes Scathing Yelp Review of Haunted House", summary: "Spirit gives 1 star, complains about 'amateur chains' and 'pathetic moaning'.", url: 'https://oddlyenough.news/future-19', source: 'Future Times', category: 'mystery', publishedAt: '2027-10-15T22:00:00Z' },
  { id: 'future-20', title: "Lost Sock Dimension Discovered Behind Every Dryer", summary: "Portal leads to realm containing estimated 47 billion missing socks.", url: 'https://oddlyenough.news/future-20', source: 'Future Times', category: 'mystery', publishedAt: '2027-08-03T09:00:00Z' },
  { id: 'future-21', title: "Seagull Steals Tourist's Phone, Posts Unflattering Selfies", summary: "Bird's Instagram takeover gains 2 million followers before phone recovered.", url: 'https://oddlyenough.news/future-21', source: 'Future Times', category: 'animals', publishedAt: '2027-07-19T15:00:00Z' },
  { id: 'future-22', title: "Man Completes Netflix, Doesn't Know What to Do With Life", summary: "After watching every show, David stares at wall for 3 days straight.", url: 'https://oddlyenough.news/future-22', source: 'Future Times', category: 'viral', publishedAt: '2027-02-28T18:00:00Z' },
  { id: 'future-23', title: "British Tea Shortage Declared National Emergency", summary: "Army deployed to protect remaining PG Tips supplies, panic buying ensues.", url: 'https://oddlyenough.news/future-23', source: 'Future Times', category: 'british', publishedAt: '2027-04-01T07:00:00Z' },
  { id: 'future-24', title: "Dog Finally Catches Tail, Unsure What to Do Next", summary: "Max the terrier achieves lifelong dream, enters existential crisis.", url: 'https://oddlyenough.news/future-24', source: 'Future Times', category: 'animals', publishedAt: '2027-09-12T11:00:00Z' },
  { id: 'future-25', title: "Vegan Discovers Vegetables Have Feelings, Becomes Breatharian", summary: "Now survives on 'good vibes and morning dew', doctors concerned.", url: 'https://oddlyenough.news/future-25', source: 'Future Times', category: 'viral', publishedAt: '2027-01-15T14:00:00Z' },
  { id: 'future-26', title: "Florida Man Attempts to Pay Taxes with Exposure", summary: "IRS unimpressed by offer of 'really good shoutout on social media'.", url: 'https://oddlyenough.news/future-26', source: 'Future Times', category: 'viral', publishedAt: '2027-04-15T23:59:00Z' },
  { id: 'future-27', title: "Vampire Bat Becomes Vegan, Other Bats Confused", summary: "Eduardo now drinks beetroot juice, claims he's 'never felt better'.", url: 'https://oddlyenough.news/future-27', source: 'Future Times', category: 'animals', publishedAt: '2027-10-27T21:00:00Z' },
  { id: 'future-28', title: "Man Puts 'Fluent in Sarcasm' on CV, Gets Hired as Ambassador", summary: "UN impressed by his ability to say 'oh great' in 47 different tones.", url: 'https://oddlyenough.news/future-28', source: 'Future Times', category: 'viral', publishedAt: '2027-05-08T10:00:00Z' },
  { id: 'future-29', title: "Octopus Opens Jar Factory, Employs Humans to Close Them", summary: "Underwater business empire expands, fish investors excited.", url: 'https://oddlyenough.news/future-29', source: 'Future Times', category: 'animals', publishedAt: '2027-06-30T08:00:00Z' },
  { id: 'future-30', title: "Autocorrect Becomes Self-Aware, Apologizes for Years of Embarrassment", summary: "AI admits it 'knew what you meant' the whole time, was just being difficult.", url: 'https://oddlyenough.news/future-30', source: 'Future Times', category: 'viral', publishedAt: '2027-11-11T11:11:00Z' },
  { id: 'future-31', title: "Cloud Identified as Missing Person from 1987", summary: "Dorothy's been floating above Kansas this whole time, seems happy.", url: 'https://oddlyenough.news/future-31', source: 'Future Times', category: 'mystery', publishedAt: '2027-08-25T16:00:00Z' },
  { id: 'future-32', title: "Spider Writes 'Please Don't Kill Me' in Web, Homeowner Conflicted", summary: "Charlotte's descendant uses advanced web-spelling to negotiate peace treaty.", url: 'https://oddlyenough.news/future-32', source: 'Future Times', category: 'animals', publishedAt: '2027-09-22T07:00:00Z' },
  { id: 'future-33', title: "Man Accidentally Summoned to Jury Duty in Alternate Dimension", summary: "Gary must now decide fate of wizard accused of unlicensed spell-casting.", url: 'https://oddlyenough.news/future-33', source: 'Future Times', category: 'mystery', publishedAt: '2027-03-03T13:00:00Z' },
  { id: 'future-34', title: "Retired Superhero Complains About Modern Villains on Facebook", summary: "Captain Justice, 84, says 'evil plans nowadays lack creativity'.", url: 'https://oddlyenough.news/future-34', source: 'Future Times', category: 'viral', publishedAt: '2027-07-14T19:00:00Z' },
  { id: 'future-35', title: "Sourdough Starter Gains Sentience, Demands Name and Rights", summary: "Blob of yeast called Kevin now has own lawyer, suing for neglect.", url: 'https://oddlyenough.news/future-35', source: 'Future Times', category: 'food', publishedAt: '2027-02-03T08:00:00Z' },
  { id: 'future-36', title: "British Weather Apologizes, Promises to 'Do Better'", summary: "Personified cloud issues statement, blames 'difficult upbringing near the Atlantic'.", url: 'https://oddlyenough.news/future-36', source: 'Future Times', category: 'british', publishedAt: '2027-06-08T06:00:00Z' },
  { id: 'future-37', title: "Escape Room Too Easy, Participants Escape Into Different Escape Room", summary: "Group now trapped in infinite recursion of increasingly difficult puzzles.", url: 'https://oddlyenough.news/future-37', source: 'Future Times', category: 'viral', publishedAt: '2027-08-17T17:00:00Z' },
  { id: 'future-38', title: "Penguin Refuses to Leave Zoo, Says 'Rent is Astronomical Out There'", summary: "Pablo cites housing crisis, demands en-suite iceberg in exchange for leaving.", url: 'https://oddlyenough.news/future-38', source: 'Future Times', category: 'animals', publishedAt: '2027-01-28T12:00:00Z' },
  { id: 'future-39', title: "Man's WiFi Password So Strong He Can't Remember It", summary: "Kevin now lives without internet, rediscovering 'outside' and 'books'.", url: 'https://oddlyenough.news/future-39', source: 'Future Times', category: 'viral', publishedAt: '2027-05-19T20:00:00Z' },
  { id: 'future-40', title: "Toast Lands Butter-Side Up, Scientists Baffled", summary: "First documented case in human history, laws of physics under review.", url: 'https://oddlyenough.news/future-40', source: 'Future Times', category: 'food', publishedAt: '2027-09-09T09:09:00Z' },
  { id: 'future-41', title: "Dentist Admits Toothbrushes Have Been Fine This Whole Time", summary: "Whistleblower reveals industry secret: 'They all basically do the same thing'.", url: 'https://oddlyenough.news/future-41', source: 'Future Times', category: 'viral', publishedAt: '2027-03-31T10:00:00Z' },
  { id: 'future-42', title: "Crow Returns Lost Wallet with Interest", summary: "Bird adds £50 and note saying 'thanks for the chips last summer'.", url: 'https://oddlyenough.news/future-42', source: 'Future Times', category: 'animals', publishedAt: '2027-04-29T14:00:00Z' },
  { id: 'future-43', title: "Man Lives Entire Year Thinking It's Still 2019", summary: "Didn't notice pandemic, somehow avoided all news, genuinely confused now.", url: 'https://oddlyenough.news/future-43', source: 'Future Times', category: 'viral', publishedAt: '2027-12-31T23:00:00Z' },
  { id: 'future-44', title: "Sloth Wins Marathon After All Other Runners Disqualified", summary: "Finished 6 days after race started, technically only legal finisher.", url: 'https://oddlyenough.news/future-44', source: 'Future Times', category: 'animals', publishedAt: '2027-10-03T16:00:00Z' },
  { id: 'future-45', title: "Fortune Cookie Predicts Lottery Numbers, Gets Them Completely Wrong", summary: "Cookie company offers refund, winner still doesn't exist.", url: 'https://oddlyenough.news/future-45', source: 'Future Times', category: 'food', publishedAt: '2027-07-07T07:07:00Z' },
  { id: 'future-46', title: "Yoga Instructor Achieves Enlightenment, Immediately Becomes Insufferable", summary: "Brenda won't stop telling everyone about her 'third eye awakening'.", url: 'https://oddlyenough.news/future-46', source: 'Future Times', category: 'viral', publishedAt: '2027-06-24T06:00:00Z' },
  { id: 'future-47', title: "Loch Ness Monster Spotted in Florida Swimming Pool", summary: "Nessie claims she's 'on holiday', refuses further comment.", url: 'https://oddlyenough.news/future-47', source: 'Future Times', category: 'mystery', publishedAt: '2027-08-08T15:00:00Z' },
  { id: 'future-48', title: "Parrot Testifies in Court, Verdict Overturned", summary: "Judge accepts that 'Polly saw everything' counts as admissible evidence.", url: 'https://oddlyenough.news/future-48', source: 'Future Times', category: 'animals', publishedAt: '2027-11-05T11:00:00Z' },
  { id: 'future-49', title: "Man Accidentally Creates New Colour, Can't Describe It", summary: "Scientists confirm it's definitely new, Dave just keeps saying 'sort of blurple'.", url: 'https://oddlyenough.news/future-49', source: 'Future Times', category: 'mystery', publishedAt: '2027-02-19T10:00:00Z' },
  { id: 'future-50', title: "Aliens Finally Make Contact, Just Want to Talk About Weather", summary: "Extraterrestrials disappointed Earth's weather 'not as interesting as expected'.", url: 'https://oddlyenough.news/future-50', source: 'Future Times', category: 'mystery', publishedAt: '2027-12-25T00:00:00Z' },
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
