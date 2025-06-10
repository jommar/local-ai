const express = require('express');
const config = require('./config.json');
const ollama = require('./middleware/ollama');
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

require('./routes')(app);

app.listen(config.port, () => {
  console.log(`🚀 Server is running at ${config.host}:${config.port}`);
});
