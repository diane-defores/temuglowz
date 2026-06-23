<script setup lang="ts">
defineProps<{
  rank: number
  name: string
  rating: number
  price: string
  image: string
  productUrl?: string
  description: string
  pros?: string[]
  cons?: string[]
  highlighted?: boolean
}>()
</script>

<template>
  <article class="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
    <div class="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-background flex items-center justify-center font-bold text-lg shadow-lg">
      #{{ rank }}
    </div>

    <div class="flex flex-col sm:flex-row gap-6">
      <div class="sm:w-48 shrink-0">
        <img
          :src="image"
          :alt="name"
          class="w-full h-48 object-cover rounded-lg bg-background"
          loading="lazy"
          onerror="this.src='https://placehold.co/400x300/cccccc/666666?text=Produit'"
        />
      </div>

      <div class="flex-1">
        <div class="flex items-start justify-between gap-4 mb-3">
          <h3 class="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {{ name }}
          </h3>
          <div class="flex items-center gap-1 text-amber-400">
            <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= rating ? 'fill-current' : 'opacity-30'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="text-sm text-muted-foreground ml-1">{{ rating }}/5</span>
          </div>
        </div>

        <p class="text-sm text-muted-foreground mb-4">{{ description }}</p>

        <div class="mb-4">
          <p class="text-2xl font-bold text-foreground">{{ price }}</p>
        </div>

        <div v-if="pros?.length" class="mb-4">
          <h4 class="text-sm font-semibold text-foreground mb-2">Points forts :</h4>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="pro in pros"
              :key="pro"
              class="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs"
            >
              {{ pro }}
            </li>
          </ul>
        </div>

        <div v-if="cons?.length" class="mb-4">
          <h4 class="text-sm font-semibold text-muted-foreground mb-2">Points faibles :</h4>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="con in cons"
              :key="con"
              class="inline-flex items-center px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs"
            >
              {{ con }}
            </li>
          </ul>
        </div>

        <a
          v-if="productUrl"
          :href="productUrl"
          target="_blank"
          rel="noopener noreferrer sponsored"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-background font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
        >
          Voir sur Temu
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M7 17 17 7M7 7h10v10"/></svg>
        </a>
      </div>
    </div>
  </article>
</template>