const express = require('express');
const router = express.Router();
const { processChat, getChatHistory, getChats, deleteChat, renameChat } = require('../services/chat.service.js');

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
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Failed to process chat.' });
  }
});

router.get('/get', (req, res) => {
  try {
    const chats = getChats({ context: req.context });
    res.send(chats);
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Could not get chats.' });
  }
});

router.get('/:uuid', async (req, res) => {
  req.context.chat = { uuid: req.params.uuid };
  const r = getChatHistory({ context: req.context });
  res.send(r);
});

router.delete('/:uuid', async (req, res) => {
  try {
    await deleteChat({ context: req.context, file: req.params.uuid });
    res.send({ done: true });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Could not delete chat.' });
  }
});

router.put('/:uuid', async (req, res) => {
  try {
    await renameChat({ context: req.context, originalName: req.params.uuid, newName: req.body.name });
    res.send({ done: true });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Could not rename chat.' });
  }
});

module.exports = router;
