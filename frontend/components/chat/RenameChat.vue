<template>
  <v-card>
    <v-card-title>Rename Chat</v-card-title>
    <v-card-text>
      <v-text-field v-model="name"></v-text-field>
    </v-card-text>
    <v-card-actions>
      <v-btn color="green" @click="handleRename">Rename</v-btn>
      <v-btn color="red" @click="handleCancel">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script setup>
const { $bus } = useNuxtApp();
const name = ref(null);
const props = defineProps(['chat']);

const handleCancel = () => {
  $bus.emit('dialog:close');
};

const handleRename = async () => {
  const isSameChat = useRoute().query?.uuid === props.chat.value;
  const cleanName = name.value?.replaceAll(' ', '-'); // space to -
  await api.put(`/chat/${props.chat.value}`, { name: cleanName });
  $bus.emit('chat:reload');
  $bus.emit('dialog:close');
  useRoute().query;

  if (isSameChat) window.location.href = `/chat?uuid=${cleanName}`;
};

onMounted(() => {
  name.value = props.chat.value;
});
</script>
