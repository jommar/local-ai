const cheerio = require('cheerio');

module.exports = (req, res, next) => {
  try {
    req.context = req.context || {};
    req.context.cheerio = cheerio;
    next();
  } catch (e) {
    console.error('Cheerio Middleware error:', e);
    res.status(500).send({ error: e.message || 'Internal server error' });
  }
};
