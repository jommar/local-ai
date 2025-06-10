const config = require('../config.json');

const getSavedOllamaModels = async ({ context }) => {
  const modelsResponse = await context.ollama.get('/tags');
  return modelsResponse.data;
};

const getOllamaModels = async ({ context }) => {
  const modelsResponse = await context.ollama.get('/tags');
  const models = config?.ollama?.models || [];
  const savedModels = modelsResponse.data?.models;
  const savedModelsById = savedModels.reduce((acc, model) => {
    acc[model.name.replace(':latest', '')] = { model: model.model, name: model.name };
    return acc;
  }, {});

  const mappedModels = models
    .map(m => {
      const nameSplit = m.download.split(' ');
      return {
        ...m,
        name: nameSplit[nameSplit.length - 1],
        active: !!savedModelsById[nameSplit[nameSplit.length - 1]],
      };
    })
    .sort((a, b) => {
      if (a.active && !b.active) return -1;
      else if (!a.active && b.active) return 1;
      else return a.name.localeCompare(b.name);
    });

  return mappedModels;
};

module.exports = { getSavedOllamaModels, getOllamaModels };
