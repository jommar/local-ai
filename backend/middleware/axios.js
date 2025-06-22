const axios = require('axios');

module.exports = (req, res, next) => {
  try {
    req.context = req.context || {};
    req.context.axios = axios;
    next();
  } catch (e) {
    console.error('SearXNG Middleware error:', e);
    res.status(500).send({ error: e.message || 'Internal server error' });
  }
};
