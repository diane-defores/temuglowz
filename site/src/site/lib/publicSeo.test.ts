import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { usageHubs } from '../data/usageHubs'

const siteRoot = resolve(import.meta.dirname, '../../..')
const articleDirectory = resolve(siteRoot, 'src/content/articles')
const sitemapPath = resolve(siteRoot, 'public/sitemap.xml')
const llmsPath = resolve(siteRoot, 'public/llms.txt')

async function publishedArticleSlugs() {
  const files = await readdir(articleDirectory)
  const articles = await Promise.all(
    files.filter((file) => file.endsWith('.md')).map(async (file) => ({
      file,
      content: await readFile(resolve(articleDirectory, file), 'utf8'),
    })),
  )

  return articles
    .filter(({ content }) => /^status:\s*published\s*$/m.test(content))
    .map(({ file }) => file.replace(/\.md$/, ''))
    .sort()
}

describe('public machine-readable SEO assets', () => {
  it('lists every published article in both sitemap.xml and llms.txt', async () => {
    const [slugs, sitemap, llms] = await Promise.all([
      publishedArticleSlugs(),
      readFile(sitemapPath, 'utf8'),
      readFile(llmsPath, 'utf8'),
    ])

    for (const slug of slugs) {
      expect(sitemap).toContain(`https://temuglowz.com/blog/${slug}`)
      expect(llms).toContain(`/blog/${slug}`)
    }
  })

  it('does not index the explicitly noindexed informatique guide', async () => {
    const sitemap = await readFile(sitemapPath, 'utf8')

    expect(sitemap).not.toContain('https://temuglowz.com/guides/gadgets-informatique')
  })

  it('keeps every usage hub discoverable and multi-merchant', async () => {
    const [sitemap, llms] = await Promise.all([readFile(sitemapPath, 'utf8'), readFile(llmsPath, 'utf8')])

    for (const hub of usageHubs) {
      expect(hub.merchants.length).toBeGreaterThanOrEqual(2)
      expect(sitemap).toContain(`https://temuglowz.com${hub.slug}`)
      expect(llms).toContain(hub.slug)
    }
  })
})
