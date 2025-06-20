<template>
  <v-container>
    <div>
      <v-btn :color="isThinking ? 'green' : 'red'" block size="small" @click="toggleThinking">
        <v-icon start> mdi-brain</v-icon>
        Thinking {{ isThinking ? 'Enabled' : 'Disabled' }}
      </v-btn>
    </div>

    <section class="my-4">
      <p class="text-caption mb-2 text-center">System-level instructions that influence how the AI responds.</p>
      <v-textarea v-model="systemMessage" label="System Messages" rows="3">
        <template #append-inner>
          <v-btn
            color="primary"
            variant="text"
            @click="onSaveSysMessages"
            icon="mdi-content-save"
            size="x-small"
          ></v-btn>
        </template>
      </v-textarea>

      <v-btn block color="white" size="x-small" @click="showInstructions">
        <v-icon start>mdi-information</v-icon>
        More System Instructions
      </v-btn>

      <v-list density="compact">
        <v-list-item
          v-for="(item, index) in sysMessagesList"
          :key="item.message"
          @click="toggleEnabledFlag(index)"
          :class="{ 'bg-green-darken-4': item.enabled }"
        >
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-list-item-title class="text-body-2 text-truncate" v-bind="props" style="max-width: 200px">
                {{ item.message }}
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
    </section>
  </v-container>
</template>
<script setup>
const systemMessage = ref('');
const sysMessagesList = ref([]);
const isThinking = ref(false);

const onSaveSysMessages = () => {
  if (!systemMessage.value) return;
  loasSysMessages();

  sysMessagesList.value.push({ enabled: true, message: systemMessage.value?.trim() });
  localStorage.setItem(LOCALSTORAGE_KEYS.SYS_MESSAGES, JSON.stringify(sysMessagesList.value));

  loasSysMessages();

  systemMessage.value = '';
};

const loasSysMessages = () => {
  const messages = localStorage.getItem(LOCALSTORAGE_KEYS.SYS_MESSAGES) || '[]';
  sysMessagesList.value = JSON.parse(messages).map(m => {
    if (typeof m === 'string') return { enabled: true, message: m };
    return m;
  });
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

const toggleEnabledFlag = i => {
  const item = sysMessagesList.value[i];

  item.enabled = !item.enabled;

  localStorage.setItem(LOCALSTORAGE_KEYS.SYS_MESSAGES, JSON.stringify(sysMessagesList.value));
};

onMounted(() => {
  loasSysMessages();
  loadThinking();
});
</script>
