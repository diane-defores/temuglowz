export interface MerchantRecord {
  id: string
  name: string
  allowedHosts: string[]
  note: string
}

export const MERCHANTS: MerchantRecord[] = [
  {
    id: 'temu',
    name: 'Temu',
    allowedHosts: ['temu.com', 'www.temu.com'],
    note: 'Marketplace à comparer avec prudence selon vendeur, variantes et conditions affichées.',
  },
  {
    id: 'amazon-fr',
    name: 'Amazon',
    allowedHosts: ['amazon.fr', 'www.amazon.fr'],
    note: 'La fiche produit, le vendeur, le stock et la livraison peuvent varier selon l’offre affichée.',
  },
  {
    id: 'amazon-com',
    name: 'Amazon',
    allowedHosts: ['amazon.com', 'www.amazon.com'],
    note: 'La fiche produit, le vendeur, le stock et la livraison peuvent varier selon l’offre affichée.',
  },
]

export const TRUSTED_MERCHANT_HOSTS = new Set(MERCHANTS.flatMap((merchant) => merchant.allowedHosts))

export function getMerchantFromUrl(value?: string): MerchantRecord | undefined {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value)

    return MERCHANTS.find((merchant) => merchant.allowedHosts.includes(url.hostname))
  } catch {
    return undefined
  }
}
