<template>
  <main class="min-h-screen">
    <UContainer>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div
          ref="dropZoneRef"
          class="rounded-lg aspect-[1] bg-gray-100 dark:bg-gray-900 border dark:border-gray-600 flex items-center justify-center mt-2 transition-all overflow-hidden relative"
          :class="{
            'animate-pulse ring-4 ring-teal-500 bg-teal-50 border-teal-500 dark:border-teal-400 ring-opacity-20':
              isOverDropZone,
          }"
          @click="!isOverDropZone && !post.thumbnail && open()"
        >
          <div v-if="!post.thumbnail" class="text-center cursor-pointer">
            <p>Drag the picture here</p>
            <p class="text-xs mt-1 text-gray-500">or click here to upload</p>
          </div>
          <img
            v-else
            :src="imagePreview"
            class="h-full w-full object-cover relative"
          />
          <UButton
            type="button"
            v-if="post.thumbnail"
            icon="i-heroicons-x-mark"
            square
            class="absolute top-2 right-2 z-10"
            color="rose"
            variant="soft"
            @click.stop="post.thumbnail = undefined"
          />
        </div>
        <UButton
          type="submit"
          size="lg"
          label="Run"
          color="black"
          block
          :loading="loading"
        />
      </form>
      <audio ref="audioRef"></audio>
    </UContainer>
  </main>
</template>

<script setup>
import { useDropZone, useFileDialog } from "@vueuse/core";

const dropZoneRef = ref();

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);
const loading = ref(false);
const file = ref();
const imagePreview = useObjectUrl(file);
const audioRef = ref(null);

function onDrop(files) {
  post.value.thumbnail = files[0];
  file.value = files && files.length > 0 ? files[0] : undefined;
}

const { open, onChange } = useFileDialog({
  accept: "image/*",
});

const post = ref({
  thumbnail: undefined,
});

onChange((files) => {
  post.value.thumbnail = files[0];
  file.value = files && files.length > 0 ? files[0] : undefined;
});

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const handleSubmit = async () => {
  loading.value = true;
  const { data } = await useFetch("/api/analyse", {
    method: "POST",
    body: {
      imageUrl: await toBase64(post.value.thumbnail),
    },
  });
  if (data.value) {
    const blob = new Blob([data.value], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    audioRef.value.src = url;
    audioRef.value.play();
  }
  loading.value = false;
};
</script>
