<template>
  <div>
    <div class="pa-4 text-h6 text-blue"></div>
    <v-list slim nav variant="flat">
      <v-list-subheader class="text-blue text-body-1">Chat History ({{ chats.length }})</v-list-subheader>
      <v-list-item
        v-for="(chat, chatIndex) in chats"
        :key="chatIndex"
        @click="onClick(chat)"
        density="compact"
        :title="chat.text"
        :subtitle="parseDate(chat.updatedAt)"
      >
      </v-list-item>
    </v-list>
  </div>
</template>
<script setup>
const { $bus } = useNuxtApp();
const chats = ref([]);
const getChatHistory = async () => {
  chats.value = [];
  const history = await api.get('/chat/get');
  chats.value = history;
};
const onClick = chat => {
  window.location.href = `/chat?uuid=${chat.value}`;
};
const parseDate = date => {
  const now = new Date();
  const target = new Date(date);

  const isSameDay =
    now.getFullYear() === target.getFullYear() &&
    now.getMonth() === target.getMonth() &&
    now.getDate() === target.getDate();

  return isSameDay
    ? target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : target.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

onMounted(() => {
  getChatHistory();
  $bus.on('chat:reload', getChatHistory);
});
</script>
