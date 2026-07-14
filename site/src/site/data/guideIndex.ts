import kitchenGadgetsData from './kitchen-gadgets.json'
import summerCoolingData from './summer-cooling.json'
import { usageHubs } from './usageHubs'

export interface GuideIndexEntry {
  slug: string
  title: string
  homepageTitle: string
  description: string
  updatedDate: string
  category: string
  readingHint: string
  merchantFocus?: string
  icon?: 'kitchen' | 'cooling' | 'gift' | 'outdoors' | 'toolbox'
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
    merchantFocus: 'Temu',
    icon: 'kitchen',
  },
  {
    slug: '/guides/summer-cooling',
    title: summerCoolingData.title,
    homepageTitle: 'Les accessoires qui rendent les grosses chaleurs plus supportables',
    description: summerCoolingData.description,
    updatedDate: summerCoolingData.updatedDate,
    category: 'Été',
    readingHint: 'Ventilos de poche, accessoires frais et autres idées bienvenues quand le thermomètre grimpe.',
    merchantFocus: 'Temu',
    icon: 'cooling',
  },
  ...usageHubs.map(({ slug, title, homepageTitle, description, updatedDate, category, readingHint, icon }) => ({
    slug,
    title,
    homepageTitle,
    description,
    updatedDate,
    category,
    readingHint,
    icon,
  })),
]
