<script setup lang="ts">
defineProps<{
  rank: number
  name: string
  rating: number
  price: string
  image: string
  imageAvif?: string
  imageWebp?: string
  imageWidth?: number
  imageHeight?: number
  productUrl?: string
  description: string
  pros?: string[]
  cons?: string[]
  highlighted?: boolean
}>()
</script>

<template>
  <article class="group relative p-2.5 sm:p-5 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300">
    <div class="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary text-background flex items-center justify-center font-bold text-xs shadow-md z-10 sm:w-9 sm:h-9 sm:text-sm sm:-top-2.5 sm:-left-2.5">
      #{{ rank }}
    </div>

    <div class="flex flex-row gap-2.5 sm:gap-5">
      <div class="relative w-24 shrink-0 sm:w-44">
        <picture>
          <source v-if="imageAvif" :srcset="imageAvif" type="image/avif" sizes="(min-width: 640px) 11rem, 100vw" />
          <source v-if="imageWebp" :srcset="imageWebp" type="image/webp" sizes="(min-width: 640px) 11rem, 100vw" />
          <img
            :src="image"
            :alt="name"
            :width="imageWidth ?? 400"
            :height="imageHeight ?? 300"
            class="w-full aspect-square object-cover rounded-xl bg-background"
            :style="{ aspectRatio: `${imageWidth ?? 400} / ${imageHeight ?? 300}` }"
            :loading="highlighted ? 'eager' : 'lazy'"
            :decoding="highlighted ? 'sync' : 'async'"
            :fetchpriority="highlighted ? 'high' : 'auto'"
            sizes="(min-width: 640px) 11rem, 100vw"
            onerror="this.src='https://placehold.co/400x300/cccccc/666666?text=Produit'"
          />
        </picture>
        <div class="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span class="font-medium">{{ rating }}/5</span>
        </div>
      </div>

      <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5 relative">
        <div class="mb-3 sm:mb-4">
          <div class="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
            <h3 class="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 sm:text-base">
              {{ name }}
            </h3>
            <a
              v-if="productUrl"
              :href="productUrl"
              target="_blank"
              rel="noopener noreferrer sponsored"
              class="shrink-0 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-primary text-background font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 text-[10px] sm:px-4 sm:py-2 sm:text-xs"
            >
              Voir sur Temu
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3 sm:w-3.5 sm:h-3.5"><path d="M7 17 17 7M7 7h10v10"/></svg>
            </a>
          </div>
          <p class="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-none sm:text-sm">{{ description }}</p>
        </div>

        <div class="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium sm:text-xs">Guide complet</span>
          <span v-if="pros?.length" class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-xs">{{ pros[0] }}</span>
        </div>

        <div class="flex items-end justify-between gap-3">
          <div class="flex items-center gap-1 text-primary/60">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m12 3 1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3Z"/><path d="m18.5 14 .75 2.25L21.5 17l-2.25.75L18.5 20l-.75-2.25L15.5 17l2.25-.75.75-2.25Z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m12 3 1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3Z"/><path d="m18.5 14 .75 2.25L21.5 17l-2.25.75L18.5 20l-.75-2.25L15.5 17l2.25-.75.75-2.25Z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m12 3 1.35 4.15L17.5 8.5l-4.15 1.35L12 14l-1.35-4.15L6.5 8.5l4.15-1.35L12 3Z"/><path d="m18.5 14 .75 2.25L21.5 17l-2.25.75L18.5 20l-.75-2.25L15.5 17l2.25-.75.75-2.25Z"/></svg>
          </div>
          <div class="text-right">
            <p class="text-base font-bold text-foreground sm:text-xl">{{ price }}</p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
