<template>
  <div class="px-4 text-blue d-flex align-center justify-end">
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
};
const getModels = async () => {
  const res = await api.get('/models');
  if (res.length === 1) currentModel.value = res[0].model;
  setCurrentModel();
  models.value = res;
};
const setCurrentModel = () => {
  return 'set model';
};
onMounted(() => {
  getModels();
});
</script>
