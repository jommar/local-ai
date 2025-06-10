<template>
  <div class="px-4 text-blue d-flex align-center justify-end">
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

    <!-- new chat button -->
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
  setCurrentModel();
};
const setCurrentModel = () => {
  currentModel.value = localStorage.getItem(LOCALSTORAGE_KEYS.MODEL);

  if (!currentModel.value) {
    const model = models.value[0].model;
    localStorage.setItem(LOCALSTORAGE_KEYS.MODEL, model);
    currentModel.value = model;
    return;
  }

  currentModel.value = localStorage.getItem(LOCALSTORAGE_KEYS.MODEL);
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
