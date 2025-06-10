<template>
  <NuxtLayout>
    <v-app>
      <v-app-bar>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-spacer></v-spacer>
        <!-- only if /chat -->
        <ChatNavs v-if="path === '/chat'" />
      </v-app-bar>
      <v-navigation-drawer v-model="drawer">
        <ChatHistory v-if="path === '/chat'" />
      </v-navigation-drawer>
      <NuxtPage class="h-100" />
    </v-app>
  </NuxtLayout>
</template>

<script setup>
const drawer = ref(false);
const { $bus } = useNuxtApp();

const path = computed(() => {
  return useRoute().path;
});

onMounted(() => {
  $bus.on('drawer:toggle', () => {
    drawer.value = !drawer.value;
  });
});

onBeforeUnmount(() => {
  $bus.off('drawer:toggle');
});
</script>
