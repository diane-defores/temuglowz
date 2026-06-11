<template>
  <div class="app-root">
    <RouterView />
    <AppNotifications />
    <PostAuthSyncFeedback />
  </div>
</template>

<script setup lang="ts">
import AppNotifications from "@/components/AppNotifications.vue";
import PostAuthSyncFeedback from "@/components/PostAuthSyncFeedback.vue";
</script>
