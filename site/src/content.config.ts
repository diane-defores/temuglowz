import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(), description: z.string(), topic: z.string(), intent: z.string(),
    status: z.enum(['published', 'draft', 'stale']), publishDate: z.coerce.date(),
    updatedDate: z.coerce.date(), sourceCheckedAt: z.coerce.date(), reviewCadenceDays: z.number().int().positive(),
    evidenceLevel: z.enum(['official-policy', 'official-support']),
    sources: z.array(z.object({ label: z.string(), url: z.string().url() })).min(1),
    relatedGuideSlugs: z.array(z.string()),
  }),
})

export const collections = { articles }
