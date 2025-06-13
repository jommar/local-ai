<template>
  <div class="d-flex justify-end align-center">
    <v-menu location="bottom">
      <template #activator="{ props }">
        <v-btn v-bind="props" size="small" icon variant="text" color="white" :title="'AI Tools'">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="option in options"
          :key="option.name"
          @click="option.onClick"
          :prepend-icon="option.icon"
          :class="option.classNames"
        >
          <v-list-item-title>{{ option.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
const options = ref([
  { name: 'System Instructions', onClick: () => onSystemInstructionsClick(), icon: 'mdi-information' },
  { name: 'Think', onClick: () => onToggleThink() },
]);
const onToggleThink = () => {
  const isThinking = localStorage.getItem(LOCALSTORAGE_KEYS.THINK) === 'true';
  localStorage.setItem(LOCALSTORAGE_KEYS.THINK, !isThinking);
  setThinkIcon();
};

const onSystemInstructionsClick = async () => {
  const module = await import('@/components/chat/CustomizeChat.vue');

  bus.emit('dialog:open', {
    component: markRaw(module.default),
  });
};

const setThinkIcon = () => {
  const isThinking = localStorage.getItem(LOCALSTORAGE_KEYS.THINK) === 'true';
  const found = options.value.find(o => o.name === 'Think');
  if (!found) return;
  found.icon = isThinking ? 'mdi-check' : 'mdi-close';
  found.classNames = `text-${isThinking ? 'green' : 'red'}-darken-1`;
};

onMounted(() => {
  setThinkIcon();
});
</script>
