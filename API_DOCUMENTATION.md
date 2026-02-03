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

#### Java Example

```java
// Article.java
public class Article {
    private String id;
    private String title;
    private String summary;
    private String url;
    private String imageUrl;
    private String source;
    private String category;
    private String publishedAt;
    
    // Getters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getSummary() { return summary; }
    public String getUrl() { return url; }
    public String getImageUrl() { return imageUrl; }
    public String getSource() { return source; }
    public String getCategory() { return category; }
    public String getPublishedAt() { return publishedAt; }
    
    // Setters
    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setSummary(String summary) { this.summary = summary; }
    public void setUrl(String url) { this.url = url; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setSource(String source) { this.source = source; }
    public void setCategory(String category) { this.category = category; }
    public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }
}

// ArticlesResponse.java
public class ArticlesResponse {
    private List<Article> articles;
    private boolean cached;
    private Integer total;
    private String fetchedAt;
    
    public List<Article> getArticles() { return articles; }
    public boolean isCached() { return cached; }
    public Integer getTotal() { return total; }
    public String getFetchedAt() { return fetchedAt; }
}

// ApiService.java - Using OkHttp + Gson
import okhttp3.*;
import com.google.gson.Gson;
import java.io.IOException;

public class ApiService {
    private static final String BASE_URL = "https://oddly-enough-api.vercel.app";
    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();
    
    public interface ArticlesCallback {
        void onSuccess(List<Article> articles);
        void onError(Exception e);
    }
    
    public void fetchArticles(String category, ArticlesCallback callback) {
        String url = BASE_URL + "/api/articles";
        if (category != null && !category.equals("all")) {
            url += "?category=" + category;
        }
        
        Request request = new Request.Builder()
            .url(url)
            .build();
        
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError(e);
            }
            
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String json = response.body().string();
                    ArticlesResponse result = gson.fromJson(json, ArticlesResponse.class);
                    callback.onSuccess(result.getArticles());
                } else {
                    callback.onError(new Exception("HTTP " + response.code()));
                }
            }
        });
    }
    
    // Synchronous version (don't call on main thread!)
    public List<Article> fetchArticlesSync(String category) throws IOException {
        String url = BASE_URL + "/api/articles";
        if (category != null && !category.equals("all")) {
            url += "?category=" + category;
        }
        
        Request request = new Request.Builder()
            .url(url)
            .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful() && response.body() != null) {
                String json = response.body().string();
                ArticlesResponse result = gson.fromJson(json, ArticlesResponse.class);
                return result.getArticles();
            }
            throw new IOException("HTTP " + response.code());
        }
    }
}

// Using Retrofit (recommended)
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface OddlyApi {
    @GET("api/articles")
    Call<ArticlesResponse> getArticles(@Query("category") String category);
    
    @GET("api/categories")
    Call<CategoriesResponse> getCategories();
    
    @GET("api/stats")
    Call<StatsResponse> getStats(@Query("ids") String ids);
}

// Retrofit setup
Retrofit retrofit = new Retrofit.Builder()
    .baseUrl("https://oddly-enough-api.vercel.app/")
    .addConverterFactory(GsonConverterFactory.create())
    .build();

OddlyApi api = retrofit.create(OddlyApi.class);
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

#### Java Example

```java
// TrackRequest.java
public class TrackRequest {
    private String articleId;
    private String event;
    private String reaction;
    
    public TrackRequest(String articleId, String event, String reaction) {
        this.articleId = articleId;
        this.event = event;
        this.reaction = reaction;
    }
}

// TrackResponse.java
public class TrackResponse {
    private boolean success;
    private ArticleStats stats;
    
    public boolean isSuccess() { return success; }
    public ArticleStats getStats() { return stats; }
}

public class ArticleStats {
    private int views;
    private Map<String, Integer> reactions;
    private String lastUpdated;
    
    public int getViews() { return views; }
    public Map<String, Integer> getReactions() { return reactions; }
}

// ApiService.java - Track methods
public void trackView(String articleId, Callback<TrackResponse> callback) {
    TrackRequest body = new TrackRequest(articleId, "view", null);
    String json = gson.toJson(body);
    
    RequestBody requestBody = RequestBody.create(json, MediaType.parse("application/json"));
    Request request = new Request.Builder()
        .url(BASE_URL + "/api/track")
        .post(requestBody)
        .build();
    
    client.newCall(request).enqueue(new okhttp3.Callback() {
        @Override
        public void onFailure(Call call, IOException e) {
            callback.onError(e);
        }
        
        @Override
        public void onResponse(Call call, Response response) throws IOException {
            if (response.isSuccessful() && response.body() != null) {
                TrackResponse result = gson.fromJson(response.body().string(), TrackResponse.class);
                callback.onSuccess(result);
            }
        }
    });
}

public void trackReaction(String articleId, String reaction, Callback<TrackResponse> callback) {
    TrackRequest body = new TrackRequest(articleId, "reaction", reaction);
    String json = gson.toJson(body);
    
    RequestBody requestBody = RequestBody.create(json, MediaType.parse("application/json"));
    Request request = new Request.Builder()
        .url(BASE_URL + "/api/track")
        .post(requestBody)
        .build();
    
    client.newCall(request).enqueue(new okhttp3.Callback() {
        @Override
        public void onFailure(Call call, IOException e) {
            callback.onError(e);
        }
        
        @Override
        public void onResponse(Call call, Response response) throws IOException {
            if (response.isSuccessful() && response.body() != null) {
                TrackResponse result = gson.fromJson(response.body().string(), TrackResponse.class);
                callback.onSuccess(result);
            }
        }
    });
}

// Using Retrofit
public interface OddlyApi {
    @POST("api/track")
    Call<TrackResponse> trackEvent(@Body TrackRequest request);
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

### Android (Java + XML Views)

```
oddlyenough/
├── data/
│   ├── model/
│   │   ├── Article.java
│   │   ├── ArticlesResponse.java
│   │   └── Category.java
│   ├── api/
│   │   ├── OddlyApi.java
│   │   └── RetrofitClient.java
│   └── repository/
│       └── ArticleRepository.java
├── ui/
│   ├── activity/
│   │   ├── MainActivity.java
│   │   └── ArticleDetailActivity.java
│   ├── fragment/
│   │   └── ArticleListFragment.java
│   └── adapter/
│       └── ArticleAdapter.java
├── viewmodel/
│   └── ArticlesViewModel.java
└── res/
    └── layout/
        ├── activity_main.xml
        ├── fragment_article_list.xml
        ├── item_article.xml
        └── activity_article_detail.xml
```

#### Java ViewModel Example

```java
// ArticlesViewModel.java
public class ArticlesViewModel extends ViewModel {
    private final MutableLiveData<List<Article>> articles = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final ArticleRepository repository;
    
    public ArticlesViewModel() {
        repository = new ArticleRepository();
    }
    
    public LiveData<List<Article>> getArticles() { return articles; }
    public LiveData<Boolean> isLoading() { return loading; }
    public LiveData<String> getError() { return error; }
    
    public void loadArticles(String category) {
        loading.setValue(true);
        repository.fetchArticles(category, new ArticleRepository.Callback<List<Article>>() {
            @Override
            public void onSuccess(List<Article> result) {
                articles.postValue(result);
                loading.postValue(false);
            }
            
            @Override
            public void onError(Exception e) {
                error.postValue(e.getMessage());
                loading.postValue(false);
            }
        });
    }
}

// ArticleAdapter.java (RecyclerView)
public class ArticleAdapter extends RecyclerView.Adapter<ArticleAdapter.ViewHolder> {
    private List<Article> articles = new ArrayList<>();
    private OnArticleClickListener listener;
    
    public interface OnArticleClickListener {
        void onArticleClick(Article article);
        void onReactionClick(Article article, String reaction);
    }
    
    public void setArticles(List<Article> articles) {
        this.articles = articles;
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_article, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Article article = articles.get(position);
        holder.bind(article);
    }
    
    @Override
    public int getItemCount() { return articles.size(); }
    
    class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView titleView;
        private final TextView summaryView;
        private final ImageView imageView;
        
        ViewHolder(View itemView) {
            super(itemView);
            titleView = itemView.findViewById(R.id.title);
            summaryView = itemView.findViewById(R.id.summary);
            imageView = itemView.findViewById(R.id.image);
            
            itemView.setOnClickListener(v -> {
                int pos = getAdapterPosition();
                if (pos != RecyclerView.NO_POSITION && listener != null) {
                    listener.onArticleClick(articles.get(pos));
                }
            });
        }
        
        void bind(Article article) {
            titleView.setText(article.getTitle());
            summaryView.setText(article.getSummary());
            // Use Glide or Picasso for image loading
            Glide.with(imageView.getContext())
                .load(article.getImageUrl())
                .placeholder(R.drawable.placeholder)
                .into(imageView);
        }
    }
}
```

#### Gradle Dependencies (Java/Android)

```gradle
// app/build.gradle
dependencies {
    // Retrofit for networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    
    // OkHttp (included with Retrofit, but for logging)
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    
    // Gson for JSON
    implementation 'com.google.code.gson:gson:2.10.1'
    
    // Glide for images
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    
    // ViewModel & LiveData
    implementation 'androidx.lifecycle:lifecycle-viewmodel:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata:2.7.0'
    
    // RecyclerView
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    
    // SwipeRefreshLayout
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
}
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
