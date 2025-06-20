<template>
  <div v-if="content.length > 0" class="markdown-body" v-html="renderedHtml" ref="markdownContainer"></div>
</template>

<script setup>
import { marked } from 'marked';
import { watch } from 'vue';

const props = defineProps({
  content: String,
});

const renderedHtml = ref('');
const markdownContainer = ref(null);

const renderMarkdown = markdownText => {
  return marked(markdownText?.trim() || '');
};

// Copy-to-clipboard logic
const enhanceCodeBlocks = () => {
  const blocks = markdownContainer.value?.querySelectorAll('pre');
  if (!blocks) return;

  blocks.forEach(block => {
    // Avoid inserting multiple buttons if re-rendered
    if (block.querySelector('.copy-btn')) return;

    const button = document.createElement('button');
    button.innerHTML = SVG.COPY;
    button.className = 'copy-btn';
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
    `;
    button.setAttribute('title', 'Copy to clipboard');

    button.onclick = () => {
      navigator.clipboard.writeText(block.textContent.trim());
      const svg = button.querySelector('svg');

      if (svg) {
        const fillColor = svg.getAttribute('fill');
        svg.setAttribute('fill', '#4CAF50');
        setTimeout(() => svg.setAttribute('fill', fillColor), 500);
      }
    };

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(button);
    wrapper.appendChild(block);
  });
};

// Watch for content change and enhance after DOM update
watch(
  () => props.content,
  newVal => {
    renderedHtml.value = renderMarkdown(newVal);
    nextTick(() => enhanceCodeBlocks());
  },
  { immediate: true }
);
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
