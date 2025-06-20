<template>
  <v-container>
    <v-textarea v-model="systemMessage" label="System Messages" rows="3"></v-textarea>
    <div class="d-flex justify-end align-center">
      <v-btn color="primary" variant="text" @click="onSaveSysMessages" icon="mdi-content-save" size="x-small"></v-btn>
    </div>

    <div class="mt-4">
      <v-btn block variant="text" size="x-small" @click="showInstructions">
        <v-icon start>mdi-information</v-icon>
        System Instructions
      </v-btn>
      <v-btn
        :class="isThinking ? 'text-green' : 'text-red'"
        block
        variant="text"
        size="x-small"
        @click="toggleThinking"
      >
        <v-icon start> mdi-brain</v-icon>
        Thinking
      </v-btn>
    </div>

    <v-list density="compact">
      <v-list-item v-for="(item, index) in sysMessagesList" :key="`${item}-${index}`">
        <v-tooltip location="top">
          <template #activator="{ props }">
            <v-list-item-title class="text-body-2 text-truncate" v-bind="props" style="max-width: 200px">
              {{ item }}
            </v-list-item-title>
          </template>
          <span>{{ item }}</span>
        </v-tooltip>

        <template #append>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="red"
            :aria-label="`Delete message ${index + 1}`"
            @click="deleteSysMessages(index)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>
<script setup>
const systemMessage = ref('');
const sysMessagesList = ref([]);
const isThinking = ref(false);

const onSaveSysMessages = () => {
  if (!systemMessage.value) return;
  loasSysMessages();

  sysMessagesList.value.push(systemMessage.value?.trim());
  localStorage.setItem(LOCALSTORAGE_KEYS.SYS_MESSAGES, JSON.stringify(sysMessagesList.value));

  loasSysMessages();

  systemMessage.value = '';
};

const loasSysMessages = () => {
  const messages = localStorage.getItem(LOCALSTORAGE_KEYS.SYS_MESSAGES) || '[]';
  sysMessagesList.value = JSON.parse(messages);
};

const deleteSysMessages = index => {
  sysMessagesList.value.splice(index, 1);
  localStorage.setItem(LOCALSTORAGE_KEYS.SYS_MESSAGES, JSON.stringify(sysMessagesList.value));

  loasSysMessages();
};

const showInstructions = async () => {
  const module = await import('@/components/chat/CustomizeChat.vue');

  bus.emit('dialog:open', {
    component: markRaw(module.default),
  });
};

const toggleThinking = () => {
  isThinking.value = !isThinking.value;
  localStorage.setItem(LOCALSTORAGE_KEYS.THINK, isThinking.value);
};

const loadThinking = () => {
  isThinking.value = localStorage.getItem(LOCALSTORAGE_KEYS.THINK) === 'true';
};

onMounted(() => {
  loasSysMessages();
  loadThinking();
});
</script>
