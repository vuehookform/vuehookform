<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        @click="emit('update:open', false)"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div
        v-if="open"
        class="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <span class="font-bold text-gray-900">Navigation</span>
          <button
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            @click="emit('update:open', false)"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Sidebar Content -->
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 250ms ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
