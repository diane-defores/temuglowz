import { TRUSTED_MERCHANT_HOSTS } from './merchantRegistry'

/**
 * Keep public recommendation CTAs constrained to the retailer this guide
 * describes. Guide data is content, not a trusted URL source.
 */
export function toTrustedMerchantUrl(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !TRUSTED_MERCHANT_HOSTS.has(url.hostname)) {
      return undefined
    }

    return url.toString()
  } catch {
    return undefined
  }
}
