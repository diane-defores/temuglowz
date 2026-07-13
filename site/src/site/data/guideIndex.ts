import kitchenGadgetsData from './kitchen-gadgets.json'
import summerCoolingData from './summer-cooling.json'

export interface GuideIndexEntry {
  slug: string
  title: string
  homepageTitle: string
  description: string
  updatedDate: string
  category: string
  readingHint: string
}

export const guideIndex: GuideIndexEntry[] = [
  {
    slug: '/guides/kitchen-gadgets',
    title: kitchenGadgetsData.title,
    homepageTitle: 'Les petits gadgets qui simplifient vraiment la cuisine',
    description: kitchenGadgetsData.description,
    updatedDate: kitchenGadgetsData.updatedDate,
    category: 'Cuisine',
    readingHint: 'Découper, ranger, nettoyer… des idées toutes simples pour se faciliter la vie.',
  },
  {
    slug: '/guides/summer-cooling',
    title: summerCoolingData.title,
    homepageTitle: 'Les accessoires qui rendent les grosses chaleurs plus supportables',
    description: summerCoolingData.description,
    updatedDate: summerCoolingData.updatedDate,
    category: 'Été',
    readingHint: 'Ventilos de poche, accessoires frais et autres idées bienvenues quand le thermomètre grimpe.',
  },
]
