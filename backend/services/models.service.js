const getOllamaModels = async ({ context }) => {
  const modelsResponse = await context.ollama.get("/tags");
  return modelsResponse.data;
};

module.exports = { getOllamaModels };
