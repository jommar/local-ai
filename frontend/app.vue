<template>
  <NuxtLayout>
    <v-app v-if="isMounted">
      <v-app-bar>
        <v-app-bar-nav-icon v-if="path !== '/'" variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-btn v-if="path !== '/'" icon @click="$router.push('/')">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn icon href="https://github.com/jommar/local-ai" target="_blank">
          <v-icon>mdi-github</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <!-- only if /chat -->
        <ChatNavs v-if="path === '/chat'" />

        <v-app-bar-nav-icon v-if="path === '/chat'" variant="text" @click.stop="toggleSysDrawer"></v-app-bar-nav-icon>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" temporary>
        <ChatHistory v-if="path === '/chat'" />
      </v-navigation-drawer>

      <v-navigation-drawer v-model="sysDrawer" location="right">
        <PromptsSystemMessages />
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
const sysDrawer = ref(true);
const isMounted = ref(false);

const path = computed(() => {
  return useRoute().path;
});

const handleDialog = payload => {
  if (!payload.component) return;
  dialog.value.show = true;
  dialog.value.component = payload.component;
  dialog.value.props = payload.props;
};

const toggleSysDrawer = () => {
  sysDrawer.value = !sysDrawer.value;
  bus.emit('drawer:system:toggle', sysDrawer.value);
};

onMounted(() => {
  isMounted.value = true;
  bus.on('drawer:toggle', () => {
    drawer.value = !drawer.value;
  });
  bus.on('drawer:close', () => {
    drawer.value = false;
  });
  bus.on('dialog:open', handleDialog);
  bus.on('dialog:close', () => {
    dialog.value = { show: false };
  });
});

onBeforeUnmount(() => {
  bus.off('drawer:toggle');
});
</script>
