<script setup lang="ts">
import PillarPage from '@/site/components/PillarPage.vue'

const summerCooling = {
  title: 'Les Meilleurs Ventilateurs et Accessoires pour se Rafraîchir cet Été 2025',
  subtitle: 'Notre sélection des 10 meilleures solutions pour surfer la chaleur sans exploser la facture',
  description: 'Face à la canicule, voici nos ventilateurs performants, accessoires cooling et solutions d\'habitation fraîche testés sur Temu. Qualité, performances et prix au top.',
  updatedDate: '2025-06-22',
  metaDescription: 'Top ventilateurs Temu 2025: compares, tests et prix pour rester au frais cet été. Solutions pas chères et efficaces.',
  sections: [
    {
      id: 'ventilateurs',
      title: 'Les meilleurs ventilateurs USB et portables',
      products: [
        {
          rank: 1,
          name: 'Ventilateur turbo portable 100 niveaux 3000mAh',
          rating: 4.7,
          price: '28,99 €',
          image: 'https://img.kwcdn.com/product/open/1ba73760cc6743218677066b740407a6-goods.jpeg',
          amazonUrl: 'https://www.temu.com/fr/ventilateur-portable-%C3%A0--%C3%A0-la-taille-ventilateur-turbo-100-niveaux-avec-batterie-3000mah-ventilateur-rechargeable-%C3%A0-affichage-num%C3%A9rique-pour-chantiers-randonn%C3%A9e-jardinage-%C3%A9t%C3%A9-pour-les--en-voiture-g-606280064301718.html',
          description: 'Ventilateur turbo personnalisable avec 100 niveaux de vitesse, batterie 3000mAh, affichage numérique. Parfait chantiers, randonnée, jardinage.',
          pros: ['100 niveaux précis', '3000mAh batterie', 'Affichage numérique'],
        },
        {
          rank: 2,
          name: 'Ventilateur USB portable 3 vitesses LED',
          rating: 4.6,
          price: '4,99 €',
          image: 'https://placehold.co/400x300/0ea5e9/ffffff?text=Ventilateur+USB',
          amazonUrl: 'https://www.temu.com/fr/c/fans-air-conditioners-heating-o4-768.html',
          description: 'Ventilateur portable ultra-compact, 3 vitesses, LED night light, charge USB-C. Idéal bureau et chambre.',
          pros: ['Ultra compact', 'LED inclus', '3 vitesses'],
        },
        {
          rank: 3,
          name: 'Ventilateur de bureau double tête 3 vitesses',
          rating: 4.5,
          price: '16,48 €',
          image: 'https://placehold.co/400x300/0ea5e9/ffffff?text=Ventilateur+Bureau',
          amazonUrl: 'https://www.temu.com/fr/c/fans-air-conditioners-heating-o4-768.html',
          description: 'Ventilateur de bureau double tête à trois pales, réglage à 3 vitesses, charge USB, idéal bureau et dortoir.',
          pros: ['Double zone de rafraîchissement', 'Charge USB', '3 vitesses'],
        },
        {
          rank: 4,
          name: 'Ventilateur collier necklace personnalisé',
          rating: 4.4,
          price: '9,99 €',
          image: 'https://placehold.co/400x300/0ea5e9/ffffff?text=Ventilateur+Collier',
          amazonUrl: 'https://www.temu.com/fr/c/fans-air-conditioners-heating-o4-768.html',
          description: 'Ventilateur autonome en forme de collier, refroidit directement le cou et les tempes. Design futuriste.',
          pros: ['Design original', 'Silencieux', 'Idéal randonnée'],
        },
      ],
    },
    {
      id: 'accessoires',
      title: 'Accessoires cooling insolites',
      products: [
        {
          rank: 1,
          name: 'Climatiseur de cou portable 360°',
          rating: 4.6,
          price: '24,99 €',
          image: 'https://img.kwcdn.com/product/fancy/931dbdcc-1c0b-4a19-b53a-fdbc88f6cf02.jpg',
          amazonUrl: 'https://www.temu.com/fr/climatiseur-de-cou-portable-ventilateur-de-cou-portable-%C3%A0-flux-d-air--ventilateur-de-cou-%C3%A0-refroidissement-360-pour-tout--climatiseur-de-cou-rechargeable-5200mah-avec--plaque-de-refroidissement-refroidisseur-de-cou-plaque-de-refroidissement-ventilateur-de-cou-g-601100024747812.html',
          description: 'Climatiseur de cou portable à 360°, batterie 5200mAh, plaque de refroidissement gel intégrée. Rafraîchit directement le cou.',
          pros: ['Rafraîchit le cou', '5200mAh batterie', 'Design ergonomique'],
        },
        {
          rank: 2,
          name: 'Gilet de refroidissement réglable hommes/femmes',
          rating: 4.5,
          price: '18,99 €',
          image: 'https://img.kwcdn.com/product/fancy/4a4f3845-6379-4cae-9fdc-ed062284a3df.jpg',
          amazonUrl: 'https://www.temu.com/fr/gilet-de-refroidissement-r%C3%A9glable-pour-hommes-et-femmes-con%C3%A7u-pour-les--chauds-avec-plusieurs-cellules-de-refroidissement-parfait-pour-les-activit%C3%A9s-de--g-606476642931323.html',
          description: 'Gilet de refroidissement ajustable avec plusieurs cellules cooling, parfait pour activités sportives et chaleur intense.',
          pros: ['Confortable', 'Réglable', 'Pour sport/quotidien'],
        },
        {
          rank: 3,
          name: 'Glace chimique rafraîchissante pliable',
          rating: 4.3,
          price: '5,99 €',
          image: 'https://placehold.co/400x300/10b981/ffffff?text=Glace+Cooling',
          amazonUrl: 'https://www.temu.com/fr/c/fans-air-conditioners-heating-o4-768.html',
          description: 'Glace chimique rafraîchissante pliable, fond en 30 secondes, refroidit 30 minutes. Reusable.',
          pros: ['Instantané', 'Reusable', 'Pas cher'],
        },
      ],
    },
    {
      id: 'maison',
      title: 'Solutions pour la maison',
      products: [
        {
          rank: 1,
          name: 'Climatiseur évaporatif 3en1 grand format',
          rating: 4.4,
          price: '19,04 €',
          image: 'https://placehold.co/400x300/8b5cf6/ffffff?text=Clim+Grand',
          amazonUrl: 'https://www.temu.com/fr/c/fans-air-conditioners-heating-o4-768.html',
          description: 'Climatiseur évaporatif portable 3en1, 650ml réservoir, 3 vitesses vent, 7 LED ambiance.',
          pros: ['Grand réservoir', '3 vitesses', 'Éclairage ambiance'],
          cons: ['Volume important'],
        },
        {
          rank: 2,
          name: 'Ventilateur colonne pliable 4 pieds',
          rating: 4.2,
          price: '22,99 €',
          image: 'https://placehold.co/400x300/8b5cf6/ffffff?text=Ventilateur+Colonne',
          amazonUrl: 'https://www.temu.com/fr/c/fans-air-conditioners-heating-o4-768.html',
          description: 'Ventilateur colonne pliable 4 pieds, 3 vitesses, large couverture salon.',
          pros: ['Grande couverture', 'Pliable', '3 vitesses'],
        },
      ],
    },
  ],
  faq: [
    {
      question: 'Quel ventilateur choisir pour un grand salon ?',
      answer: 'Un ventilateur colonne pliable 4 pieds ou climatiseur évaporatif 650ml couvrent efficacement jusqu\'à 25m² avec un coût énergétique réduit.',
    },
    {
      question: 'Comment économiser sur l\'électricité en été ?',
      answer: 'Les ventilateurs USB consomment 2-5W seulement (0,01€/h). Programmez 1h avant de dormir et utilisez des rideaux occultants en journée.',
    },
    {
      question: 'Les climatiseurs évaporatifs sont-ils efficaces ?',
      answer: 'Oui ! Ils rafraîchissent l\'air par évaporation d\'eau. Efficaces jusqu\'à 30m² avec 10-15W seulement.',
    },
    {
      question: 'Quelle différence avec les ventilateurs classiques ?',
      answer: 'Les ventilateurs classiques déplacent l\'air. Les clims évaporatifs le rafraîchissent réellement en y ajoutant de l\'humidité.',
    },
    {
      question: 'Le ventilateur turbo 100 niveaux vaut-il le coup ?',
      answer: 'Excellent pour un contrôle précis de la vitesse, idéal chantier, jardinage ou randonnée. 3000mAh batterie offre 6-8h d\'autonomie.',
    },
  ],
}
</script>

<template>
  <PillarPage v-bind="summerCooling" />
</template>