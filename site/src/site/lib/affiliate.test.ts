import { describe, expect, it } from 'vitest'
import { toTrustedTemuUrl } from './affiliate'

describe('toTrustedTemuUrl', () => {
  it('accepts HTTPS URLs on the approved Temu hosts', () => {
    expect(toTrustedTemuUrl('https://temu.com/g-123')).toBe('https://temu.com/g-123')
    expect(toTrustedTemuUrl('https://www.temu.com/fr/c/kitchen-tools-668.html')).toBe(
      'https://www.temu.com/fr/c/kitchen-tools-668.html',
    )
  })

  it('rejects malformed, unsafe, and unapproved outbound URLs', () => {
    expect(toTrustedTemuUrl()).toBeUndefined()
    expect(toTrustedTemuUrl('javascript:alert(1)')).toBeUndefined()
    expect(toTrustedTemuUrl('http://temu.com/g-123')).toBeUndefined()
    expect(toTrustedTemuUrl('https://temu.example/g-123')).toBeUndefined()
    expect(toTrustedTemuUrl('https://example.com/?next=https://temu.com/g-123')).toBeUndefined()
  })
})
