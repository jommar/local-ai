const express = require('express');
const router = express.Router();
const { saveSettings, getSettings } = require('../services/settings.service.js');

router.post('/', async (req, res) => {
  try {
    const r = await saveSettings({ context: req.context, body: req.body });
    res.send(r);
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Could not save settings.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const r = await getSettings({ context: req.context });
    res.send(r);
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'Could not get settings.' });
  }
});

module.exports = router;
