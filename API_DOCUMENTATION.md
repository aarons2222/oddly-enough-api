# Oddly Enough API Documentation

**Base URL:** `https://oddly-enough-api.vercel.app`

A REST API serving weird and wonderful news articles from around the world.

---

## Endpoints

### 1. Get Articles

Fetch a list of weird news articles.

```
GET /api/articles
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category. Default: `all` |
| `refresh` | boolean | No | Force refresh from sources (bypasses cache) |

#### Categories

| ID | Label | Emoji |
|----|-------|-------|
| `all` | The Lot | ✨ |
| `animals` | Beasts | 🦔 |
| `viral` | Bangers | 🔥 |
| `fails` | Oops | 🤦 |
| `british` | Blighty | 🇬🇧 |
| `mystery` | Huh? | 👽 |
| `sport` | Mad Lads | 🏆 |
| `tech` | Bots & Bytes | 🤖 |
| `property` | Cribs | 🏠 |
| `food` | Grub | 🍕 |
| `crime` | Busted | 🚨 |
| `world` | Far Out | 🌍 |

#### Response

```json
{
  "articles": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "url": "string",
      "imageUrl": "string | null",
      "source": "string",
      "category": "string",
      "publishedAt": "ISO 8601 date string"
    }
  ],
  "cached": true,
  "total": 30,
  "fetchedAt": "2026-02-03T09:00:00.000Z"
}
```

#### Example Request

```bash
# Get all articles
curl https://oddly-enough-api.vercel.app/api/articles

# Get animal stories only
curl https://oddly-enough-api.vercel.app/api/articles?category=animals

# Force refresh
curl https://oddly-enough-api.vercel.app/api/articles?refresh=true
```

#### Swift Example

```swift
struct Article: Codable, Identifiable {
    let id: String
    let title: String
    let summary: String
    let url: String
    let imageUrl: String?
    let source: String
    let category: String
    let publishedAt: String
}

struct ArticlesResponse: Codable {
    let articles: [Article]
    let cached: Bool
    let total: Int?
    let fetchedAt: String?
}

func fetchArticles(category: String = "all") async throws -> [Article] {
    let url = URL(string: "https://oddly-enough-api.vercel.app/api/articles?category=\(category)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let response = try JSONDecoder().decode(ArticlesResponse.self, from: data)
    return response.articles
}
```

#### Kotlin Example

```kotlin
data class Article(
    val id: String,
    val title: String,
    val summary: String,
    val url: String,
    val imageUrl: String?,
    val source: String,
    val category: String,
    val publishedAt: String
)

data class ArticlesResponse(
    val articles: List<Article>,
    val cached: Boolean,
    val total: Int?,
    val fetchedAt: String?
)

// Using Retrofit
interface OddlyApi {
    @GET("api/articles")
    suspend fun getArticles(
        @Query("category") category: String = "all"
    ): ArticlesResponse
}
```

---

### 2. Get Categories

Fetch available categories.

```
GET /api/categories
```

#### Response

```json
{
  "categories": [
    {
      "id": "all",
      "label": "The Lot",
      "emoji": "✨"
    },
    {
      "id": "animals",
      "label": "Beasts",
      "emoji": "🦔"
    }
  ]
}
```

---

### 3. Track Events

Track article views and reactions.

```
POST /api/track
```

#### Request Body

```json
{
  "articleId": "string",
  "event": "view" | "reaction",
  "reaction": "🤯" | "😂" | "🤮"  // Required if event is "reaction"
}
```

#### Response

```json
{
  "success": true,
  "stats": {
    "views": 42,
    "reactions": {
      "🤯": 10,
      "😂": 25,
      "🤮": 7
    },
    "lastUpdated": "2026-02-03T09:00:00.000Z"
  }
}
```

#### Swift Example

```swift
struct TrackRequest: Codable {
    let articleId: String
    let event: String
    let reaction: String?
}

func trackView(articleId: String) async throws {
    var request = URLRequest(url: URL(string: "https://oddly-enough-api.vercel.app/api/track")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = TrackRequest(articleId: articleId, event: "view", reaction: nil)
    request.httpBody = try JSONEncoder().encode(body)
    
    let (_, _) = try await URLSession.shared.data(for: request)
}

func trackReaction(articleId: String, reaction: String) async throws {
    var request = URLRequest(url: URL(string: "https://oddly-enough-api.vercel.app/api/track")!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = TrackRequest(articleId: articleId, event: "reaction", reaction: reaction)
    request.httpBody = try JSONEncoder().encode(body)
    
    let (_, _) = try await URLSession.shared.data(for: request)
}
```

---

### 4. Get Stats

Get view/reaction stats for articles.

```
GET /api/stats?ids=id1,id2,id3
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | string | Yes | Comma-separated article IDs |

#### Response

```json
{
  "stats": {
    "article-id-1": {
      "views": 42,
      "reactions": {
        "🤯": 10,
        "😂": 25,
        "🤮": 7
      }
    },
    "article-id-2": {
      "views": 0,
      "reactions": {
        "🤯": 0,
        "😂": 0,
        "🤮": 0
      }
    }
  }
}
```

---

### 5. Get Article Content

Fetch full article content (scraped from source).

```
GET /api/content?url=<encoded-url>
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL-encoded article URL |

#### Response

```json
{
  "content": "Full article text...",
  "title": "Article Title",
  "description": "Meta description",
  "image": "https://example.com/image.jpg",
  "cached": false
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (missing parameters) |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

---

## Rate Limits

- No authentication required
- Cache TTL: 5 minutes for articles
- Be nice: don't hammer the API

---

## CORS

All endpoints support CORS with `Access-Control-Allow-Origin: *`

---

## Data Sources

Articles are aggregated from:
- Reddit: r/nottheonion, r/FloridaMan, r/offbeat
- UPI Odd News
- Mirror Weird News
- Daily Star Weird
- Sky News Strange
- The Independent Weird
- The Register Offbeat
- BBC (filtered for oddness)
- ScienceDaily Strange

---

## Example App Architecture

### iOS (SwiftUI)

```
OddlyEnough/
├── Models/
│   └── Article.swift
├── Services/
│   └── APIService.swift
├── Views/
│   ├── ArticleListView.swift
│   ├── ArticleCardView.swift
│   ├── ArticleDetailView.swift
│   └── CategoryFilterView.swift
└── ViewModels/
    └── ArticlesViewModel.swift
```

### Android (Kotlin + Jetpack Compose)

```
oddlyenough/
├── data/
│   ├── model/
│   │   └── Article.kt
│   ├── api/
│   │   └── OddlyApi.kt
│   └── repository/
│       └── ArticleRepository.kt
├── ui/
│   ├── screens/
│   │   ├── ArticleListScreen.kt
│   │   └── ArticleDetailScreen.kt
│   └── components/
│       ├── ArticleCard.kt
│       └── CategoryChip.kt
└── viewmodel/
    └── ArticlesViewModel.kt
```

---

## Interview Talking Points

1. **Networking**: URLSession (iOS) / Retrofit (Android)
2. **JSON Parsing**: Codable (Swift) / Kotlinx Serialization
3. **Async/Await**: Modern concurrency patterns
4. **Image Loading**: AsyncImage (SwiftUI) / Coil (Android)
5. **Caching**: Local persistence for offline support
6. **Architecture**: MVVM with Repository pattern
7. **Error Handling**: Graceful degradation, retry logic
8. **Pull to Refresh**: Native refresh controls
9. **Pagination**: Infinite scroll (future API feature)
10. **Deep Linking**: Open articles in browser or in-app WebView

Good luck with the interview! 🚀
