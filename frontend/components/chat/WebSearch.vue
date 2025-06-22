<template>
  <div>
    <div class="position-absolute" style="top: -10px; right: -10px">
      <v-tooltip :text="tooltipText" location="top">
        <template #activator="{ props }">
          <v-icon v-bind="props" color="green" @click="copySearchQuery" style="cursor: pointer"> mdi-web </v-icon>
        </template>
      </v-tooltip>
    </div>

    <div class="d-flex flex-wrap ga-2">
      <v-chip
        color="blue"
        size="x-small"
        variant="outlined"
        :href="src"
        target="_blank"
        v-for="src of config.sources"
        :key="src"
        >{{ src }}</v-chip
      >
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const { config } = defineProps(['config']);
const tooltipText = ref(config?.searchQuery || 'Web search used');

const copySearchQuery = async () => {
  if (!config?.searchQuery) return;

  try {
    await navigator.clipboard.writeText(config.searchQuery);
    tooltipText.value = 'Copied!';
    setTimeout(() => {
      tooltipText.value = config.searchQuery;
    }, 1000);
  } catch (err) {
    console.error('Clipboard copy failed', err);
  }
};
</script>
