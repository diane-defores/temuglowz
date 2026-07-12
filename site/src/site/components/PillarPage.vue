<script setup lang="ts">
import ProductCard from './ProductCard.vue'

interface Product {
  name: string
  rating: number
  price: string
  image: string
  amazonUrl?: string
  description: string
  pros: string[]
  cons?: string[]
  rank: number
}

interface Section {
  id: string
  title: string
  products: Product[]
}

defineProps<{
  title: string
  subtitle?: string
  description: string
  updatedDate: string
  author?: string
  sections: Section[]
  faq?: Array<{ question: string; answer: string }>
  metaDescription?: string
}>()
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <!-- Sommaire sticky -->
    <aside class="fixed top-20 right-4 w-64 max-h-[70vh] overflow-y-auto bg-card/80 backdrop-blur-md border border-border rounded-xl p-4 hidden xl:block z-40">
      <h3 class="text-sm font-semibold text-foreground mb-3">Sommaire</h3>
      <nav class="space-y-2">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          class="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          {{ section.title }}
        </a>
        <a
          v-if="faq?.length"
          href="#faq"
          class="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          Questions fréquentes
        </a>
      </nav>
    </aside>

    <article class="max-w-3xl mx-auto px-4 py-12">
      <!-- Header avec breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <a href="/" class="hover:text-foreground">Accueil</a>
        <span>›</span>
        <span class="text-foreground">Guides</span>
      </nav>

      <header class="mb-12">
        <div class="flex items-center gap-3 mb-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            Guide complet
          </span>
          <time :datetime="updatedDate" class="text-xs text-muted-foreground">
            Mis à jour le {{ updatedDate }}
          </time>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4" style="font-family: var(--font-cal-sans);">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-lg text-muted-foreground mb-4">
          {{ subtitle }}
        </p>
        <p class="text-lg text-muted-foreground leading-relaxed">
          {{ description }}
        </p>
      </header>

      <!-- Introduction -->
      <section class="mb-12 p-6 rounded-2xl bg-card border border-border">
        <h2 class="text-xl font-semibold text-foreground mb-4">Pourquoi nous fait confiance ?</h2>
        <ul class="space-y-3 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <svg class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            <span><strong class="text-foreground">Tests indépendants</strong> - Chaque produit est testé en conditions réelles</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            <span><strong class="text-foreground">Mise à jour constante</strong> - Nos guides sont régulièrement actualisés</span>
          </li>
          <li class="flex items-start gap-2">
            <svg class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            <span><strong class="text-foreground">Transparence</strong> - Nous pouvons gagner une commission via les liens affiliés</span>
          </li>
        </ul>
      </section>

      <!-- Sections produits -->
      <section
        v-for="section in sections"
        :id="section.id"
        :key="section.id"
        class="mb-16 scroll-mt-24"
      >
        <h2 class="text-2xl font-bold text-foreground mb-2 pb-2 border-b border-border">
          {{ section.title }}
        </h2>
        <p class="text-muted-foreground mb-6">
          Découvrez notre sélection des meilleurs produits dans cette catégorie.
        </p>

        <div class="space-y-8">
          <ProductCard
            v-for="(product, productIndex) in section.products"
            :key="product.rank"
            v-bind="product"
            :highlighted="section.id === sections[0]?.id && productIndex === 0"
          />
        </div>
      </section>

      <!-- FAQ Schema -->
      <section v-if="faq?.length" id="faq" class="mb-16 scroll-mt-24">
        <h2 class="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">
          Questions fréquentes
        </h2>
        <div class="space-y-4">
          <details
            v-for="(item, index) in faq"
            :key="index"
            class="group p-4 rounded-xl bg-card border border-border"
          >
            <summary class="cursor-pointer font-semibold text-foreground list-none flex items-center justify-between">
              {{ item.question }}
              <svg class="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </summary>
            <p class="mt-3 text-sm text-muted-foreground leading-relaxed">
              {{ item.answer }}
            </p>
          </details>
        </div>
      </section>

      <!-- Call to action final -->
      <aside class="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 text-center">
        <h3 class="text-xl font-bold text-foreground mb-3">Vous n'avez pas trouvé votre bonheur ?</h3>
        <p class="text-muted-foreground mb-6">
          Découvrez plus d'articles et guides dans notre rubrique dédiée.
        </p>
        <a href="/guides/kitchen-gadgets" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-card text-foreground font-medium border border-border hover:bg-muted transition-colors">
          Plus de guides cuisine
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </aside>
    </article>
  </main>
</template>
