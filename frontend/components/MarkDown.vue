<template>
  <div v-if="content.length > 0" class="markdown-body" v-html="renderMarkdown(content)"></div>
</template>

<script setup>
import { marked } from 'marked';
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  content: String,
});

const renderMarkdown = markdownText => {
  return marked(markdownText?.trim() || '');
};
</script>

<style>
.markdown-body {
  font-size: 0.95rem;
  line-height: 1.6;
  word-break: break-word;
}

/* Headings */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin: 1em 0 0.5em;
  font-weight: bold;
  color: #90caf9; /* Optional: use Vuetify theme if needed */
}

/* Paragraph */
.markdown-body p {
  margin: 0.5em 0;
}

/* Code blocks */
.markdown-body code {
  font-family: monospace;
  background-color: #263238;
  color: #fbc02d;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
}

/* Preformatted (multi-line) */
.markdown-body pre {
  background-color: #1e1e1e;
  color: #eee;
  padding: 1em;
  overflow-x: auto;
  border-radius: 6px;
  margin: 1em 0;
}

/* Lists */
.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-body li {
  margin-bottom: 0.3em;
}

/* Blockquotes */
.markdown-body blockquote {
  border-left: 4px solid #2196f3;
  padding-left: 1em;
  color: #bbb;
  font-style: italic;
  margin: 1em 0;
}
</style>
