#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { basename, join } from 'path'

import {
  extractTemuDataFromHtml,
  normalizeMarketplaceUrl,
} from '../src/site/lib/temu.ts'

type GuideProduct = {
  rank: number
  name: string
  description: string
  rating?: number
  price?: string
  image?: string
  imageWidth?: number
  imageHeight?: number
  imageWebp?: string
  imageAvif?: string
  productUrl?: string
  pros?: string[]
  cons?: string[]
}

type GuideSection = {
  id: string
  title: string
  products: GuideProduct[]
}

type GuideData = {
  title: string
  description: string
  metaDescription?: string
  publishedDate?: string
  updatedDate: string
  sections: GuideSection[]
}

type ExtractionStatus = 'ready' | 'needs_authentication' | 'incomplete'

type ProductDraft = {
  name?: string
  description?: string
  rating?: number
  reviewCount?: number
  price?: string
  image?: string
  galleryImages?: string[]
  videoUrl?: string
  reviewSnippets?: string[]
  imageWidth?: number
  imageHeight?: number
  imageWebp?: string
  imageAvif?: string
  productUrl?: string
  pros?: string[]
  cons?: string[]
}

type TargetSuggestion = {
  page: string
  section: string
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

type PreparedProduct = {
  status: ExtractionStatus
  source: 'url' | 'json'
  target: TargetSuggestion
  product: ProductDraft
  checklist: ProductChecklistItem[]
  completeness: CompletenessReport
  warnings: string[]
  nextAction?: string
}

type CliOptions = {
  mode: 'prepare' | 'apply'
  url?: string
  json?: string
  inputFile?: string
  page?: string
  section?: string
  rank?: number
  minCompleteness?: CompletenessLevel
}

type CompletenessLevel = 'minimum_publishable' | 'strong_publishable' | 'premium_enrichment'

type ProductChecklistItem = {
  field: string
  status: 'required' | 'recommended' | 'bonus'
  present: boolean
  notes?: string
}

type CompletenessReport = {
  level: CompletenessLevel | 'insufficient'
  meetsMinimumPublishable: boolean
  meetsStrongPublishable: boolean
  meetsPremiumEnrichment: boolean
}

const GUIDE_FILES = new Set([
  'gadgets-informatique',
  'kitchen-gadgets',
  'summer-cooling',
])

const GUIDE_KEYWORDS: Array<{
  page: string
  section: string
  confidence: TargetSuggestion['confidence']
  reason: string
  patterns: RegExp[]
}> = [
  {
    page: 'gadgets-informatique',
    section: 'ergonomie-bureau',
    confidence: 'high',
    reason: 'Matched laptop stand or desk ergonomics vocabulary.',
    patterns: [/\b(laptop|ordinateur portable|pc portable|support pc|support laptop|ergonom)/i],
  },
  {
    page: 'gadgets-informatique',
    section: 'connectique-usb',
    confidence: 'high',
    reason: 'Matched USB hub or adapter vocabulary.',
    patterns: [/\b(usb-c|usb c|hub usb|adaptateur|dock|ethernet|hdmi|lecteur de carte)\b/i],
  },
  {
    page: 'gadgets-informatique',
    section: 'organisation-cables',
    confidence: 'high',
    reason: 'Matched cable organization vocabulary.',
    patterns: [/\b(cable|câble|range cable|range-cable|organisateur|attache cable|gaine)\b/i],
  },
  {
    page: 'gadgets-informatique',
    section: 'gadgets-usb',
    confidence: 'medium',
    reason: 'Matched small USB accessory vocabulary.',
    patterns: [/\b(usb|led|lampe usb|ventilateur usb|chauffe tasse|mini gadget)\b/i],
  },
  {
    page: 'summer-cooling',
    section: 'ventilateurs',
    confidence: 'high',
    reason: 'Matched cooling or fan vocabulary.',
    patterns: [/\b(ventilat|cooling|rafra|brumisateur|clim)\b/i],
  },
  {
    page: 'summer-cooling',
    section: 'accessoires',
    confidence: 'medium',
    reason: 'Matched summer accessory vocabulary.',
    patterns: [/\b(gilet|glace|coussin refroidissant|serviette froide)\b/i],
  },
  {
    page: 'kitchen-gadgets',
    section: 'ustensiles',
    confidence: 'low',
    reason: 'Fallback for non-matched products.',
    patterns: [],
  },
]

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node tools/add-temu-product.ts prepare --url <temu-url>',
      '  node tools/add-temu-product.ts prepare --input-file <payload.json>',
      '  node tools/add-temu-product.ts apply --input-file <payload.json> --page <slug> --section <id> [--rank 1] [--min-completeness strong_publishable]',
      '',
      'Notes:',
      '  - prepare never writes guide data',
      '  - apply checks payload completeness before writing',
      '  - if prepare reports needs_authentication, continue with the browser-assisted Temu login workflow',
    ].join('\n')
  )
}

function parseArgs(argv: string[]): CliOptions {
  const [modeRaw, ...rest] = argv

  if (!modeRaw || (modeRaw !== 'prepare' && modeRaw !== 'apply')) {
    printUsage()
    process.exit(1)
  }

  const options: CliOptions = { mode: modeRaw }

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    const next = rest[index + 1]

    if (token === '--url' && next) {
      options.url = next
      index += 1
      continue
    }

    if (token === '--json' && next) {
      options.json = next
      index += 1
      continue
    }

    if (token === '--input-file' && next) {
      options.inputFile = next
      index += 1
      continue
    }

    if (token === '--page' && next) {
      options.page = next
      index += 1
      continue
    }

    if (token === '--section' && next) {
      options.section = next
      index += 1
      continue
    }

    if (token === '--rank' && next) {
      options.rank = Number.parseInt(next, 10)
      index += 1
      continue
    }

    if (token === '--min-completeness' && next) {
      if (
        next === 'minimum_publishable' ||
        next === 'strong_publishable' ||
        next === 'premium_enrichment'
      ) {
        options.minCompleteness = next
        index += 1
        continue
      }
      throw new Error(`invalid_min_completeness:${next}`)
    }

    throw new Error(`unknown_argument:${token}`)
  }

  return options
}

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(join(process.cwd(), path), 'utf8'))
}

function normalizeText(value?: string): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()
  return normalized ? normalized : undefined
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const normalized = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
  return normalized.length ? normalized : undefined
}

function normalizeProductDraft(value: unknown): ProductDraft {
  if (!value || typeof value !== 'object') {
    throw new Error('invalid_product_payload')
  }

  const record = value as Record<string, unknown>

  return {
    name: normalizeText(typeof record.name === 'string' ? record.name : undefined),
    description: normalizeText(
      typeof record.description === 'string' ? record.description : undefined
    ),
    rating:
      typeof record.rating === 'number' && Number.isFinite(record.rating)
        ? record.rating
        : undefined,
    reviewCount:
      typeof record.reviewCount === 'number' && Number.isFinite(record.reviewCount)
        ? record.reviewCount
        : undefined,
    price: normalizeText(typeof record.price === 'string' ? record.price : undefined),
    image: normalizeText(typeof record.image === 'string' ? record.image : undefined),
    galleryImages: asStringArray(record.galleryImages),
    videoUrl: normalizeText(typeof record.videoUrl === 'string' ? record.videoUrl : undefined),
    reviewSnippets: asStringArray(record.reviewSnippets),
    imageWidth:
      typeof record.imageWidth === 'number' && Number.isFinite(record.imageWidth)
        ? record.imageWidth
        : undefined,
    imageHeight:
      typeof record.imageHeight === 'number' && Number.isFinite(record.imageHeight)
        ? record.imageHeight
        : undefined,
    imageWebp: normalizeText(
      typeof record.imageWebp === 'string' ? record.imageWebp : undefined
    ),
    imageAvif: normalizeText(
      typeof record.imageAvif === 'string' ? record.imageAvif : undefined
    ),
    productUrl: normalizeText(
      typeof record.productUrl === 'string'
        ? record.productUrl
        : typeof record.url === 'string'
          ? record.url
          : undefined
    ),
    pros: asStringArray(record.pros),
    cons: asStringArray(record.cons),
  }
}

function buildChecklist(product: ProductDraft): ProductChecklistItem[] {
  const galleryCount = product.galleryImages?.length ?? 0
  const reviewSnippetCount = product.reviewSnippets?.length ?? 0

  return [
    { field: 'name', status: 'required', present: Boolean(product.name) },
    { field: 'productUrl', status: 'required', present: Boolean(product.productUrl) },
    { field: 'description', status: 'required', present: Boolean(product.description) },
    { field: 'primaryImage', status: 'required', present: Boolean(product.image) },
    { field: 'galleryImages', status: 'recommended', present: galleryCount >= 3, notes: `count=${galleryCount}` },
    { field: 'price', status: 'recommended', present: Boolean(product.price) },
    { field: 'rating', status: 'recommended', present: typeof product.rating === 'number' },
    {
      field: 'reviewCount',
      status: 'recommended',
      present: typeof product.reviewCount === 'number',
    },
    {
      field: 'pros',
      status: 'recommended',
      present: (product.pros?.length ?? 0) > 0,
      notes: `count=${product.pros?.length ?? 0}`,
    },
    {
      field: 'videoUrl',
      status: 'bonus',
      present: Boolean(product.videoUrl),
    },
    {
      field: 'reviewSnippets',
      status: 'bonus',
      present: reviewSnippetCount > 0,
      notes: `count=${reviewSnippetCount}`,
    },
    {
      field: 'imageWidth',
      status: 'bonus',
      present: typeof product.imageWidth === 'number',
    },
    {
      field: 'imageHeight',
      status: 'bonus',
      present: typeof product.imageHeight === 'number',
    },
  ]
}

function computeCompleteness(product: ProductDraft): CompletenessReport {
  const hasMinimum =
    Boolean(product.name) &&
    Boolean(product.productUrl) &&
    Boolean(product.description) &&
    Boolean(product.image)

  const hasStrong =
    hasMinimum &&
    (product.galleryImages?.length ?? 0) >= 3 &&
    Boolean(product.price) &&
    typeof product.rating === 'number' &&
    typeof product.reviewCount === 'number' &&
    (product.pros?.length ?? 0) > 0

  const hasPremium =
    hasStrong &&
    Boolean(product.videoUrl) &&
    (product.reviewSnippets?.length ?? 0) > 0 &&
    typeof product.imageWidth === 'number' &&
    typeof product.imageHeight === 'number'

  return {
    level: hasPremium
      ? 'premium_enrichment'
      : hasStrong
        ? 'strong_publishable'
        : hasMinimum
          ? 'minimum_publishable'
          : 'insufficient',
    meetsMinimumPublishable: hasMinimum,
    meetsStrongPublishable: hasStrong,
    meetsPremiumEnrichment: hasPremium,
  }
}

function buildPreparedProduct(args: {
  status: ExtractionStatus
  source: 'url' | 'json'
  target: TargetSuggestion
  product: ProductDraft
  warnings: string[]
  nextAction?: string
}): PreparedProduct {
  return {
    ...args,
    checklist: buildChecklist(args.product),
    completeness: computeCompleteness(args.product),
  }
}

function detectTarget(text: string): TargetSuggestion {
  for (const candidate of GUIDE_KEYWORDS) {
    if (!candidate.patterns.length) {
      continue
    }

    if (candidate.patterns.some((pattern) => pattern.test(text))) {
      return {
        page: candidate.page,
        section: candidate.section,
        confidence: candidate.confidence,
        reason: candidate.reason,
      }
    }
  }

  const fallback = GUIDE_KEYWORDS[GUIDE_KEYWORDS.length - 1]
  return {
    page: fallback.page,
    section: fallback.section,
    confidence: fallback.confidence,
    reason: fallback.reason,
  }
}

function isLikelyTemuLoginPage(html: string, resolvedUrl: string): boolean {
  return (
    /login/i.test(resolvedUrl) ||
    /log in|sign in|continue with google|continue with facebook/i.test(html)
  )
}

function isLikelyTemuProductUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      /temu\.com$/i.test(parsed.hostname) &&
      (parsed.pathname.includes('/goods') || parsed.searchParams.has('goods_id'))
    )
  } catch {
    return false
  }
}

async function prepareFromUrl(rawUrl: string): Promise<PreparedProduct> {
  const sourceUrl = normalizeMarketplaceUrl(rawUrl)
  const response = await fetch(sourceUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/137.0' },
    redirect: 'follow',
  })

  const resolvedUrl = response.url
  const html = await response.text()

  if (isLikelyTemuLoginPage(html, resolvedUrl)) {
    const target = detectTarget(sourceUrl)
    return {
      ...buildPreparedProduct({
        status: 'needs_authentication',
        source: 'url',
        target,
        product: {
          productUrl: sourceUrl,
        },
        warnings: [
          'Temu redirected this product page to login before reliable product fields were visible.',
        ],
        nextAction:
          'Continue with the authenticated Temu browser workflow, then rerun apply with the normalized payload.',
      }),
    }
  }

  const extracted = extractTemuDataFromHtml(html, sourceUrl, resolvedUrl)
  const noReliableFields =
    !normalizeText(extracted.title) &&
    !normalizeText(extracted.description) &&
    extracted.images.length === 0

  if (noReliableFields && isLikelyTemuProductUrl(sourceUrl)) {
    const target = detectTarget(sourceUrl)
    return {
      ...buildPreparedProduct({
        status: 'needs_authentication',
        source: 'url',
        target,
        product: {
          productUrl: sourceUrl,
        },
        warnings: [
          'Temu did not expose reliable product fields through unauthenticated HTML fetch for this product URL.',
        ],
        nextAction:
          'Open the product in the authenticated browser workflow, then rerun apply with the normalized payload.',
      }),
    }
  }

  const product: ProductDraft = {
    name: normalizeText(extracted.title),
    description: normalizeText(extracted.description),
    image: extracted.images[0],
    galleryImages: extracted.images.length ? extracted.images.slice(0, 8) : undefined,
    productUrl: sourceUrl,
  }
  const warnings: string[] = []

  if (!product.name) warnings.push('Missing visible product title.')
  if (!product.description) warnings.push('Missing visible product description.')
  if (!product.image) warnings.push('Missing visible primary image URL.')

  const text = `${product.name ?? ''} ${product.description ?? ''}`.trim()
  const target = detectTarget(text || sourceUrl)

  return buildPreparedProduct({
    status: warnings.length ? 'incomplete' : 'ready',
    source: 'url',
    target,
    product,
    warnings,
    nextAction: warnings.length
      ? 'Enrich the missing fields manually or via authenticated browser extraction before apply.'
      : 'Payload is good enough for review or apply.',
  })
}

function prepareFromJson(value: unknown): PreparedProduct {
  const product = normalizeProductDraft(value)
  const text = `${product.name ?? ''} ${product.description ?? ''}`.trim()
  const target = detectTarget(text)
  const warnings: string[] = []

  if (!product.name) warnings.push('Missing product name.')
  if (!product.description) warnings.push('Missing product description.')
  if (!product.productUrl) warnings.push('Missing productUrl.')

  return buildPreparedProduct({
    status: warnings.length ? 'incomplete' : 'ready',
    source: 'json',
    target,
    product,
    warnings,
    nextAction: warnings.length
      ? 'Complete the missing fields before apply.'
      : 'Payload is good enough for apply.',
  })
}

function loadPreparedProduct(options: CliOptions): PreparedProduct {
  if (options.inputFile) {
    return prepareFromJson(readJsonFile(options.inputFile))
  }

  if (options.json) {
    return prepareFromJson(JSON.parse(options.json))
  }

  throw new Error('apply_requires_json_payload')
}

function readGuideData(page: string): GuideData {
  if (!GUIDE_FILES.has(page)) {
    throw new Error(`unknown_guide:${page}`)
  }

  return JSON.parse(
    readFileSync(join(process.cwd(), `src/site/data/${page}.json`), 'utf8')
  ) as GuideData
}

function validateForApply(prepared: PreparedProduct): asserts prepared is PreparedProduct & {
  product: Required<Pick<GuideProduct, 'name' | 'description' | 'productUrl'>> &
    ProductDraft
} {
  if (prepared.status === 'needs_authentication') {
    throw new Error('authentication_required_before_apply')
  }

  if (!prepared.product.name || !prepared.product.description || !prepared.product.productUrl) {
    throw new Error('apply_requires_name_description_productUrl')
  }
}

function meetsCompletenessLevel(
  completeness: CompletenessReport,
  level: CompletenessLevel
): boolean {
  if (level === 'minimum_publishable') return completeness.meetsMinimumPublishable
  if (level === 'strong_publishable') return completeness.meetsStrongPublishable
  return completeness.meetsPremiumEnrichment
}

function computeRank(
  products: GuideProduct[],
  explicitRank: number | undefined
): number {
  if (typeof explicitRank === 'number' && Number.isFinite(explicitRank) && explicitRank > 0) {
    return explicitRank
  }

  const maxRank = products.reduce((current, product) => Math.max(current, product.rank), 0)
  return maxRank + 1
}

function upsertProduct(
  page: string,
  sectionId: string,
  prepared: PreparedProduct,
  explicitRank?: number
) {
  validateForApply(prepared)

  const data = readGuideData(page)
  const target = data.sections.find((section) => section.id === sectionId)

  if (!target) {
    throw new Error(`unknown_section:${sectionId}`)
  }

  const existingIndex = target.products.findIndex(
    (product) =>
      product.productUrl === prepared.product.productUrl ||
      product.name.toLowerCase() === prepared.product.name.toLowerCase()
  )

  const product: GuideProduct = {
    rank:
      existingIndex >= 0
        ? target.products[existingIndex].rank
        : computeRank(target.products, explicitRank),
    name: prepared.product.name,
    description: prepared.product.description,
    productUrl: prepared.product.productUrl,
  }

  if (typeof prepared.product.rating === 'number') product.rating = prepared.product.rating
  if (typeof prepared.product.reviewCount === 'number') {
    ;(product as GuideProduct & { reviewCount?: number }).reviewCount = prepared.product.reviewCount
  }
  if (prepared.product.price) product.price = prepared.product.price
  if (prepared.product.image) product.image = prepared.product.image
  if (typeof prepared.product.imageWidth === 'number') {
    product.imageWidth = prepared.product.imageWidth
  }
  if (typeof prepared.product.imageHeight === 'number') {
    product.imageHeight = prepared.product.imageHeight
  }
  if (prepared.product.imageWebp) product.imageWebp = prepared.product.imageWebp
  if (prepared.product.imageAvif) product.imageAvif = prepared.product.imageAvif
  if (prepared.product.galleryImages?.length) {
    ;(product as GuideProduct & { galleryImages?: string[] }).galleryImages =
      prepared.product.galleryImages
  }
  if (prepared.product.videoUrl) {
    ;(product as GuideProduct & { videoUrl?: string }).videoUrl = prepared.product.videoUrl
  }
  if (prepared.product.reviewSnippets?.length) {
    ;(product as GuideProduct & { reviewSnippets?: string[] }).reviewSnippets =
      prepared.product.reviewSnippets
  }
  if (prepared.product.pros?.length) product.pros = prepared.product.pros
  if (prepared.product.cons?.length) product.cons = prepared.product.cons

  if (existingIndex >= 0) {
    target.products[existingIndex] = {
      ...target.products[existingIndex],
      ...product,
    }
  } else {
    target.products.push(product)
  }

  target.products.sort((left, right) => left.rank - right.rank)
  data.updatedDate = new Date().toISOString().slice(0, 10)

  const outputPath = join(process.cwd(), `src/site/data/${page}.json`)
  writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`)

  return {
    outputPath,
    page,
    sectionId,
    rank: product.rank,
    existing: existingIndex >= 0,
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.mode === 'prepare') {
    let prepared: PreparedProduct

    if (options.url) {
      prepared = await prepareFromUrl(options.url)
    } else if (options.inputFile) {
      prepared = prepareFromJson(readJsonFile(options.inputFile))
    } else if (options.json) {
      prepared = prepareFromJson(JSON.parse(options.json))
    } else {
      throw new Error('prepare_requires_url_or_json')
    }

    console.log(JSON.stringify(prepared, null, 2))
    return
  }

  const prepared = loadPreparedProduct(options)
  const minCompleteness = options.minCompleteness ?? 'strong_publishable'

  if (!meetsCompletenessLevel(prepared.completeness, minCompleteness)) {
    throw new Error(
      `apply_requires_completeness:${minCompleteness}:current=${prepared.completeness.level}`
    )
  }

  const page = options.page ?? prepared.target.page
  const section = options.section ?? prepared.target.section
  const result = upsertProduct(page, section, prepared, options.rank)

  console.log(
    JSON.stringify(
      {
        status: 'applied',
        page: result.page,
        section: result.sectionId,
        rank: result.rank,
        updated: result.existing ? 'existing_product_updated' : 'new_product_inserted',
        file: basename(result.outputPath),
      },
      null,
      2
    )
  )
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(JSON.stringify({ status: 'error', message }, null, 2))
  process.exit(1)
})
