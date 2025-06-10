<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title class="text-h6">Customize Chat</v-card-title>

    <v-card-text>
      <v-form>
        <v-text-field v-model="form.name" label="Your Name" prepend-icon="mdi-account" density="comfortable" />
        <v-text-field v-model="form.age" label="Age" type="number" prepend-icon="mdi-calendar" density="comfortable" />
        <v-text-field v-model="form.profession" label="Profession" prepend-icon="mdi-briefcase" density="comfortable" />
        <v-textarea
          v-model="form.hobbies"
          label="Hobbies"
          prepend-icon="mdi-heart"
          auto-grow
          rows="2"
          density="comfortable"
        />
        <v-select
          v-model="form.tone"
          label="Preferred Tone"
          :items="['Friendly', 'Professional', 'Casual', 'Formal']"
          prepend-icon="mdi-emoticon-outline"
          density="comfortable"
        />
        <v-slider
          v-model="form.responseLength"
          label="Response Length"
          :min="1"
          :max="3"
          step="1"
          show-ticks="always"
          tick-size="2"
          class="mt-6"
          :marks="{
            1: 'Short',
            2: 'Medium',
            3: 'Long',
          }"
        />
        <v-text-field v-model="form.goal" label="Current Goal" prepend-icon="mdi-target" density="comfortable" />
        <v-select
          v-model="form.useCase"
          label="Main Use Case"
          :items="['Coding', 'Writing', 'Learning', 'Research', 'Productivity', 'Personal Assistant']"
          prepend-icon="mdi-briefcase-variant"
          density="comfortable"
        />
        <v-textarea
          v-model="form.techStack"
          label="Preferred Tech Stack"
          prepend-icon="mdi-laptop"
          placeholder="e.g. Vue, Node.js, MySQL"
          auto-grow
          rows="2"
          density="comfortable"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" color="red" @click="onClose"> Close </v-btn>
      <v-btn variant="flat" color="green" @click="onSave"> Save </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
const { $bus } = useNuxtApp();
const responseLengthMap = {
  1: 'Short',
  2: 'Medium',
  3: 'Long',
};

const form = ref({
  name: '',
  profession: '',
  hobbies: '',
  tone: '',
  age: null,
  responseLength: 2,
  goal: '',
  useCase: '',
  techStack: '',
});

const onClose = () => {
  $bus.emit('dialog:close');
};
const onSave = async () => {
  const toSave = {};
  for (const i in form.value) {
    if (!form.value[i]) continue;
    toSave[i] = i === 'responseLength' ? responseLengthMap[form.value[i]] : form.value[i];
  }
  await api.post('/settings', toSave);
  $bus.emit('dialog:close');
};
const getSettings = async () => {
  const { data: r } = await api.get('/settings');
  if (r.responseLength) {
    const reversedResponseLengthMap = Object.fromEntries(
      Object.entries(responseLengthMap).map(([key, value]) => [value, Number(key)])
    );
    r.responseLength = reversedResponseLengthMap[r.responseLength];
  }
  for (const i in r) {
    form.value[i] = r[i];
  }
};
onMounted(() => {
  getSettings();
});
</script>
