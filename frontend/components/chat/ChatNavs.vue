<template>
  <div class="px-4 text-blue d-flex align-center justify-end" v-if="models.length">
    <v-select
      v-model="currentModel"
      :items="models"
      item-title="name"
      item-value="model"
      density="compact"
      hide-details
      variant="outlined"
      style="max-width: 300px"
      @update:model-value="onModelChange"
    />

    <v-btn icon="mdi-eye" class="ml-2" size="small" @click="viewAllModels"></v-btn>
    <v-btn icon="mdi-file-plus" class="ml-2" size="small" @click="newChat"></v-btn>
  </div>
</template>

<script setup>
const { $bus } = useNuxtApp();
const models = ref([]);
const currentModel = ref('');
const newChat = () => {
  window.location.href = '/chat';
};
const onModelChange = value => {
  currentModel.value = value;
  setCurrentModel();
};
const getModels = async () => {
  const res = await api.get('/models');
  models.value = res;
};
const setCurrentModel = () => {
  if (!currentModel.value) currentModel.value = localStorage.getItem(LOCALSTORAGE_KEYS.MODEL);

  localStorage.setItem(LOCALSTORAGE_KEYS.MODEL, currentModel.value);
};

const viewAllModels = async () => {
  const module = await import('@/components/chat/ModelsList.vue');

  $bus.emit('dialog:open', {
    component: markRaw(module.default),
  });
};
onMounted(async () => {
  await getModels();
  setCurrentModel();
});
</script>
