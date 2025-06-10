<template>
  <v-container class="w-100 h-100 pa-0" style="position: relative">
    <!-- Scrollable content -->
    <div
      class="h-100 overflow-y-auto d-flex flex-column justify-end px-4"
      style="padding-bottom: 85px; padding-top: 75px"
    >
      <!-- Chat messages container -->
      <div class="d-flex flex-column align-end w-100">
        <template v-for="(message, messageIndex) in messages" :key="messageIndex">
          <MarkDown
            class="mb-2 rounded-lg py-2 px-4"
            :class="[messageClasses[message.role]]"
            style="max-width: 75%"
            :content="message.content"
            v-if="message.role === 'assistant'"
          ></MarkDown>
          <div
            v-else
            class="mb-2 rounded-lg py-2 px-4"
            :class="[messageClasses[message.role]]"
            style="max-width: 75%; white-space: pre-wrap"
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
    <div class="position-fixed bottom-0 left-0 right-0 px-4 bg-grey-darken-4">
      <v-container>
        <v-textarea
          v-model="message"
          label="Type a message..."
          class="w-100"
          hide-details
          auto-grow
          rows="1"
          autocomplete="off"
          @keydown="handleKeydown"
          max-rows="8"
        >
          <template #append>
            <v-btn color="primary" variant="text" icon="mdi-send" @click="send" />
          </template>
        </v-textarea>
      </v-container>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
const { $bus } = useNuxtApp();

const message = ref('');
const messages = ref([]);
const scrollAnchor = ref(null);
const isFetching = ref(false);
const models = ref([]);
const isSelectingModel = ref(false);

const messageClasses = computed(() => {
  return {
    assistant: 'bg-blue-grey-darken-4 align-self-start',
    user: 'bg-grey-darken-4 align-self-end',
  };
});

const scrollToBottom = () => {
  nextTick(() => {
    scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

const loadChatByUuid = async uuid => {
  if (!uuid) return;
  const res = await api.get(`/chat/${uuid}`);

  if (!res.uuid || res.uuid !== uuid) return;
  messages.value = res.messages;
};

const addMessage = message => {
  messages.value.push(message);
  scrollToBottom();
};

const send = async () => {
  const uuid = useRoute().query.uuid;
  const reloadChats = !messages.value.length;

  addMessage({ role: 'user', content: message.value });

  const prompt = message.value;
  message.value = '';

  isFetching.value = true;
  const res = await api.post('/chat', {
    prompt,
    uuid,
  });
  isFetching.value = false;

  addMessage({ role: 'assistant', content: res.message.content });

  if (!uuid) useRouter().replace({ query: { uuid: res.uuid } });
  if (reloadChats) $bus.emit('chat:reload');
};

const handleKeydown = e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
};

onMounted(async () => {
  const uuid = useRoute().query.uuid;
  await Promise.all([loadChatByUuid(uuid)]);
  scrollToBottom();
});
</script>
