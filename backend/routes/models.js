const express = require('express');
const router = express.Router();
const { getOllamaModels, getSavedOllamaModels } = require('../services/models.service.js');

router.get('/', async (req, res) => {
  try {
    const models = await getSavedOllamaModels({ context: req.context });
    res.send(models.models);
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Failed to get saved models.' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const models = await getOllamaModels({ context: req.context });
    res.send(models);
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Failed to get model list.' });
  }
});

module.exports = router;
