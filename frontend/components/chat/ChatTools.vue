<template>
  <div class="d-flex justify-end align-center">
    <v-menu location="bottom">
      <template #activator="{ props }">
        <v-btn v-bind="props" size="small" icon variant="text" color="white" :title="'AI Tools'">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item @click="onSystemInstructionsClick">
          <v-list-item-title>System Instructions</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
const onSystemInstructionsClick = async () => {
  const module = await import('@/components/chat/CustomizeChat.vue');

  bus.emit('dialog:open', {
    component: markRaw(module.default),
  });
};
</script>
