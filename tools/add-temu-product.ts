#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type Product = {
  rank: number
  name: string
  rating: number
  price?: string
  image: string
  productUrl?: string
  description: string
  pros?: string[]
  cons?: string[]
}

type Suggestion = {
  page: string
  section: string
}

function detectTarget(text: string): Suggestion {
  const t = text.toLowerCase()
  if (/\b(ventilateur|clim|glace|gilet|coussin|rafraichi)\b/.test(t)) {
    return { page: 'summer-cooling', section: t.includes('gilet') || t.includes('glace') ? 'accessoires' : 'ventilateurs' }
  }
  return { page: 'kitchen-gadgets', section: 'ustensiles' }
}

async function extractFromUrl(url: string): Promise<Partial<Product>> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/137.0' },
    redirect: 'follow',
  })
  
  if (!response.ok) return {}
  
  const html = await response.text()
  
  const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) || 
                     html.match(/<title>([^<]+)<\/title>/i)
  const imageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
  const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) ||
                    html.match(/"description":"([^"]+)"/i)
  
  return {
    name: titleMatch?.[1]?.split('|')[0]?.trim() || '',
    image: imageMatch?.[1] || '',
    description: descMatch?.[1] || '',
  }
}

function insertProduct(page: string, sectionId: string, product: Product): boolean {
  const dataPath = join(process.cwd(), `src/site/data/${page}.json`)
  const data = JSON.parse(readFileSync(dataPath, 'utf8'))
  const target = data.sections.find((s: {id: string}) => s.id === sectionId)
  
  if (!target) return false
  if (target.products.some((p: Product) => p.name === product.name)) return true
  
  target.products.push(product)
  target.products.sort((a: Product, b: Product) => a.rank - b.rank)
  
  writeFileSync(dataPath, JSON.stringify(data, null, 2))
  return true
}

async function main() {
  const [input] = process.argv.slice(2)
  
  if (!input) {
    console.log('Usage: npx tsx tools/add-temu-product.ts <url|json>')
    return
  }

  let product: Partial<Product>
  
  if (input.startsWith('http')) {
    console.log(`🔄 Extraction depuis ${input}`)
    product = await extractFromUrl(input)
    product.productUrl = input
  } else {
    product = JSON.parse(input)
  }

  const target = detectTarget(`${product.name} ${product.description || ''}`)
  
  const fullProduct: Product = {
    rank: 99,
    name: product.name || '',
    rating: 4.5,
    price: product.price || 'Prix non renseigné',
    image: product.image || '',
    productUrl: product.productUrl || '',
    description: product.description || '',
    pros: product.pros || ['Bon rapport qualité/prix'],
  }

  console.log(`🎯 ${fullProduct.name} → /guides/${target.page}#${target.section}`)
  
  if (insertProduct(target.page, target.section, fullProduct)) {
    console.log('✅ Ajouté')
  } else {
    console.log('❌ Erreur d\'insertion')
  }
}

main()