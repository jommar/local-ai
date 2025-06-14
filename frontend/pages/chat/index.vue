<template>
  <v-container class="w-100 h-100 pa-0" style="position: relative">
    <!-- Scrollable content -->
    <div
      class="h-100 overflow-y-auto d-flex flex-column justify-end px-4"
      style="padding-bottom: 85px; padding-top: 75px"
    >
      <!-- Chat messages container -->
      <div
        class="h-100 w-100 d-flex flex-column align-center justify-center text-grey rounded-lg pa-6"
        v-if="!messages.length"
      >
        <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-message-text-outline</v-icon>

        <div class="text-center max-width-500">
          <div class="text-h5 font-weight-medium mb-2">No conversations yet</div>
          <div class="text-body-1 mb-1">It’s quiet in here… but that’s about to change.</div>
          <div class="text-body-2 text-grey-darken-1">
            Start your first message to begin a new conversation. Whether it's coding help, writing advice, or just
            brainstorming ideas — I’ve got your back!
          </div>
        </div>
      </div>

      <div class="d-flex flex-column align-end w-100" v-else>
        <template v-for="(message, messageIndex) in messages" :key="messageIndex">
          <MarkDown
            class="mb-2 rounded-lg py-2 px-4"
            :class="[messageClasses[message.role]]"
            style="max-width: 75%"
            :content="message.content"
            v-if="message.role === 'assistant' && message.content?.trim()"
          ></MarkDown>
          <div
            v-if="message.role === 'user'"
            class="mb-2 rounded-lg py-2 px-4"
            :class="[messageClasses[message.role]]"
            style="max-width: 75%; white-space: pre-wrap"
          >
            {{ message.content }}
          </div>
        </template>
        <div class="mb-2 rounded-lg pa-2" :class="messageClasses.assistant" v-if="isFetching || isThinking">
          <v-progress-circular v-if="isFetching" indeterminate color="primary"></v-progress-circular>
          <div v-if="isThinking">Thinking...</div>
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
          <template #append-inner>
            <v-btn color="primary" variant="text" icon="mdi-send" @click="send" />
          </template>
          <template #prepend>
            <ChatTools />
          </template>
        </v-textarea>
      </v-container>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('');
const messages = ref([]);
const scrollAnchor = ref(null);
const isFetching = ref(false);
const isThinking = ref(false);

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

  let assistantText = '';
  addMessage({ role: 'assistant', content: '' });

  await api.postStream('/chat', { prompt, uuid, stream: true }, r => {
    const { delta, uuid } = r;

    isFetching.value = false;
    isThinking.value = delta === '';

    useRouter().replace({ query: { uuid } });
    assistantText += delta;
    updateLastAssistantMessage(assistantText);
  });

  isFetching.value = false;
  isThinking.value = false;

  if (reloadChats) bus.emit('chat:reload');
};

const updateLastAssistantMessage = content => {
  const last = messages.value.findLast(m => m.role === 'assistant');
  if (last) last.content = content;
  scrollToBottom();
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
