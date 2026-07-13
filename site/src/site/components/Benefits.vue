<template>
  <section id="benefits" class="py-16 sm:py-24 bg-card">
    <div class="max-w-6xl mx-auto px-8 sm:px-10">
      <div class="text-center mb-12 sm:mb-16" data-reveal>
        <p class="animate-fade-up text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Benefits</p>
        <h2
          class="animate-fade-up delay-100 text-3xl sm:text-4xl font-bold text-foreground"
          style="font-family: var(--font-instrument-sans);"
        >
          Why Choose TemuGlowz
        </h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4" data-reveal>
        <div
          v-for="(benefit, index) in benefits"
          :key="benefit.title"
          :class="`animate-fade-up delay-${(index + 1) * 100} group flex gap-4 sm:gap-6 items-center p-6 rounded-2xl bg-background border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300`"
        >
          <div class="shrink-0 bg-muted rounded-lg p-3 text-3xl">
            {{ benefit.icon }}
          </div>
          <div>
            <h3 class="text-xl sm:text-2xl font-semibold text-foreground mb-2">{{ benefit.title }}</h3>
            <p class="text-base text-muted-foreground leading-relaxed">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const benefits = [
  {
    title: 'Local-First Storage',
    description: 'All your shopping data stays on your device. No accounts, no cloud sync, no tracking.',
    icon: '💾',
  },
  {
    title: 'Price History Tracking',
    description: 'Monitor price changes over time and get notified when items drop to your target price.',
    icon: '📈',
  },
  {
    title: 'Multi-Session Management',
    description: 'Keep separate shopping sessions for different purposes, projects, or gift lists.',
    icon: '📦',
  },
  {
    title: 'One-Click Import',
    description: 'Import products directly from Temu with automatic price and availability extraction.',
    icon: '⚡',
  },
]
</script>