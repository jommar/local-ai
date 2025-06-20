<template>
  <v-container>
    <v-textarea v-model="systemMessage" label="System Messages" rows="3"></v-textarea>
    <div class="d-flex justify-end">
      <v-btn color="primary" @click="onSaveSysMessages" icon="mdi-content-save" size="x-small"></v-btn>
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

const onSaveSysMessages = () => {
  loasSysMessages();

  sysMessagesList.value.push(systemMessage.value);
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

onMounted(() => {
  loasSysMessages();
});
</script>
