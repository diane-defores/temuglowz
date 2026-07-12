const TRUSTED_TEMU_HOSTS = new Set(['temu.com', 'www.temu.com'])

/**
 * Keep public recommendation CTAs constrained to the retailer this guide
 * describes. Guide data is content, not a trusted URL source.
 */
export function toTrustedTemuUrl(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !TRUSTED_TEMU_HOSTS.has(url.hostname)) {
      return undefined
    }

    return url.toString()
  } catch {
    return undefined
  }
}
