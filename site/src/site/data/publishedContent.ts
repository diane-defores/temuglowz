import { getCollection } from 'astro:content'

export async function getPublishedArticles() {
  return (await getCollection('articles'))
    .filter((article) => article.data.status === 'published')
    .sort((a, b) => b.data.updatedDate.getTime() - a.data.updatedDate.getTime())
}
