<script setup lang="ts">
import { onMounted } from 'vue'
import Hero from './components/Hero.vue'
import Navbar from './components/Navbar.vue'
import ProblemSection from './components/ProblemSection.vue'
import SolutionSection from './components/SolutionSection.vue'
import Benefits from './components/Benefits.vue'
import BentoGrid from './components/BentoGrid.vue'
import Testimonials from './components/Testimonials.vue'
import Pricing from './components/Pricing.vue'
import FinalCTA from './components/FinalCTA.vue'
import Newsletter from './components/Newsletter.vue'
import Footer from './components/Footer.vue'

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('revealed'))
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
  }
})
</script>

<template>
  <main id="main-content" class="min-h-screen bg-background text-foreground">
    <Navbar />
    <Hero />
    <ProblemSection />
    <SolutionSection />
    <Benefits />
    <BentoGrid />
    <Testimonials />
    <Pricing />
    <FinalCTA />
    <Newsletter />
    <Footer />
  </main>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');

:root {
  --font-sans: "Manrope", "Manrope Fallback", sans-serif;
  --font-cal-sans: "Cal Sans", "Cal Sans Fallback", sans-serif;
  --font-instrument-sans: "Instrument Sans", "Instrument Sans Fallback", sans-serif;
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.18 0 0);
  --card-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(0.269 0 0);
  --radius: 1rem;
  --noise-opacity: 0.015;
}

/* Light mode overrides when .dark is NOT present */
:not(.dark) {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(0.97 0 0);
  --card-foreground: oklch(0.145 0 0);
  --muted: oklch(0.9 0 0);
  --muted-foreground: oklch(0.4 0 0);
  --border: oklch(0.85 0 0);
  --noise-opacity: 0;
}

/* Noise overlay */
.noise-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* Shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer-btn {
  position: relative;
  overflow: hidden;
}
.shimmer-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

/* Pulse glow */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px currentColor; }
  50% { opacity: 0.6; box-shadow: 0 0 8px currentColor; }
}
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Reveal animations */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-up-slow {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes text-reveal {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes slide-down {
  from { transform: translateY(-100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.5) translateX(-20px); }
  to { opacity: 1; transform: scale(1) translateX(0); }
}
@keyframes border-beam {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}
.animate-fade-up {
  animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-fade-up-slow {
  animation: fade-up-slow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-text-reveal {
  animation: text-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-slide-down {
  animation: slide-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.border-beam {
  animation: border-beam 8s linear infinite;
}

/* Stagger delays */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
.delay-600 { animation-delay: 0.6s; }
.delay-700 { animation-delay: 0.7s; }
.delay-800 { animation-delay: 0.8s; }
.delay-900 { animation-delay: 0.9s; }

/* IntersectionObserver reveal */
[data-reveal] {
  opacity: 0;
}
[data-reveal].revealed {
  opacity: 1;
}
</style>