<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const navItems = [
  { label: 'Les idées', href: '/#themes' },
  { label: 'En ce moment', href: '/#selections' },
  { label: 'Comment on choisit', href: '/#method' },
  { label: 'Tout voir', href: '/guides' },
]

const isDark = ref(false)
const isMenuOpen = ref(false)

function applyTheme(enabled: boolean): void {
  isDark.value = enabled
  document.documentElement.classList.toggle('dark', enabled)
  try {
    localStorage.setItem('theme', enabled ? 'dark' : 'light')
  } catch {
    // Theme remains usable even when storage is unavailable.
  }
}

function initTheme(): void {
  let saved: string | null = null
  try {
    saved = localStorage.getItem('theme')
  } catch {
    saved = null
  }
  applyTheme(saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches))
}

function toggleTheme(): void {
  applyTheme(!isDark.value)
}

function closeMenu(): void {
  isMenuOpen.value = false
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  initTheme()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <header class="fixed inset-x-0 top-4 z-50 mx-auto max-w-4xl animate-slide-down px-4">
    <nav aria-label="Navigation principale" class="relative flex items-center justify-between rounded-full border border-border bg-background/90 px-4 py-3 shadow-lg backdrop-blur-md">
      <a href="/" class="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground" aria-label="TemuGlowz — Accueil">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3Z"/><path d="m18.5 14 .75 2.25L21.5 17l-2.25.75L18.5 20l-.75-2.25L15.5 17l2.25-.75.75-2.25Z"/></svg>
        </span>
        <span class="text-sm font-semibold text-foreground sm:text-base">TemuGlowz</span>
      </a>

      <div class="hidden items-center gap-1 md:flex">
        <a v-for="item in navItems" :key="item.href" :href="item.href" class="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">{{ item.label }}</a>
      </div>

      <div class="flex items-center gap-1">
        <a href="/app" class="hidden rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:inline-flex">L’application</a>
        <button type="button" @click="toggleTheme" class="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground" :aria-label="isDark ? 'Passer au mode clair' : 'Passer au mode sombre'" :title="isDark ? 'Mode clair' : 'Mode sombre'">
          <svg v-if="isDark" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button type="button" class="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden" aria-label="Ouvrir le menu" :aria-expanded="isMenuOpen" aria-controls="mobile-menu" @click="isMenuOpen = !isMenuOpen">
          <svg v-if="!isMenuOpen" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </div>
    </nav>

    <div v-if="isMenuOpen" id="mobile-menu" class="absolute left-0 right-0 top-full mt-2 rounded-3xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur-md md:hidden">
      <div class="flex flex-col gap-1">
        <a v-for="item in navItems" :key="item.href" :href="item.href" class="rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground" @click="closeMenu">{{ item.label }}</a>
        <a href="/app" class="mt-1 rounded-xl border-t border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground" @click="closeMenu">À propos de l’application</a>
      </div>
    </div>
  </header>
</template>
