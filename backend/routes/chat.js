const express = require('express');
const router = express.Router();
const { processChat, getChatHistory } = require('../services/chat.service.js');

router.post('/', async (req, res) => {
  const { prompt, uuid, model } = req.body || req.query;

  if (!prompt) return res.status(400).send({ error: 'Prompt is required.' });

  req.context.chat = {
    prompt,
    uuid,
    model,
  };

  if (!prompt) {
    return res.status(400).send({ error: 'Prompt is required.' });
  }

  try {
    const result = await processChat({ context: req.context });
    res.send(result);
  } catch (err) {
    console.error('❌ Chat route error:', err.message);
    res.status(500).send({ error: 'Failed to process chat.' });
  }
});

router.get('/:uuid', async (req, res) => {
  req.context.chat = { uuid: req.params.uuid };
  const r = getChatHistory({ context: req.context });
  res.send(r);
});

module.exports = router;
