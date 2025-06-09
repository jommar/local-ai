const routes = ["chat", "models"];

module.exports = (app) => {
  routes.forEach((r) => app.use(`/${r}`, require(`./${r}`)));
};
