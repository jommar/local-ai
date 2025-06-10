const routes = ['chat', 'models', 'settings'];

module.exports = app => {
  routes.forEach(r => app.use(`/${r}`, require(`./${r}`)));
};
