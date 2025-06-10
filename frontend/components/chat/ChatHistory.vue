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
        <template #append>
          <v-btn icon="mdi-pencil" size="x-small" variant="text" @click.stop="renameChat(chat)"></v-btn>
          <v-btn icon="mdi-delete" size="x-small" variant="text" color="red" @click.stop="deleteChat(chat)"></v-btn>
        </template>
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

const deleteChat = async chat => {
  const isSelf = useRoute()?.query?.uuid === chat.value;
  await api.delete(`/chat/${chat.value}`);
  if (isSelf) {
    window.location.href = `/chat`;
    return;
  }
  await getChatHistory();
};

const renameChat = async chat => {
  const module = await import('@/components/chat/RenameChat.vue');

  $bus.emit('dialog:open', {
    component: markRaw(module.default),
    props: { chat },
  });
};

onMounted(() => {
  getChatHistory();
  $bus.on('chat:reload', getChatHistory);
});
</script>
