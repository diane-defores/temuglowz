# 999-temu-product-adder

Ajoute automatiquement des produits Temu aux pages pilliers avec SEO et widgets.

## Mission

- Parser une référence produit Temu depuis un lien ou un JSON
- Déterminer la page pilier cible depuis le contexte
- Injecter le produit dans la section appropriée
- Mettre à jour sitemap.xml et llms.txt

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

## Output

- Section mise à jour dans src/site/pages/{page}.vue
- Sitemap.xml mis à jour automatiquement
- Meta description enrichie

## Validation

- Vérifie que tous les champs obligatoires sont présents
- Vérifie que l'URL image est valide
- Vérifie que la page existe
- Build check après modification
