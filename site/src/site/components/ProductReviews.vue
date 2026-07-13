<script setup lang="ts">
interface Review {
  author: string
  rating: number
  text: string
  date?: string
}

defineProps<{
  reviews: Review[]
}>()
</script>

<template>
  <div class="mt-3 sm:mt-4">
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-xs font-semibold text-muted-foreground sm:text-sm">Avis clients</h4>
      <span class="text-[10px] text-muted-foreground sm:text-xs">{{ reviews.length }} avis</span>
    </div>

    <div class="relative">
      <div class="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1" style="scrollbar-width: none; -ms-overflow-style: none;">
        <div
          v-for="review in reviews"
          :key="review.author + review.text.slice(0, 20)"
          class="shrink-0 w-64 snap-start rounded-xl border border-border bg-background/50 p-3 sm:p-4"
        >
          <div class="flex items-center gap-1 text-amber-400 mb-1.5">
            <svg
              v-for="i in 5"
              :key="i"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              :fill="i <= review.rating ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              class="w-3 h-3 sm:w-3.5 sm:h-3.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <p class="text-xs text-foreground leading-relaxed mb-2 line-clamp-3 sm:text-sm">"{{ review.text }}"</p>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-medium text-muted-foreground sm:text-xs">{{ review.author }}</span>
            <span v-if="review.date" class="text-[10px] text-muted-foreground/70 sm:text-xs">{{ review.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
