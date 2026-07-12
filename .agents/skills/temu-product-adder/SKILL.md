---
name: temu-product-adder
description: Add Temu products to pillar pages, update the target page section, and keep sitemap and metadata in sync.
---

# Temu Product Adder

Ajoute automatiquement des produits Temu aux pages pilliers avec SEO et widgets.

## Mission

- Préparer un payload produit normalisé depuis un lien Temu ou un JSON
- Déterminer la page pilier cible depuis le contexte
- Signaler explicitement quand une authentification Temu est requise
- Injecter le produit dans la section appropriée seulement quand les champs sont assez fiables

## Input

```
{
  "page": "kitchen-gadgets",
  "section": "ustensiles",
  "rank": 1,
  "name": "Séparateur d'Œufs",
  "price": "4,99 €",
  "image": "https://img.kwcdn.com/...",
  "url": "https://temu.com/...",
  "description": "...",
  "pros": ["Facile", "Nettoyage rapide"],
  "cons": ["Plastique"]
}
```

Ou un lien Temu à préparer:

```bash
node tools/add-temu-product.ts prepare --url "https://www.temu.com/goods.html?goods_id=..."
```

Puis un payload enrichi à appliquer:

```bash
node tools/add-temu-product.ts apply --input-file /tmp/product.json --page gadgets-informatique --section connectique-usb
```

## Output

- En mode `prepare`: JSON normalisé avec `status`, `target`, `product`, `checklist`, `completeness`, `warnings`, `nextAction`
- En mode `apply`: section mise à jour dans `src/site/data/{page}.json` si le niveau de complétude demandé est atteint

## Checklist

- `required`
  - `name`
  - `productUrl`
  - `description`
  - `primaryImage`
- `recommended`
  - `galleryImages[]` avec au moins 3 images
  - `price`
  - `rating`
  - `reviewCount`
  - `pros[]`
- `bonus`
  - `videoUrl`
  - `reviewSnippets[]`
  - `imageWidth`
  - `imageHeight`

## Completeness Gates

- `minimum_publishable`
  - `name`, `productUrl`, `description`, `primaryImage`
- `strong_publishable`
  - `minimum_publishable` plus galerie, prix, note, nombre d'avis, `pros[]`
- `premium_enrichment`
  - `strong_publishable` plus vidéo, extraits d'avis et dimensions d'image

## Validation

- `prepare` ne doit pas inventer prix, note ou image
- Si Temu redirige vers login, le statut doit être `needs_authentication`
- `apply` exige par défaut `strong_publishable`, sauf override explicite
- Vérifie que la page et la section existent avant écriture
