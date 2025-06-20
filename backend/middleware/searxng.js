const axios = require('axios');
const { searxng } = require('../config.json');

if (!searxng?.host || !searxng?.port) {
  throw new Error('SearXNG config is missing host or port');
}

const searxngClient = axios.create({
  baseURL: `${searxng.host}:${searxng.port}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0 (Node.js App)',
  },
});

module.exports = (req, res, next) => {
  try {
    req.context = req.context || {};
    req.context.searxng = searxngClient;
    next();
  } catch (e) {
    console.error('SearXNG Middleware error:', e);
    res.status(500).send({ error: e.message || 'Internal server error' });
  }
};
