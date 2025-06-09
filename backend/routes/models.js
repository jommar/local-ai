const express = require("express");
const router = express.Router();
const { getOllamaModels } = require("../services/models.service.js");

router.get("/", async (req, res) => {
  const models = await getOllamaModels({ context: req.context });
    res.send(models.models);
});

module.exports = router;
