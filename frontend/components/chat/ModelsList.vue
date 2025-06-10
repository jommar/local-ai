<template>
  <v-card>
    <v-card-title>Models List</v-card-title>

    <v-card-text>
      <ChatSetupGuide />
    </v-card-text>

    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Parameters</th>
            <th>Size</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(model, index) of models" :key="index" :class="{ 'text-green': model.active === true }">
            <td>{{ model.model }}</td>
            <td>{{ model.parameters }}</td>
            <td>{{ model.size }}</td>
            <td>
              <code class="bg-black pa-2" :class="{ 'text-decoration-line-through': model.active }">{{
                model.download
              }}</code>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
const models = ref([]);
const savedModels = ref([]);
onMounted(async () => {
  models.value = await api.get('/models/list');
});
</script>
