<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  appUrl?: string
}>()

const navItems = [
  { label: 'Avantages', href: '/#benefits' },
  { label: 'Fonctionnalités', href: '/#features' },
  { label: 'Tarifs', href: '/#pricing' },
  { label: 'Cas d’usage', href: '/#reviews' },
]

const isDark = ref(false)

function initTheme(): void {
  const saved = localStorage.getItem('theme')
  const prefersDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  isDark.value = prefersDark
  applyTheme(prefersDark)
}

function applyTheme(enabled: boolean): void {
  document.documentElement.classList.toggle('dark', enabled)
  localStorage.setItem('theme', enabled ? 'dark' : 'light')
}

function toggleTheme(): void {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
}

onMounted(() => {
  initTheme()

  const btn = document.getElementById('mobile-menu-btn')
  const menu = document.getElementById('mobile-menu')
  const menuIcon = btn?.querySelector('.menu-icon')
  const closeIcon = btn?.querySelector('.close-icon')

  btn?.addEventListener('click', () => {
    const isOpen = !menu?.classList.contains('hidden')
    menu?.classList.toggle('hidden')
    menuIcon?.classList.toggle('hidden')
    closeIcon?.classList.toggle('hidden')
    btn.setAttribute('aria-expanded', String(!isOpen))
  })

  menu?.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden')
      menuIcon?.classList.remove('hidden')
      closeIcon?.classList.add('hidden')
    })
  })

  const desktopNav = document.getElementById('desktop-nav')
  const pill = document.getElementById('nav-hover-pill')
  const navLinks = desktopNav?.querySelectorAll('.nav-link')

  navLinks?.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const el = link as HTMLElement
      if (pill) {
        pill.style.width = `${el.offsetWidth}px`
        pill.style.left = `${el.offsetLeft}px`
        pill.style.top = `${el.offsetTop}px`
        pill.style.opacity = '1'
      }
    })
  })

  desktopNav?.addEventListener('mouseleave', () => {
    if (pill) pill.style.opacity = '0'
  })
})
</script>

<template>
  <header class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl animate-slide-down">
    <nav class="relative flex items-center justify-between px-4 py-3 rounded-full bg-background/60 backdrop-blur-md border border-border">
      <a href="/" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <svg viewBox="0 0 32 32" class="w-5 h-5" fill="none" aria-hidden="true">
            <path d="M12 9.5v13l11-6.5L12 9.5Z" fill="#18181b"/>
            <rect x="20" y="14" width="2.5" height="9" rx="1.25" fill="#18181b"/>
          </svg>
        </div>
        <span class="font-semibold text-foreground hidden sm:block">TemuGlowz</span>
      </a>

      <div class="hidden md:flex items-center gap-1 relative" id="desktop-nav">
        <div id="nav-hover-pill" class="absolute bg-muted rounded-full transition-all duration-200 ease-out opacity-0 pointer-events-none" style="height: 36px;"></div>
        <a
          v-for="item in navItems"
          :key="item.href"
          :href="item.href"
          class="nav-link relative z-10 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {{ item.label }}
        </a>
      </div>

      <div class="hidden md:flex items-center gap-3">
        <button
          @click="toggleTheme"
          class="p-2 text-muted-foreground hover:text-foreground transition-colors"
          :aria-label="isDark ? 'Passer au mode clair' : 'Passer au mode sombre'"
        >
          <svg v-if="isDark" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <a :href="appUrl ?? '/app'" class="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
          Ouvrir l’application
        </a>
        <a
          :href="appUrl ?? '/app'"
          class="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-4 py-2 text-sm font-medium transition-colors"
        >
          Commencer
        </a>
      </div>

      <button
        id="mobile-menu-btn"
        class="md:hidden p-2 text-muted-foreground hover:text-foreground"
        aria-label="Ouvrir le menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
      >
        <svg class="w-5 h-5 menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        </svg>
        <svg class="w-5 h-5 close-icon hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    </nav>

    <div id="mobile-menu" class="hidden absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-background/95 backdrop-blur-md border border-border">
      <div class="flex flex-col gap-2">
        <button
          @click="toggleTheme"
          class="mobile-nav-link flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <svg v-if="isDark" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          {{ isDark ? 'Mode clair' : 'Mode sombre' }}
        </button>
        <a
          v-for="item in navItems"
          :key="item.href"
          :href="item.href"
          class="mobile-nav-link px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          {{ item.label }}
        </a>
        <hr class="border-border my-2"/>
        <a :href="appUrl ?? '/app'" class="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Ouvrir l’application</a>
        <a :href="appUrl ?? '/app'" class="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-4 py-3 text-sm font-medium text-center transition-colors">Commencer</a>
      </div>
    </div>
  </header>
</template>
