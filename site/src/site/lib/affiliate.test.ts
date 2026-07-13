import { describe, expect, it } from 'vitest'
import { toTrustedMerchantUrl } from './affiliate'

describe('toTrustedMerchantUrl', () => {
  it('accepts HTTPS URLs on the approved merchant hosts', () => {
    expect(toTrustedMerchantUrl('https://temu.com/g-123')).toBe('https://temu.com/g-123')
    expect(toTrustedMerchantUrl('https://www.temu.com/fr/c/kitchen-tools-668.html')).toBe(
      'https://www.temu.com/fr/c/kitchen-tools-668.html',
    )
    expect(toTrustedMerchantUrl('https://www.amazon.fr/dp/B0TEST1234')).toBe(
      'https://www.amazon.fr/dp/B0TEST1234',
    )
  })

  it('rejects malformed, unsafe, and unapproved outbound URLs', () => {
    expect(toTrustedMerchantUrl()).toBeUndefined()
    expect(toTrustedMerchantUrl('javascript:alert(1)')).toBeUndefined()
    expect(toTrustedMerchantUrl('http://temu.com/g-123')).toBeUndefined()
    expect(toTrustedMerchantUrl('https://temu.example/g-123')).toBeUndefined()
    expect(toTrustedMerchantUrl('https://example.com/?next=https://temu.com/g-123')).toBeUndefined()
  })
})
