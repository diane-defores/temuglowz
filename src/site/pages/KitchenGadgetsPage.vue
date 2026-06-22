<script setup lang="ts">
import PillarPage from '@/site/components/PillarPage.vue'

const kitchenGadgets = {
  title: 'Les Meilleurs Gadgets pour la Cuisine en 2025',
  subtitle: 'Notre sélection des 15 accessoires indispensables pour cuisiner comme un pro',
  description: 'Vous cherchez l\'équipement parfait pour votre cuisine ? Découvrez notre comparatif complet des meilleurs gadgets, testés et approuvés par nos experts pour vous aider à choisir.',
  updatedDate: '2025-01-15',
  author: 'L\'Équipe TemuGlowz',
  metaDescription: 'Découvrez les meilleurs gadgets cuisine 2025 : compares, tests, avis et prix pour choisir le meilleur équipement pour votre cuisine.',
  sections: [
    {
      id: 'essentiels',
      title: 'Les indispensables de base',
      products: [
        {
          rank: 1,
          name: 'Couteau en acier inoxydable 8 pouces',
          rating: 4.8,
          price: '24,99 €',
          image: 'https://placehold.co/400x300/18181b/ffffff?text=Couteau+Pro',
          amazonUrl: 'https://amazon.fr',
          description: 'Un couteau de chef professionnel au rapport qualité-prix imbattable. Lame en acier allemand, manche ergonomique.',
          pros: ['Très affûte', 'Confort optimal', 'Entretien simple'],
        },
        {
          rank: 2,
          name: 'Planche à découper en bambou',
          rating: 4.6,
          price: '19,90 €',
          image: 'https://placehold.co/400x300/18181b/ffffff?text=Planche',
          amazonUrl: 'https://amazon.fr',
          description: 'Planche résistante aux champignons et les acides, idéale pour préparer tous vos légumes.',
          pros: ['Antibactérienne', 'Double faces', 'Design élégant'],
        },
      ],
    },
    {
      id: 'express',
      title: 'Pour gagner du temps',
      products: [
        {
          rank: 1,
          name: 'Robot mixeur multifonctions 1500W',
          rating: 4.7,
          price: '129,99 €',
          image: 'https://placehold.co/400x300/18181b/ffffff?text=Robot',
          amazonUrl: 'https://amazon.fr',
          description: 'Multifonctions pour pâtes, smoothies, pâtisserie. Programme automatique et nettoyage en 30s.',
          pros: ['15 programmes', 'Lavage auto', 'Silencieux'],
          cons: ['Encombrant'],
        },
      ],
    },
  ],
  faq: [
    {
      question: 'Quel est le meilleur couteau pour débuter ?',
      answer: 'Un couteau de chef 8 pouces en acier inoxydable est le choix le plus polyvalent pour une cuisine amateur.',
    },
    {
      question: 'Faut-il investir dans un robot mixeur ?',
      answer: 'Si vous cuisinez régulièrement, oui. Pour un usage occasionnel, des accessoires basiques suffisent.',
    },
  ],
}
</script>

<template>
  <PillarPage v-bind="kitchenGadgets" />
</template>