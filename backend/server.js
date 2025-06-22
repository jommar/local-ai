const express = require('express');
const config = require('./config.json');
const ollama = require('./middleware/ollama');
const searxng = require('./middleware/searxng');
const axios = require('./middleware/axios');
const cheerio = require('./middleware/cheerio');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.context = {
    root: path.resolve(__dirname),
  };
  next();
});

app.use(ollama);
app.use(searxng);
app.use(axios);
app.use(cheerio);

require('./routes')(app);

app.listen(config.port, () => {
  console.log(`🚀 Server is running at ${config.host}:${config.port}`);
});
