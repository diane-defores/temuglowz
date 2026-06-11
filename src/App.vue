<template>
  <div class="app-root">
    <RouterView />
    <AppNotifications />
  </div>
</template>

<script setup lang="ts">
import AppNotifications from "@/components/AppNotifications.vue";
</script>
