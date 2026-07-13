<script setup lang="ts">
import { ref } from 'vue'

const plans = [
  {
    name: 'Gratuit',
    description: 'Parfait pour commencer',
    monthly: 0,
    yearly: 0,
    annual: 0,
    features: ['2 sessions d’achat', '50 produits par session', 'Suivi de prix de base', 'Stockage local uniquement', 'Assistance communautaire'],
    cta: 'Commencer',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Pour les chasseurs de bonnes affaires',
    monthly: 9,
    yearly: 6,
    annual: 72,
    features: ['Sessions illimitées', 'Produits illimités', 'Historique complet des prix', 'Alertes de prix', 'Assistance e-mail prioritaire'],
    cta: 'Démarrer l’essai gratuit',
    highlighted: true,
  },
  {
    name: 'Team',
    description: 'Pour les petites équipes',
    monthly: 19,
    yearly: 15,
    annual: 180,
    features: ['Tout le contenu Pro', 'Listes partagées', 'Gestion d’équipe', 'Assistance prioritaire'],
    cta: 'Contacter l’équipe',
    highlighted: false,
  },
]

const cycle = ref<'monthly' | 'yearly'>('monthly')

function setCycle(value: 'monthly' | 'yearly'): void {
  cycle.value = value
}

function priceFor(plan: typeof plans[0]): string {
  return cycle.value === 'yearly' ? `€${plan.yearly}` : `€${plan.monthly}`
}
</script>

<template>
  <section id="pricing" class="py-16 sm:py-24 bg-background">
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-12" data-reveal>
        <h2 class="animate-fade-up text-3xl sm:text-4xl font-bold text-foreground mb-4" style="font-family: var(--font-instrument-sans);">
          Des tarifs simples et transparents
        </h2>
        <p class="animate-fade-up delay-100 text-muted-foreground max-w-2xl mx-auto mb-8">
          Commencez gratuitement, puis passez à une formule supérieure quand vous avez besoin de plus de sessions et d’un suivi avancé.
        </p>

        <div class="inline-flex items-center p-1 rounded-full bg-card border border-border">
          <button
            @click="setCycle('monthly')"
            :class="['relative px-4 py-2 text-sm font-medium rounded-full transition-colors', cycle === 'monthly' ? 'text-foreground bg-muted' : 'text-muted-foreground']"
          >
            Mensuel
          </button>
          <button
            @click="setCycle('yearly')"
            :class="['relative px-4 py-2 text-sm font-medium rounded-full transition-colors', cycle === 'yearly' ? 'text-foreground bg-muted' : 'text-muted-foreground']"
          >
            Annuel
            <span class="ml-2 px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">-33%</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" data-reveal>
        <div
          v-for="(plan, index) in plans"
          :key="plan.name"
          :class="['animate-fade-up-slow relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02]', {
            'bg-card border-foreground/30': plan.highlighted,
            'bg-card/70 border-border hover:border-foreground/25': !plan.highlighted,
          }]"
          :style="`animation-delay: ${300 + index * 100}ms`"
        >
          <div v-if="plan.highlighted" class="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div
              class="absolute w-24 h-24 bg-white/20 blur-xl border-beam"
              style="offset-path: rect(0 100% 100% 0 round 16px);"
            />
          </div>

          <div v-if="plan.highlighted" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background text-xs font-medium rounded-full">
            Le plus populaire
          </div>

          <div class="mb-6">
            <h3 class="text-xl font-semibold text-foreground mb-2">{{ plan.name }}</h3>
            <p class="text-muted-foreground text-sm">{{ plan.description }}</p>
          </div>

          <div class="mb-6">
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-bold text-foreground">{{ priceFor(plan) }}</span>
              <span v-if="plan.monthly > 0" class="text-muted-foreground text-sm">/mois</span>
            </div>
            <p v-if="plan.annual > 0 && cycle === 'yearly'" class="text-xs text-muted-foreground mt-1">
              Facturé annuellement ({{ plan.annual }} € / an)
            </p>
          </div>

          <ul class="space-y-3 mb-8">
            <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-3 text-sm text-foreground/85">
              <svg class="w-4 h-4 text-emerald-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              {{ feature }}
            </li>
          </ul>

          <a
            href="/app"
            :class="['block w-full text-center rounded-full py-3 text-sm font-medium transition-colors', {
              'shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200': plan.highlighted,
              'bg-card text-foreground hover:bg-muted border border-border': !plan.highlighted,
            }]"
          >
            {{ plan.cta }}
          </a>
        </div>
      </div>
      <div class="mt-10 max-w-2xl mx-auto px-4 py-4 rounded-xl bg-card/50 border border-border text-sm text-muted-foreground" data-reveal>
        <p><span class="font-medium text-foreground">Pourquoi des abonnements ?</span> TemuGlowz nécessite une maintenance continue pour suivre les évolutions de Temu, du suivi des prix et de la compatibilité multiplateforme.</p>
      </div>
    </div>
  </section>
</template>
