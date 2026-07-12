<script setup lang="ts">
defineProps<{
  title: string
  description: string
  image?: string
  type?: string
  publishedTime?: string
  modifiedTime?: string
}>()
</script>

<template>
  <teleport to="head">
    <title>{{ title }}</title>
    <meta name="description" :content="description" />
    <meta property="og:title" :content="title" />
    <meta property="og:description" :content="description" />
    <meta property="og:type" :content="type || 'website'" />
    <meta property="og:image" :content="image || 'https://temuglowz.com/og-default.png'" />
    <meta property="og:url" content="https://temuglowz.com/" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" :content="title" />
    <meta name="twitter:description" :content="description" />
    <script type="application/ld+json">
      {{ JSON.stringify({
        "@context": "https://schema.org",
        "@type": ["WebPage", type || "WebPage"],
        "name": title,
        "description": description,
        "publisher": {
          "@type": "Organization",
          "name": "TemuGlowz",
          "url": "https://temuglowz.com"
        }
      }) }}
    </script>
  </teleport>
</template>