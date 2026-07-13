<script setup lang="ts">
import { ref } from 'vue'

const status = ref('Pas de spam, désinscription possible à tout moment.')
const statusClass = ref('text-xs text-muted-foreground')
const email = ref('')
const submitting = ref(false)

function submitForm(): void {
  if (!email.value || !email.value.includes('@')) {
    status.value = 'Veuillez saisir une adresse e-mail valide.'
    statusClass.value = 'mt-4 text-xs text-red-400'
    return
  }
  submitting.value = true
  status.value = ''
  statusClass.value = 'mt-4 text-xs text-muted-foreground'

  setTimeout(() => {
    status.value = 'Inscription confirmée ! Nous vous donnerons bientôt des nouvelles.'
    statusClass.value = 'mt-4 text-xs text-emerald-400'
    email.value = ''
    submitting.value = false
  }, 800)
}
</script>

<template>
  <section class="py-16 sm:py-24 bg-background">
    <div class="max-w-2xl mx-auto px-4 text-center" data-reveal>
      <h2 class="animate-fade-up text-2xl sm:text-3xl font-bold text-foreground mb-4" style="font-family: var(--font-instrument-sans);">
        Restez informé
      </h2>
      <p class="animate-fade-up delay-100 text-muted-foreground mb-8">
        Recevez les actualités produit, notes de version et idées de méthode TemuGlowz dans votre boîte de réception.
      </p>

      <form class="animate-fade-up delay-200 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" @submit.prevent="submitForm" novalidate>
        <label for="newsletter-email" class="sr-only">Adresse e-mail</label>
        <input
          id="newsletter-email"
          v-model="email"
          type="email"
          placeholder="Votre adresse e-mail"
          required
          autocomplete="email"
          class="flex-1 px-4 py-3 rounded-full bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm"
        />
        <button
          type="submit"
          :disabled="submitting"
          class="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-6 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Inscription…' : 'S’inscrire' }}
        </button>
      </form>

      <p :class="statusClass" role="status" aria-live="polite">{{ status }}</p>
    </div>
  </section>
</template>
