// Returns available categories

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📰' },
  { id: 'animals', label: 'Animals', emoji: '🦔' },
  { id: 'viral', label: 'Viral', emoji: '🔥' },
  { id: 'sport', label: 'Sport', emoji: '⚽' },
  { id: 'tech', label: 'Tech', emoji: '🤖' },
  { id: 'property', label: 'Property', emoji: '🏠' },
  { id: 'food', label: 'Food', emoji: '🍔' },
  { id: 'crime', label: 'Crime', emoji: '🚨' },
  { id: 'world', label: 'World', emoji: '🌍' },
];

function handler(req, res) {
  return res.status(200).json({ categories: CATEGORIES });
}

module.exports = handler;
module.exports.default = handler;
