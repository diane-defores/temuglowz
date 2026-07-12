<template>
  <section class="py-16 sm:py-24 bg-card">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12 sm:mb-16" data-reveal>
        <h2
          class="animate-fade-up text-3xl sm:text-4xl font-bold text-foreground mb-4"
          style="font-family: var(--font-instrument-sans);"
        >
          Online Shopping Is Split Across Too Many Surfaces
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-reveal>
        <div
          v-for="(problem, index) in problems"
          :key="problem.title"
          :class="`animate-fade-up delay-${(index + 1) * 100} group relative p-6 rounded-2xl bg-background border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300 ${problem.wide ? 'md:col-span-2' : ''}`"
        >
          <div class="flex items-center gap-3 mb-4">
            <span class="text-3xl sm:text-4xl">{{ problem.icon }}</span>
            <h3 class="text-xl sm:text-2xl font-semibold text-foreground">{{ problem.title }}</h3>
          </div>
          <p class="text-base text-muted-foreground leading-relaxed">{{ problem.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const problems = [
  {
    icon: '🛒',
    title: 'Cart Chaos',
    description: 'Temu carts get messy fast with dozens of items. Finding what you need later means endless scrolling.',
    wide: true,
  },
  {
    icon: '📱',
    title: 'Phone Storage',
    description: 'Screenshots and saved links eat storage and are hard to search when you want to find that one item.',
    wide: false,
  },
  {
    icon: '💰',
    title: 'Price Blindness',
    description: 'No way to track if prices are rising or dropping without manually checking each item.',
    wide: false,
  },
  {
    icon: '📋',
    title: 'Order Fragmentation',
    description: 'Past orders, wishlists, and future purchases live scattered across the app with no central view.',
    wide: false,
  },
]
</script>