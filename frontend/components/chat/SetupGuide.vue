<template>
  <div>
    <v-alert type="info" variant="tonal" class="mb-4" density="comfortable" border="start" border-color="primary">
      <div class="font-weight-medium">Ollama is required</div>
      <div>Please install Ollama on your machine before continuing.</div>
    </v-alert>

    <v-list lines="one">
      <v-list-item href="https://ollama.com/download" target="_blank" prepend-icon="mdi-download">
        <v-list-item-title>Download Ollama</v-list-item-title>
      </v-list-item>

      <v-list-item
        href="https://github.com/ollama/ollama?tab=readme-ov-file#quickstart"
        target="_blank"
        prepend-icon="mdi-github"
      >
        <v-list-item-title>Setup Guide on GitHub</v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>
