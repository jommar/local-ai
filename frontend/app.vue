<template>
  <NuxtLayout>
    <v-app>
      <v-app-bar>
        <v-app-bar-nav-icon v-if="path !== '/'" variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-btn v-if="path !== '/'" icon @click="$router.push('/')">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <!-- only if /chat -->
        <ChatNavs v-if="path === '/chat'" />
      </v-app-bar>
      <v-navigation-drawer v-model="drawer">
        <ChatHistory v-if="path === '/chat'" />
      </v-navigation-drawer>
      <NuxtPage class="h-100" />

      <v-dialog v-model="dialog.show">
        <component :is="dialog.component" v-bind="dialog.props" />
      </v-dialog>
    </v-app>
  </NuxtLayout>
</template>

<script setup>
const drawer = ref(false);
const dialog = ref({});
const { $bus } = useNuxtApp();

const path = computed(() => {
  return useRoute().path;
});

const handleDialog = payload => {
  if (!payload.component) return;
  dialog.value.show = true;
  dialog.value.component = payload.component;
  dialog.value.props = payload.props;
};

onMounted(() => {
  $bus.on('drawer:toggle', () => {
    drawer.value = !drawer.value;
  });
  $bus.on('dialog:open', handleDialog);
  $bus.on('dialog:close', () => {
    dialog.value = { show: false };
  });
});

onBeforeUnmount(() => {
  $bus.off('drawer:toggle');
});
</script>
