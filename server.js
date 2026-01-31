// Local dev server for testing API
const http = require('http');
const url = require('url');

// Import handlers
const articlesHandler = require('./api/articles.js').default;
const categoriesHandler = require('./api/categories.js').default;
const refreshHandler = require('./api/refresh.js').default;
const contentHandler = require('./api/content.js').default;

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Simple request/response wrapper
  const mockReq = {
    method: req.method,
    query: parsedUrl.query,
    url: req.url,
  };
  
  const mockRes = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      res.writeHead(this.statusCode);
      res.end(JSON.stringify(data, null, 2));
    },
    end() {
      res.writeHead(this.statusCode);
      res.end();
    }
  };
  
  try {
    if (path === '/api/articles') {
      await articlesHandler(mockReq, mockRes);
    } else if (path === '/api/categories') {
      await categoriesHandler(mockReq, mockRes);
    } else if (path === '/api/refresh') {
      await refreshHandler(mockReq, mockRes);
    } else if (path === '/api/content') {
      await contentHandler(mockReq, mockRes);
    } else if (path === '/') {
      res.writeHead(200);
      res.end(JSON.stringify({
        name: 'Oddly Enough API',
        version: '1.0.0',
        endpoints: ['/api/articles', '/api/categories', '/api/refresh']
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🦔 Oddly Enough API running at http://localhost:${PORT}`);
  console.log(`   /api/articles    - Get odd news`);
  console.log(`   /api/categories  - Get categories`);
});
