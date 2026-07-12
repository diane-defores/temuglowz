<template>
  <section id="features" class="py-16 sm:py-24 bg-background">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12 sm:mb-16" data-reveal>
        <p class="animate-fade-up text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Features</p>
        <h2 class="animate-fade-up delay-100 text-3xl sm:text-4xl font-bold text-foreground mb-4" style="font-family: var(--font-instrument-sans);">
          Everything You Need, Nothing You Don't
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-reveal>
        <!-- Local Archive (large card) -->
        <div class="md:col-span-2 animate-fade-up group relative p-6 rounded-2xl bg-card border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg sm:text-xl font-semibold text-foreground mb-2">Local-First Archive</h3>
              <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
                Your carts, orders, and wishlists stay on your device. Search, tag, and organize without any account.
              </p>
            </div>
            <!-- Cart organizer visualization -->
            <div class="hidden sm:block w-[260px] shrink-0">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
                  <div class="w-1.5 h-1.5 rounded-full shrink-0 bg-orange-500"></div>
                  <span class="text-[10px] text-muted-foreground truncate">Groceries / Weekly</span>
                </div>
                <div class="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
                  <div class="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500"></div>
                  <span class="text-[10px] text-muted-foreground truncate">Gifts / Birthday</span>
                </div>
                <div class="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
                  <div class="w-1.5 h-1.5 rounded-full shrink-0 bg-green-500"></div>
                  <span class="text-[10px] text-muted-foreground truncate">Tech / Next order</span>
                </div>
                <div class="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
                  <div class="w-1.5 h-1.5 rounded-full shrink-0 bg-purple-500"></div>
                  <span class="text-[10px] text-muted-foreground truncate">Home / Renovation</span>
                </div>
              </div>
            </div>
          </div>
          <span class="inline-block bg-foreground/10 text-foreground rounded-full px-3 py-1 text-sm mt-2">Search across all lists</span>
        </div>

        <!-- Price History -->
        <div class="animate-fade-up delay-100 group relative p-6 rounded-2xl bg-card border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-semibold text-foreground mb-2">Price History</h3>
          <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
            See how prices change over time and get notified when items drop to your target.
          </p>
          <span class="inline-block bg-foreground/10 text-foreground rounded-full px-3 py-1 text-sm">Never overpay again</span>
        </div>

        <!-- Quick Import -->
        <div class="animate-fade-up delay-200 group relative p-6 rounded-2xl bg-card border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-semibold text-foreground mb-2">One-Click Import</h3>
          <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
            Add products from Temu instantly with price and availability extraction.
          </p>
          <div class="flex items-center gap-1 mb-4">
            <kbd class="kbd-key px-2 py-1 text-xs bg-muted border border-border rounded text-foreground/80 font-mono transition-transform duration-100">⌘</kbd>
            <kbd class="kbd-key px-2 py-1 text-xs bg-muted border border-border rounded text-foreground/80 font-mono transition-transform duration-100">I</kbd>
          </div>
          <span class="inline-block bg-foreground/10 text-foreground rounded-full px-3 py-1 text-sm">Fast capture</span>
        </div>

        <!-- Cross-Platform -->
        <div class="animate-fade-up delay-300 group relative p-6 rounded-2xl bg-card border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-semibold text-foreground mb-2">Cross-Platform</h3>
          <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
            Works on desktop, mobile, and in your browser with synchronized data.
          </p>
          <svg viewBox="0 0 100 70" class="w-full h-24">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0.2" />
                <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0 60 L 20 45 L 40 55 L 60 30 L 80 40 L 100 15 L 100 70 L 0 70 Z" fill="url(#chartGradient)" class="opacity-50" />
            <path d="M 0 60 L 20 45 L 40 55 L 60 30 L 80 40 L 100 15" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" class="draw-line" />
          </svg>
          <span class="inline-block bg-foreground/10 text-foreground rounded-full px-3 py-1 text-sm">Any device</span>
        </div>

        <!-- Privacy-Focused -->
        <div class="animate-fade-up delay-400 group relative p-6 rounded-2xl bg-card border border-border hover:border-foreground/25 hover:scale-[1.02] transition-all duration-300">
          <h3 class="text-lg sm:text-xl font-semibold text-foreground mb-2">No Tracking</h3>
          <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
            Your shopping habits stay private. No analytics, no sharing, no cloud storage.
          </p>
          <div class="flex items-center gap-2 mb-4">
            <span class="px-2 py-1 text-xs bg-muted rounded text-muted-foreground">Local</span>
            <span class="px-2 py-1 text-xs bg-muted rounded text-muted-foreground">Private</span>
            <span class="px-2 py-1 text-xs bg-muted rounded text-muted-foreground">Offline</span>
          </div>
          <span class="inline-block bg-foreground/10 text-foreground rounded-full px-3 py-1 text-sm">Your data, yours</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Keyboard shortcut press animation
if (typeof window !== 'undefined') {
  const animateKeys = () => {
    const keys = document.querySelectorAll<HTMLElement>('.kbd-key')
    keys.forEach((key, i) => {
      setTimeout(() => {
        key.style.transform = 'scale(0.95) translateY(2px)'
        setTimeout(() => {
          key.style.transform = ''
        }, 200)
      }, i * 50)
    })
  }
  setInterval(animateKeys, 3000)
}
</script>