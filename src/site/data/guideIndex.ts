import gadgetsInformatiqueData from './gadgets-informatique.json'
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
    slug: '/guides/gadgets-informatique',
    title: gadgetsInformatiqueData.title,
    description: gadgetsInformatiqueData.description,
    updatedDate: gadgetsInformatiqueData.updatedDate,
    category: 'Informatique',
    readingHint: 'Supports laptop, hubs USB-C, cable organizers, and useful desk accessories.',
  },
  {
    slug: '/guides/kitchen-gadgets',
    title: kitchenGadgetsData.title,
    description: kitchenGadgetsData.description,
    updatedDate: kitchenGadgetsData.updatedDate,
    category: 'Cuisine',
    readingHint: 'Kitchen tools, organizers, and low-cost accessories for everyday cooking.',
  },
  {
    slug: '/guides/summer-cooling',
    title: summerCoolingData.title,
    description: summerCoolingData.description,
    updatedDate: summerCoolingData.updatedDate,
    category: 'Ete',
    readingHint: 'Portable fans, cooling gadgets, and compact summer comfort picks.',
  },
]
