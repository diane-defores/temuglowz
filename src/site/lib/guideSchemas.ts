interface GuideProduct {
  rank: number
  name: string
  rating?: number
  price?: string
  image?: string
  productUrl?: string
  description: string
}

interface GuideSection {
  id: string
  title: string
  products: GuideProduct[]
}

interface GuideFaqItem {
  question: string
  answer: string
}

interface GuideData {
  title: string
  description: string
  metaDescription?: string
  publishedDate?: string
  updatedDate: string
  sections: GuideSection[]
  faq?: GuideFaqItem[]
}

interface BuildGuideJsonLdOptions {
  path: string
  lang: string
  data: GuideData
}

const SITE_URL = 'https://temuglowz.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

function toAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) {
    return undefined
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  return new URL(pathOrUrl, `${SITE_URL}/`).toString()
}

function parseEuroPrice(price?: string) {
  if (!price) {
    return undefined
  }

  const normalized = price.replace(/[^\d,.-]/g, '').replace(',', '.')
  const amount = Number.parseFloat(normalized)
  return Number.isFinite(amount) ? amount.toFixed(2) : undefined
}

export function buildGuideJsonLd({ path, lang, data }: BuildGuideJsonLdOptions) {
  const canonicalUrl = new URL(path, `${SITE_URL}/`).toString()
  const publishedDate = data.publishedDate ?? data.updatedDate
  const modifiedDate = data.updatedDate
  const allProducts = data.sections.flatMap((section) => section.products ?? [])
  const leadImage = toAbsoluteUrl(allProducts[0]?.image) ?? DEFAULT_IMAGE

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: `${SITE_URL}/guides`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.title,
        item: canonicalUrl,
      },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.metaDescription ?? data.description,
    inLanguage: lang,
    mainEntityOfPage: canonicalUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    image: [leadImage],
    author: {
      '@type': 'Organization',
      name: 'TemuGlowz',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TemuGlowz',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
  }

  const schemas: Record<string, unknown>[] = [breadcrumbSchema, articleSchema]

  if (data.faq?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    })
  }

  if (allProducts.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: data.title,
      numberOfItems: allProducts.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: allProducts
        .slice()
        .sort((left, right) => left.rank - right.rank)
        .map((product, index) => {
          const price = parseEuroPrice(product.price)
          const productSchema: Record<string, unknown> = {
            '@type': 'Product',
            name: product.name,
            description: product.description,
          }

          const image = toAbsoluteUrl(product.image)
          if (image) {
            productSchema.image = image
          }

          if (product.productUrl) {
            productSchema.url = product.productUrl
          }

          if (typeof product.rating === 'number') {
            productSchema.aggregateRating = {
              '@type': 'AggregateRating',
              ratingValue: product.rating.toFixed(1),
              bestRating: '5',
              worstRating: '1',
            }
          }

          if (price) {
            const offerSchema: Record<string, unknown> = {
              '@type': 'Offer',
              price,
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
            }

            if (product.productUrl) {
              offerSchema.url = product.productUrl
            }

            productSchema.offers = offerSchema
          }

          const listItem: Record<string, unknown> = {
            '@type': 'ListItem',
            position: index + 1,
            item: productSchema,
          }

          if (product.productUrl) {
            listItem.url = product.productUrl
          }

          return listItem
        }),
    })
  }

  return schemas
}
