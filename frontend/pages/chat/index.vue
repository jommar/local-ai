<template>
  <v-container fluid class="w-100 h-100 pa-0" style="position: relative">
    <!-- Scrollable content -->
    <div
      class="h-100 overflow-y-auto d-flex flex-column justify-end px-4"
      style="padding-bottom: 85px; padding-top: 55px"
    >
      <div
        class="position-fixed top-0 left-0 right-0 px-4 py-2 bg-grey-darken-4 text-blue d-flex align-center justify-end"
      >
        <v-select
          v-model="currentModel"
          :items="[...models, { name: 'Get more models', model: 'get-more' }]"
          item-title="name"
          item-value="model"
          density="compact"
          hide-details
          variant="outlined"
          style="max-width: 200px"
          @update:model-value="onModelChange"
        />

        <!-- new chat button -->
        <v-btn icon="mdi-plus" class="ml-2" size="small" @click="newChat"></v-btn>
      </div>

      <!-- Chat messages container -->
      <div class="d-flex flex-column align-end w-100">
        <template v-for="(message, messageIndex) in messsages" :key="messageIndex">
          <MarkDown
            class="mb-2 rounded-lg py-2 px-4"
            :class="[messageClasses[message.role]]"
            style="max-width: 70vw"
            :content="message.content"
            v-if="message.role === 'assistant'"
          ></MarkDown>
          <div
            v-else
            class="mb-2 rounded-lg py-2 px-4"
            :class="[messageClasses[message.role]]"
            style="max-width: 70vw; white-space: pre-wrap"
          >
            {{ message.content }}
          </div>
        </template>
        <div class="mb-2 rounded-lg pa-2" :class="messageClasses.assistant" v-if="isFetching">
          <v-progress-circular v-if="isFetching" indeterminate color="primary"></v-progress-circular>
        </div>
        <div ref="scrollAnchor"></div>
      </div>
    </div>

    <!-- Fixed input bar -->
    <div class="position-fixed bottom-0 left-0 right-0 px-4 py-2 bg-grey-darken-4">
      <v-textarea
        v-model="message"
        label="Type a message..."
        class="w-100"
        hide-details
        auto-grow
        rows="1"
        autocomplete="off"
        @keydown="handleKeydown"
      >
        <template #append>
          <v-btn icon="mdi-send" @click="send" />
        </template>
      </v-textarea>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('');
const messsages = ref([]);
const scrollAnchor = ref(null);
const isFetching = ref(false);
const models = ref([]);
const isSelectingModel = ref(false);

const currentModel = ref('llama3.2:latest');

const messageClasses = computed(() => {
  return {
    assistant: 'bg-blue-grey-darken-4 align-self-start',
    user: 'bg-grey-darken-4 align-self-end',
  };
});

const newChat = () => {
  window.location.href = '/chat';
};

const scrollToBottom = () => {
  nextTick(() => {
    scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

const loadChatByUuid = async uuid => {
  if (!uuid) return;
  const res = await api.get(`/chat/${uuid}`);

  if (!res.uuid || res.uuid !== uuid) return;
  messsages.value = res.messages;
  currentModel.value = res.model;
};

const addMessage = message => {
  messsages.value.push(message);
  scrollToBottom();
};

const send = async () => {
  const uuid = useRoute().query.uuid;

  addMessage({ role: 'user', content: message.value });

  const prompt = message.value;
  message.value = '';

  isFetching.value = true;
  const res = await api.post('/chat', {
    prompt,
    uuid,
    model: currentModel.value,
  });
  isFetching.value = false;

  addMessage({ role: 'assistant', content: res.message.content });

  if (!uuid) useRouter().replace({ query: { uuid: res.uuid } });
};

const loadModels = async () => {
  const res = await api.get('/models');
  models.value = res;
};

const onModelChange = value => {
  currentModel.value = value;
};

const handleKeydown = e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
};

onMounted(async () => {
  const uuid = useRoute().query.uuid;
  await Promise.all([loadChatByUuid(uuid), loadModels()]);
  scrollToBottom();
});
</script>
