#!/usr/bin/env tsx

type Product = {
  rank: number
  name: string
  rating: number
  price: string
  image: string
  productUrl?: string
  description: string
  pros?: string[]
  cons?: string[]
}

type Suggestion = {
  page: string
  section: string
  reason: string
}

// Pages et leurs mots-clés pour devinette
const PAGE_KEYWORDS: Record<string, string[]> = {
  'kitchen-gadgets': ['cuisine', 'four', 'poêle', 'couteau', 'planche', 'œuf', 'œufs', 'éplucheur', 'casserole', 'mixeur', 'robot', 'ustensile', 'spatule'],
  'summer-cooling': ['ventilateur', 'clim', 'refroid', 'glace', 'frais', 'canicule', 'été', 'verre', 'gilet', 'coussin'],
  'christmas-gifts': ['cadeau', 'noël', 'fête', 'cadeaux', 'offert', 'offer'],
}

function guessPage(productName: string, description: string): Suggestion {
  const text = `${productName} ${description}`.toLowerCase()
  
  for (const [page, keywords] of Object.entries(PAGE_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        // Déterminer section
        if (text.includes('ventilateur') || text.includes('clim') || text.includes('glace') || text.includes('refroid') || text.includes('gilet') || text.includes('coussin')) {
          return { page, section: 'ventilateurs', reason: `Produit lié au rafraîchissement` }
        }
        if (text.includes('couteau') || text.includes('planche') || text.includes('éplucheur') || text.includes('œuf') || text.includes('œufs') || text.includes('ustensile') || text.includes('spatule')) {
          return { page: 'kitchen-gadgets', section: 'ustensiles', reason: `Ustensile de cuisine` }
        }
        if (text.includes('organisation') || text.includes('rangement') || text.includes('étiquette') || text.includes('tiroir')) {
          return { page, section: 'organisation', reason: `Accessoire d'organisation` }
        }
      }
    }
  }
  
  return { page: 'kitchen-gadgets', section: 'ustensiles', reason: 'Page par défaut' }
}

function generateVueSnippet(product: Product, page: string): string {
  return `        {
          rank: ${product.rank},
          name: '${product.name}',
          rating: ${product.rating},
          price: '${product.price}',
          image: '${product.image}',
          productUrl: '${product.productUrl || 'https://temu.com'}',
          description: '${product.description}',
          pros: ['${(product.pros || []).join("', '")}'],
          ${product.cons ? `cons: ['${product.cons.join("', '")}'],` : ''}
        },`
}

// Pour l'instant : mode suggestion seulement
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
Usage: add-temu-product.ts <product_name> <price> <image_url> <description>

Exemple:
  add-temu-product.ts "Séparateur d'Œufs PJ377252" "4,99 €" "https://img.jpg" "Éplucheur et diviseur de jaune rapide..."

Le script propose une mise à jour, vous validez avant l'insertion.
`)
    process.exit(0)
  }

  if (args.length < 4) {
    console.error('Erreur: besoin de nom, prix, image, description')
    process.exit(1)
  }

  const [name, price, image, desc] = args
  const suggestion = guessPage(name, desc)

  console.log(`
═════════════════════════════════════════
Proposition d'ajout produit
═════════════════════════════════════════

Produit  : ${name}
Prix     : ${price}
Image    : ${image}
Description : ${desc}

Page suggérée : /guides/${suggestion.page}
Section       : ${suggestion.section}
Raison        : ${suggestion.reason}

Snippet Vue à insérer :
${generateVueSnippet({
  rank: 99,
  name,
  rating: 4.5,
  price,
  image,
  description: desc,
  pros: ['Qualité prix', 'Facile utilisation'],
} as Product, suggestion.page)}

═════════════════════════════════════════
Vérifiez et insérez manuellement dans :
src/site/pages/${suggestion.page}.vue
═════════════════════════════════════════
`)
}

main()