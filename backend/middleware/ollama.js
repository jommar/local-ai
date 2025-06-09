const axios = require("axios");
const { ollama } = require("../config.json");

const ollamaClient = axios.create({
  baseURL: `${ollama.host}:${ollama.port}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = (req, res, next) => {
  req.context.ollama = ollamaClient;
  req.context.model = req.model || "llama3.2:latest";
  next();
};
