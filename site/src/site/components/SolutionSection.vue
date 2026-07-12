<template>
  <section class="py-16 sm:py-24 bg-background">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12 sm:mb-16" data-reveal>
        <h2
          class="animate-fade-up text-3xl sm:text-4xl font-bold text-foreground mb-4"
          style="font-family: var(--font-instrument-sans);"
        >
          A Shopping Archive That Keeps Context Intact
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" data-reveal>
        <div
          v-for="(solution, index) in solutions"
          :key="solution.title"
          :class="`animate-fade-up delay-${(index + 1) * 100} group relative p-6 rounded-2xl bg-card border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300 text-center`"
        >
          <span class="text-4xl sm:text-5xl block mb-4">{{ solution.icon }}</span>
          <h3 class="text-xl sm:text-2xl font-semibold text-foreground mb-3">{{ solution.title }}</h3>
          <p class="text-base text-muted-foreground leading-relaxed">{{ solution.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const solutions = [
  {
    icon: '📦',
    title: 'Local Archive',
    description: 'Store all your Temu carts and orders on-device with instant search and organization.',
  },
  {
    icon: '📈',
    title: 'Price Monitoring',
    description: 'Track price changes automatically and get notified when items hit your target price.',
  },
  {
    icon: '🚫',
    title: 'Zero Distractions',
    description: 'No social feeds, no ads, just your shopping lists in a focused interface.',
  },
]
</script>