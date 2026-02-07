module.exports = (req, res) => { res.setHeader("Content-Type", "text/html"); res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Oddly Enough — Mission Control</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0e1a;--bg2:#0f1424;--bg3:#141929;
  --glass:rgba(20,25,45,0.65);--glass-border:rgba(255,255,255,0.06);
  --teal:#14B8A6;--teal-dim:rgba(20,184,166,0.15);--teal-glow:rgba(20,184,166,0.3);
  --coral:#FF6B6B;--coral-dim:rgba(255,107,107,0.15);
  --purple:#A78BFA;--purple-dim:rgba(167,139,250,0.15);
  --green:#34D399;--green-dim:rgba(52,211,153,0.15);
  --yellow:#FBBF24;--yellow-dim:rgba(251,191,36,0.15);
  --blue:#60A5FA;--blue-dim:rgba(96,165,250,0.15);
  --text:#E2E8F0;--text-dim:#64748B;--text-muted:#475569;
  --radius:12px;--radius-sm:8px;
}
html{font-size:15px;scroll-behavior:smooth}
body{
  font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);
  min-height:100vh;overflow-x:hidden;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%,rgba(20,184,166,0.08),transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%,rgba(255,107,107,0.05),transparent);
}
h1,h2,h3,h4{font-family:'Space Grotesk',sans-serif;font-weight:600}

/* Scrollbar */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--text-muted);border-radius:3px}

/* Layout */
.container{max-width:1440px;margin:0 auto;padding:0 24px 60px}

/* ── Header ── */
.header{
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;
  padding:28px 0 20px;border-bottom:1px solid var(--glass-border);margin-bottom:28px;
}
.header-left{display:flex;align-items:center;gap:14px}
.logo-mark{
  width:42px;height:42px;border-radius:10px;
  background:linear-gradient(135deg,var(--teal),var(--coral));
  display:flex;align-items:center;justify-content:center;font-size:20px;
  box-shadow:0 0 24px var(--teal-glow);
}
.header h1{font-size:1.55rem;letter-spacing:-0.5px}
.header h1 span{color:var(--teal)}
.header-right{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.live-dot{
  width:8px;height:8px;border-radius:50%;background:var(--teal);
  animation:pulse-dot 2s infinite;display:inline-block;
}
@keyframes pulse-dot{0%,100%{box-shadow:0 0 0 0 var(--teal-glow)}50%{box-shadow:0 0 0 6px transparent}}
.refresh-info{font-size:.78rem;color:var(--text-dim)}
.header-stats{display:flex;gap:20px;flex-wrap:wrap}
.header-stat{text-align:center}
.header-stat .val{font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:700;color:var(--teal)}
.header-stat .lbl{font-size:.65rem;text-transform:uppercase;letter-spacing:.8px;color:var(--text-dim)}

/* ── Glass Card ── */
.card{
  background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);
  padding:22px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  transition:border-color .2s;
}
.card:hover{border-color:rgba(255,255,255,0.1)}
.card-title{
  font-family:'Space Grotesk',sans-serif;font-size:.85rem;font-weight:600;
  text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:16px;
  display:flex;align-items:center;gap:8px;
}
.card-title .icon{font-size:1rem}

/* ── Pipeline Flow ── */
.pipeline-section{margin-bottom:28px}
.pipeline-flow{
  display:flex;align-items:center;justify-content:center;gap:0;flex-wrap:wrap;
  padding:20px 0;
}
.pipeline-node{
  text-align:center;padding:18px 28px;border-radius:var(--radius);
  min-width:130px;position:relative;transition:transform .2s;
}
.pipeline-node:hover{transform:translateY(-2px)}
.pipeline-node .count{font-family:'Space Grotesk',sans-serif;font-size:2.2rem;font-weight:700;line-height:1}
.pipeline-node .label{font-size:.72rem;text-transform:uppercase;letter-spacing:.8px;margin-top:6px;opacity:.8}
.pn-found{background:var(--yellow-dim);color:var(--yellow)}
.pn-summarising{background:var(--blue-dim);color:var(--blue)}
.pn-ready{background:var(--green-dim);color:var(--green)}
.pn-published{background:var(--teal-dim);color:var(--teal)}
.pn-rejected{background:var(--coral-dim);color:var(--coral)}
.pipeline-arrow{
  font-size:1.4rem;color:var(--text-muted);padding:0 8px;flex-shrink:0;
}
.pipeline-arrow::after{content:'›';font-family:'Space Grotesk',sans-serif;font-weight:300;font-size:2rem}
.pipeline-rejected-sep{
  width:1px;height:50px;background:var(--glass-border);margin:0 18px;flex-shrink:0;
}

/* ── Agent Cards ── */
.agents-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:28px}
.agent-card{position:relative;overflow:hidden}
.agent-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  border-radius:var(--radius) var(--radius) 0 0;
}
.agent-scout::before{background:var(--teal)}
.agent-quill::before{background:var(--purple)}
.agent-editor::before{background:var(--green)}
.agent-promoter::before{background:var(--coral)}
.agent-emoji{font-size:1.6rem;margin-bottom:8px;display:block}
.agent-name{font-family:'Space Grotesk',sans-serif;font-size:1.05rem;font-weight:600;margin-bottom:12px}
.agent-metric{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--glass-border)}
.agent-metric:last-child{border-bottom:none}
.agent-metric .lbl{font-size:.78rem;color:var(--text-dim)}
.agent-metric .val{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:.92rem}

/* ── Stats Bar ── */
.stats-bar{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:28px;
}
.stat-card{text-align:center;padding:18px 14px}
.stat-card .val{font-family:'Space Grotesk',sans-serif;font-size:1.8rem;font-weight:700;color:var(--teal)}
.stat-card .lbl{font-size:.68rem;text-transform:uppercase;letter-spacing:.8px;color:var(--text-dim);margin-top:4px}

/* ── Tables ── */
.table-wrap{overflow-x:auto;margin-bottom:28px}
table{width:100%;border-collapse:collapse;font-size:.82rem}
thead th{
  font-family:'Space Grotesk',sans-serif;font-size:.7rem;text-transform:uppercase;
  letter-spacing:.8px;color:var(--text-dim);text-align:left;padding:10px 12px;
  border-bottom:1px solid var(--glass-border);font-weight:600;
}
tbody tr{border-bottom:1px solid rgba(255,255,255,0.03);transition:background .15s}
tbody tr:hover{background:rgba(255,255,255,0.02)}
tbody td{padding:10px 12px;vertical-align:middle}
.badge{
  display:inline-block;padding:3px 10px;border-radius:20px;font-size:.7rem;
  font-weight:600;font-family:'Space Grotesk',sans-serif;
}
.badge-found{background:var(--yellow-dim);color:var(--yellow)}
.badge-summarising{background:var(--blue-dim);color:var(--blue)}
.badge-ready{background:var(--green-dim);color:var(--green)}
.badge-published{background:var(--teal-dim);color:var(--teal)}
.badge-rejected{background:var(--coral-dim);color:var(--coral)}
.weirdness-badge{
  display:inline-flex;align-items:center;justify-content:center;
  width:32px;height:32px;border-radius:50%;font-size:.78rem;font-weight:700;
  font-family:'Space Grotesk',sans-serif;
}
.w-low{background:var(--blue-dim);color:var(--blue)}
.w-mid{background:var(--yellow-dim);color:var(--yellow)}
.w-high{background:var(--coral-dim);color:var(--coral)}
.source-link{color:var(--teal);text-decoration:none;font-size:.75rem;opacity:.7;transition:opacity .15s}
.source-link:hover{opacity:1;text-decoration:underline}
.title-cell{max-width:320px}
.title-text{font-weight:500;line-height:1.3}
.category-tag{font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px}
.time-ago{color:var(--text-dim);font-size:.75rem;white-space:nowrap}

/* ── Activity Log ── */
.log-section{margin-bottom:28px}
.log-feed{max-height:420px;overflow-y:auto;display:flex;flex-direction:column;gap:6px}
.log-entry{
  display:flex;align-items:flex-start;gap:12px;padding:10px 14px;
  border-radius:var(--radius-sm);background:rgba(255,255,255,0.015);
  border-left:3px solid transparent;font-size:.8rem;transition:background .15s;
}
.log-entry:hover{background:rgba(255,255,255,0.03)}
.log-scout{border-left-color:var(--teal)}
.log-quill{border-left-color:var(--purple)}
.log-editor{border-left-color:var(--green)}
.log-promoter{border-left-color:var(--coral)}
.log-time{color:var(--text-muted);font-size:.7rem;white-space:nowrap;min-width:60px;padding-top:2px}
.log-agent{
  font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:.72rem;
  text-transform:uppercase;letter-spacing:.5px;min-width:64px;padding-top:1px;
}
.log-agent.a-scout{color:var(--teal)}
.log-agent.a-quill{color:var(--purple)}
.log-agent.a-editor{color:var(--green)}
.log-agent.a-promoter{color:var(--coral)}
.log-action{color:var(--text);flex:1;line-height:1.4}
.log-action strong{font-weight:600}

/* ── Two-col layout ── */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
@media(max-width:900px){.two-col{grid-template-columns:1fr}}

/* ── Loading / Error ── */
.loading{text-align:center;padding:40px;color:var(--text-dim)}
.loading-spinner{
  width:28px;height:28px;border:3px solid var(--glass-border);
  border-top-color:var(--teal);border-radius:50%;animation:spin .8s linear infinite;
  margin:0 auto 12px;
}
@keyframes spin{to{transform:rotate(360deg)}}
.error-msg{color:var(--coral);font-size:.82rem;padding:12px;text-align:center}
.empty-msg{color:var(--text-muted);font-size:.82rem;padding:20px;text-align:center;font-style:italic}

/* ── Responsive ── */
@media(max-width:768px){
  .header{flex-direction:column;align-items:flex-start}
  .pipeline-flow{flex-direction:column;gap:8px}
  .pipeline-arrow{transform:rotate(90deg)}
  .pipeline-rejected-sep{width:50px;height:1px;margin:8px 0}
  .container{padding:0 14px 40px}
}

/* ── Animations ── */
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fade-in{animation:fadeIn .4s ease-out both}
.fade-in-1{animation-delay:.05s}.fade-in-2{animation-delay:.1s}
.fade-in-3{animation-delay:.15s}.fade-in-4{animation-delay:.2s}
.fade-in-5{animation-delay:.25s}.fade-in-6{animation-delay:.3s}
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <header class="header fade-in">
    <div class="header-left">
      <div class="logo-mark">⚡</div>
      <div>
        <h1>Oddly Enough — <span>Mission Control</span></h1>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
          <span class="live-dot"></span>
          <span class="refresh-info">Live · refreshes every 30s · <span id="last-refresh">—</span></span>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="header-stats" id="header-stats">
        <div class="header-stat"><div class="val" id="hs-today">—</div><div class="lbl">Today</div></div>
        <div class="header-stat"><div class="val" id="hs-pending">—</div><div class="lbl">In Pipeline</div></div>
        <div class="header-stat"><div class="val" id="hs-published">—</div><div class="lbl">Published</div></div>
      </div>
    </div>
  </header>

  <!-- Stats Bar -->
  <section class="stats-bar fade-in fade-in-1" id="stats-bar">
    <div class="card stat-card"><div class="val" id="st-total">—</div><div class="lbl">Total Published</div></div>
    <div class="card stat-card"><div class="val" id="st-today">—</div><div class="lbl">Articles Today</div></div>
    <div class="card stat-card"><div class="val" id="st-weird">—</div><div class="lbl">Avg Weirdness</div></div>
    <div class="card stat-card"><div class="val" id="st-reject">—</div><div class="lbl">Rejection Rate</div></div>
    <div class="card stat-card"><div class="val" id="st-throughput">—</div><div class="lbl">Articles / Day</div></div>
  </section>

  <!-- Pipeline Overview -->
  <section class="pipeline-section card fade-in fade-in-2">
    <div class="card-title"><span class="icon">🔄</span> Pipeline Overview</div>
    <div class="pipeline-flow" id="pipeline-flow">
      <div class="pipeline-node pn-found"><div class="count" id="pf-found">—</div><div class="label">Found</div></div>
      <div class="pipeline-arrow"></div>
      <div class="pipeline-node pn-summarising"><div class="count" id="pf-summarising">—</div><div class="label">Summarising</div></div>
      <div class="pipeline-arrow"></div>
      <div class="pipeline-node pn-ready"><div class="count" id="pf-ready">—</div><div class="label">Ready</div></div>
      <div class="pipeline-arrow"></div>
      <div class="pipeline-node pn-published"><div class="count" id="pf-published">—</div><div class="label">Published</div></div>
      <div class="pipeline-rejected-sep"></div>
      <div class="pipeline-node pn-rejected"><div class="count" id="pf-rejected">—</div><div class="label">Rejected</div></div>
    </div>
  </section>

  <!-- Agent Status Cards -->
  <section class="agents-grid fade-in fade-in-3">
    <div class="card agent-card agent-scout" id="agent-scout">
      <span class="agent-emoji">🔍</span>
      <div class="agent-name">Scout</div>
      <div class="agent-metric"><span class="lbl">Last Activity</span><span class="val" id="as-scout-time">—</span></div>
      <div class="agent-metric"><span class="lbl">Found Today</span><span class="val" id="as-scout-count">—</span></div>
    </div>
    <div class="card agent-card agent-quill" id="agent-quill">
      <span class="agent-emoji">✍️</span>
      <div class="agent-name">Quill</div>
      <div class="agent-metric"><span class="lbl">Last Activity</span><span class="val" id="as-quill-time">—</span></div>
      <div class="agent-metric"><span class="lbl">Summarised Today</span><span class="val" id="as-quill-count">—</span></div>
    </div>
    <div class="card agent-card agent-editor" id="agent-editor">
      <span class="agent-emoji">🛡️</span>
      <div class="agent-name">Editor</div>
      <div class="agent-metric"><span class="lbl">Last Activity</span><span class="val" id="as-editor-time">—</span></div>
      <div class="agent-metric"><span class="lbl">Published / Rejected</span><span class="val" id="as-editor-count">—</span></div>
    </div>
    <div class="card agent-card agent-promoter" id="agent-promoter">
      <span class="agent-emoji">📣</span>
      <div class="agent-name">Promoter</div>
      <div class="agent-metric"><span class="lbl">Last Activity</span><span class="val" id="as-promoter-time">—</span></div>
      <div class="agent-metric"><span class="lbl">Posts Drafted</span><span class="val" id="as-promoter-count">—</span></div>
    </div>
  </section>

  <!-- Two Column: Articles + Drafts -->
  <div class="two-col fade-in fade-in-4">
    <!-- Recent Articles -->
    <section class="card">
      <div class="card-title"><span class="icon">📰</span> Recent Articles</div>
      <div class="table-wrap" id="articles-table">
        <div class="loading"><div class="loading-spinner"></div>Loading articles…</div>
      </div>
    </section>

    <!-- Draft Pipeline -->
    <section class="card">
      <div class="card-title"><span class="icon">🧪</span> Draft Pipeline</div>
      <div class="table-wrap" id="drafts-table">
        <div class="loading"><div class="loading-spinner"></div>Loading drafts…</div>
      </div>
    </section>
  </div>

  <!-- Activity Log -->
  <section class="card log-section fade-in fade-in-5">
    <div class="card-title"><span class="icon">📋</span> Agent Activity Log</div>
    <div class="log-feed" id="log-feed">
      <div class="loading"><div class="loading-spinner"></div>Loading activity…</div>
    </div>
  </section>

</div>

<script>
// ── Config ──
const SUPABASE_URL = 'https://wzvvfsuumtmewrogiqed.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dnZmc3V1bXRtZXdyb2dpcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Njg2NTksImV4cCI6MjA4NjA0NDY1OX0.sGFlr7LsVwK_olfGMunc5z0LncRDCyUOaHAcJpmb2q8';
const REFRESH_MS = 30000;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': \`Bearer \${SUPABASE_KEY}\`,
  'Content-Type': 'application/json',
};
const countHeaders = { ...headers, 'Prefer': 'count=exact' };

function api(path, opts = {}) {
  const h = opts.count ? countHeaders : headers;
  return fetch(\`\${SUPABASE_URL}\${path}\`, { headers: h })
    .then(async r => {
      const data = await r.json().catch(() => []);
      const count = opts.count ? parseInt(r.headers.get('content-range')?.split('/')[1] || '0', 10) : null;
      return { data, count };
    })
    .catch(err => ({ data: [], count: 0, error: err.message }));
}

// ── Helpers ──
function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return \`\${mins}m ago\`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return \`\${hrs}h \${mins % 60}m ago\`;
  const days = Math.floor(hrs / 24);
  return \`\${days}d ago\`;
}

function shortTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function weirdnessClass(score) {
  if (score == null) return 'w-low';
  if (score >= 8) return 'w-high';
  if (score >= 5) return 'w-mid';
  return 'w-low';
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// ── Render Functions ──
function renderArticlesTable(articles) {
  const el = document.getElementById('articles-table');
  if (!articles || articles.length === 0) {
    el.innerHTML = '<div class="empty-msg">No published articles yet</div>';
    return;
  }
  let html = \`<table><thead><tr>
    <th>Title</th><th>Category</th><th style="text-align:center">Weird</th><th>Published</th><th>Source</th>
  </tr></thead><tbody>\`;
  for (const a of articles) {
    const wc = weirdnessClass(a.weirdness_score);
    html += \`<tr>
      <td class="title-cell"><div class="title-text">\${escHtml(truncate(a.title, 70))}</div></td>
      <td><span class="category-tag">\${escHtml(a.category || '—')}</span></td>
      <td style="text-align:center"><span class="weirdness-badge \${wc}">\${a.weirdness_score ?? '?'}</span></td>
      <td><span class="time-ago">\${timeAgo(a.published_at)}</span></td>
      <td>\${a.source_url ? \`<a href="\${escHtml(a.source_url)}" target="_blank" rel="noopener" class="source-link">↗ source</a>\` : '—'}</td>
    </tr>\`;
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderDraftsTable(drafts) {
  const el = document.getElementById('drafts-table');
  if (!drafts || drafts.length === 0) {
    el.innerHTML = '<div class="empty-msg">No drafts in pipeline</div>';
    return;
  }
  let html = \`<table><thead><tr>
    <th>Title</th><th>Status</th><th style="text-align:center">Weird</th><th>In Pipeline</th>
  </tr></thead><tbody>\`;
  for (const d of drafts) {
    const wc = weirdnessClass(d.weirdness_score);
    const statusClass = \`badge-\${d.status || 'found'}\`;
    html += \`<tr>
      <td class="title-cell"><div class="title-text">\${escHtml(truncate(d.title, 60))}</div></td>
      <td><span class="badge \${statusClass}">\${escHtml(d.status || 'unknown')}</span></td>
      <td style="text-align:center"><span class="weirdness-badge \${wc}">\${d.weirdness_score ?? '?'}</span></td>
      <td><span class="time-ago">\${timeAgo(d.created_at)}</span></td>
    </tr>\`;
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function renderLogFeed(logs) {
  const el = document.getElementById('log-feed');
  if (!logs || logs.length === 0) {
    el.innerHTML = '<div class="empty-msg">No agent activity yet</div>';
    return;
  }
  let html = '';
  for (const l of logs) {
    const agent = (l.agent || 'unknown').toLowerCase();
    const agentClass = ['scout','quill','editor','promoter'].includes(agent) ? agent : 'scout';
    const details = l.details ? (typeof l.details === 'string' ? l.details : JSON.stringify(l.details)) : '';
    const detailStr = details ? \` — <span style="color:var(--text-dim)">\${escHtml(truncate(details, 120))}</span>\` : '';
    html += \`<div class="log-entry log-\${agentClass}">
      <span class="log-time">\${shortTime(l.created_at)}</span>
      <span class="log-agent a-\${agentClass}">\${escHtml(agent)}</span>
      <span class="log-action"><strong>\${escHtml(l.action || '—')}</strong>\${detailStr}</span>
    </div>\`;
  }
  el.innerHTML = html;
}

function renderPipeline(drafts) {
  const counts = { found: 0, summarising: 0, ready: 0, published: 0, rejected: 0 };
  if (drafts) {
    for (const d of drafts) {
      const s = d.status || 'found';
      if (counts[s] !== undefined) counts[s]++;
    }
  }
  document.getElementById('pf-found').textContent = counts.found;
  document.getElementById('pf-summarising').textContent = counts.summarising;
  document.getElementById('pf-ready').textContent = counts.ready;
  document.getElementById('pf-published').textContent = counts.published;
  document.getElementById('pf-rejected').textContent = counts.rejected;

  // Header pending = found + summarising + ready
  document.getElementById('hs-pending').textContent = counts.found + counts.summarising + counts.ready;
}

function renderAgents(logs) {
  const agents = {
    scout: { time: null, count: 0 },
    quill: { time: null, count: 0 },
    editor: { time: null, countPub: 0, countRej: 0 },
    promoter: { time: null, count: 0 },
  };
  const todayISO = todayStart();
  if (logs) {
    for (const l of logs) {
      const a = (l.agent || '').toLowerCase();
      const isToday = l.created_at && l.created_at >= todayISO;
      if (a === 'scout') {
        if (!agents.scout.time) agents.scout.time = l.created_at;
        if (isToday) agents.scout.count++;
      } else if (a === 'quill') {
        if (!agents.quill.time) agents.quill.time = l.created_at;
        if (isToday) agents.quill.count++;
      } else if (a === 'editor') {
        if (!agents.editor.time) agents.editor.time = l.created_at;
        if (isToday) {
          const act = (l.action || '').toLowerCase();
          if (act.includes('publish')) agents.editor.countPub++;
          else if (act.includes('reject')) agents.editor.countRej++;
          else agents.editor.countPub++;
        }
      } else if (a === 'promoter') {
        if (!agents.promoter.time) agents.promoter.time = l.created_at;
        if (isToday) agents.promoter.count++;
      }
    }
  }
  document.getElementById('as-scout-time').textContent = timeAgo(agents.scout.time);
  document.getElementById('as-scout-count').textContent = agents.scout.count;
  document.getElementById('as-quill-time').textContent = timeAgo(agents.quill.time);
  document.getElementById('as-quill-count').textContent = agents.quill.count;
  document.getElementById('as-editor-time').textContent = timeAgo(agents.editor.time);
  document.getElementById('as-editor-count').textContent = \`\${agents.editor.countPub} / \${agents.editor.countRej}\`;
  document.getElementById('as-promoter-time').textContent = timeAgo(agents.promoter.time);
  document.getElementById('as-promoter-count').textContent = agents.promoter.count;
}

async function renderStats(articles, allDrafts) {
  // Total published (count from articles table)
  const { count: totalPublished } = await api('/rest/v1/articles?select=id', { count: true });
  document.getElementById('st-total').textContent = totalPublished ?? '—';

  // Today's articles
  const todayISO = todayStart();
  const { count: todayCount } = await api(\`/rest/v1/articles?select=id&published_at=gte.\${todayISO}\`, { count: true });
  document.getElementById('st-today').textContent = todayCount ?? 0;
  document.getElementById('hs-today').textContent = todayCount ?? 0;
  document.getElementById('hs-published').textContent = totalPublished ?? '—';

  // Average weirdness
  if (articles && articles.length > 0) {
    const scores = articles.filter(a => a.weirdness_score != null).map(a => a.weirdness_score);
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
    document.getElementById('st-weird').textContent = avg;
  }

  // Rejection rate
  if (allDrafts && allDrafts.length > 0) {
    const rejected = allDrafts.filter(d => d.status === 'rejected').length;
    const total = allDrafts.length;
    const rate = total > 0 ? ((rejected / total) * 100).toFixed(0) : 0;
    document.getElementById('st-reject').textContent = rate + '%';
  }

  // Throughput — articles per day (from first article to now)
  if (articles && articles.length > 0 && totalPublished) {
    const { data: oldest } = await api('/rest/v1/articles?select=published_at&order=published_at.asc&limit=1');
    if (oldest && oldest.length > 0) {
      const firstDate = new Date(oldest[0].published_at);
      const days = Math.max(1, (Date.now() - firstDate.getTime()) / 86400000);
      document.getElementById('st-throughput').textContent = (totalPublished / days).toFixed(1);
    }
  }
}

// ── Main Refresh ──
async function refresh() {
  try {
    const [articlesRes, draftsRes, logsRes, allDraftsRes] = await Promise.all([
      api('/rest/v1/articles?select=*&order=published_at.desc&limit=20'),
      api('/rest/v1/article_drafts?select=*&status=neq.published&order=created_at.desc&limit=30'),
      api('/rest/v1/agent_log?select=*&order=created_at.desc&limit=50'),
      api('/rest/v1/article_drafts?select=id,status&order=created_at.desc&limit=500'),
    ]);

    renderArticlesTable(articlesRes.data);
    renderDraftsTable(draftsRes.data);
    renderLogFeed(logsRes.data);
    renderPipeline(allDraftsRes.data);
    renderAgents(logsRes.data);
    await renderStats(articlesRes.data, allDraftsRes.data);

    document.getElementById('last-refresh').textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (err) {
    console.error('Dashboard refresh error:', err);
  }
}

// ── Init ──
refresh();
setInterval(refresh, REFRESH_MS);
</script>
</body>
</html>
`); };