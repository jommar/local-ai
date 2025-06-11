const axios = require('axios');
const { ollama } = require('../config.json');

if (!ollama?.host || !ollama?.port) {
  throw new Error('Ollama config is missing host or port');
}

const ollamaClient = axios.create({
  baseURL: `${ollama.host}:${ollama.port}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = (req, res, next) => {
  if (!req?.headers?.model) return res.status(400).send({ error: 'Missing model in headers' });

  try {
    req.context = req.context || {};
    req.context.ollama = ollamaClient;
    req.context.model = req.headers.model;
    next();
  } catch (e) {
    console.error('Middleware error:', e);
    res.status(500).send({ error: e.message || 'Internal server error' });
  }
};
