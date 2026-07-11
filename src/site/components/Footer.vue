<template>
  <footer class="border-t border-border bg-background">
    <div class="max-w-6xl mx-auto px-4 py-16">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-8" data-reveal>
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1 animate-fade-up">
          <a href="/" class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <svg viewBox="0 0 32 32" class="w-5 h-5" fill="none" aria-hidden="true"><path d="M12 9.5v13l11-6.5L12 9.5Z" fill="#18181b"/><rect x="20" y="14" width="2.5" height="9" rx="1.25" fill="#18181b"/></svg>
            </div>
            <span class="font-semibold text-foreground">TemuGlowz</span>
          </a>
          <p class="text-sm text-muted-foreground/70 mb-4">Local-first Temu shopping lists.</p>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border">
            <span class="w-2 h-2 rounded-full bg-emerald-500 pulse-glow"></span>
            <span class="text-xs text-muted-foreground">Active development</span>
          </div>
        </div>

        <!-- Links -->
        <div v-for="(links, title) in footerLinks" :key="title" class="animate-fade-up">
          <h4 class="text-sm font-semibold text-foreground mb-4">{{ title }}</h4>
          <ul class="space-y-3">
            <li v-for="link in links" :key="link.href">
              <a :href="link.href" class="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-muted-foreground/70">&copy; {{ currentYear }} TemuGlowz. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="/guides" class="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">Guides</a>
          <a href="https://github.com/dianedef/temu-shopping-lists" class="text-sm text-muted-foreground/70 hover:text-foreground transition-colors">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'App', href: '/app' },
  ],
  Resources: [
    { label: 'Guides', href: '/guides' },
    { label: 'Blog', href: '/blog' },
    { label: 'Downloads', href: 'https://github.com/dianedef/temu-shopping-lists/releases/latest' },
    { label: 'GitHub', href: 'https://github.com/dianedef/temu-shopping-lists' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
}
const currentYear = new Date().getFullYear()
</script>
