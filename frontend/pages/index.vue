<template>
  <v-app>
    <v-main class="landing-page">
      <div class="d-flex flex-column align-center justify-center text-center fill-height px-4">
        <h1 class="text-h2 font-weight-bold mb-4">Welcome to <span class="text-primary">LocalAI</span></h1>
        <div class="text-subtitle-1 mb-6 text-grey">
          <p>Your smart assistant is ready to help — chat in real time, get instant answers.</p>
          <p>All conversations stay on your device — no internet, no data leaks, just private AI.</p>
        </div>

        <section v-if="!computedModels?.length">
          <v-card elevation="2" class="pa-6 text-center" width="100%" max-width="500">
            <v-icon size="48" class="mb-3" color="grey-lighten-3">mdi-robot-off</v-icon>
            <p class="text-body-1 text-white mb-2">No models are currently available.</p>
            <p class="text-caption text-grey-lighten-1">Please check your setup or try again later.</p>
            <v-btn @click="showModels" variant="text" class="text-white mt-4"> Download More Models </v-btn>
          </v-card>
        </section>

        <section v-else class="my-4 d-flex flex-wrap justify-center align-center ga-4">
          <v-chip
            class="px-6"
            :class="{ 'text-green': model.active }"
            v-for="model of computedModels"
            :key="model.name"
            @click="setActiveModel(model.name)"
          >
            {{ model.name?.replace(':latest', '') }}
          </v-chip>
        </section>

        <v-btn
          v-if="computedModels.length"
          :disabled="!activeModel"
          color="primary"
          size="large"
          variant="text"
          class="text-none"
          to="/chat"
        >
          Get Started
        </v-btn>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
const activeModel = ref(null);
const models = ref([]);
const computedModels = computed(() => {
  return models.value.map(m => {
    return {
      name: m.name,
      model: m.model,
      active: activeModel.value === m.name,
    };
  });
});
const getModels = async () => {
  models.value = await api.get('/models');
};
const setActiveModel = (model = null) => {
  if (!model) {
    activeModel.value = localStorage.getItem(LOCALSTORAGE_KEYS.MODEL);
    return;
  }
  localStorage.setItem(LOCALSTORAGE_KEYS.MODEL, model);
  activeModel.value = model;
};
const showModels = async () => {
  const module = await import('@/components/chat/ModelsList.vue');

  bus.emit('dialog:open', {
    component: markRaw(module.default),
  });
};

onMounted(async () => {
  await getModels();
  setActiveModel();
});
</script>
