import kitchenGadgetsData from './kitchen-gadgets.json'
import summerCoolingData from './summer-cooling.json'

export interface GuideIndexEntry {
  slug: string
  title: string
  description: string
  updatedDate: string
  category: string
  readingHint: string
}

export const guideIndex: GuideIndexEntry[] = [
  {
    slug: '/guides/kitchen-gadgets',
    title: kitchenGadgetsData.title,
    description: kitchenGadgetsData.description,
    updatedDate: kitchenGadgetsData.updatedDate,
    category: 'Cuisine',
    readingHint: 'Ustensiles, rangement et accessoires à comparer pour la cuisine du quotidien.',
  },
  {
    slug: '/guides/summer-cooling',
    title: summerCoolingData.title,
    description: summerCoolingData.description,
    updatedDate: summerCoolingData.updatedDate,
    category: 'Été',
    readingHint: 'Formats portables et accessoires à comparer pour les journées chaudes.',
  },
]
