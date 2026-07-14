export interface UsageHubMerchant {
  merchantId: 'temu' | 'amazon-fr'
  href: string
  checkedAt: string
  note: string
}

export interface UsageHub {
  slug: string
  title: string
  homepageTitle: string
  description: string
  updatedDate: string
  category: string
  readingHint: string
  icon: 'gift' | 'outdoors' | 'toolbox'
  intro: string
  checks: string[]
  merchants: UsageHubMerchant[]
  relatedLinks: Array<{ label: string; href: string }>
}

export const usageHubs: UsageHub[] = [
  {
    slug: '/guides/gifts',
    title: 'Idées cadeaux utiles, drôles ou jolies à comparer',
    homepageTitle: 'Trouver un cadeau qui ne finira pas au fond d’un tiroir',
    description: 'Un hub pour chercher une idée cadeau par personne, occasion et usage, puis comparer les détails chez plusieurs enseignes.',
    updatedDate: '2026-07-14',
    category: 'Cadeaux',
    readingHint: 'Pour les petites attentions, les cadeaux d’hôte et les objets qui font sourire sans acheter au hasard.',
    icon: 'gift',
    intro: 'Un cadeau réussi n’a pas besoin d’être spectaculaire. Commencez par la personne, l’occasion et le niveau de fantaisie, puis vérifiez les dimensions, les délais et les conditions du marchand.',
    checks: ['À qui le cadeau est-il destiné ?', 'Est-ce un objet décoratif, pratique ou consommable ?', 'Le délai et les variantes conviennent-ils à l’occasion ?'],
    merchants: [
      { merchantId: 'temu', href: 'https://www.temu.com/fr/', checkedAt: '2026-07-14', note: 'Destination générale : filtrez par usage et contrôlez vendeur, variante, prix et délai sur la fiche choisie.' },
      { merchantId: 'amazon-fr', href: 'https://www.amazon.fr/s?k=id%C3%A9e+cadeau+gadget', checkedAt: '2026-07-14', note: 'Résultats de recherche : le vendeur, l’offre et la livraison peuvent changer selon le produit sélectionné.' },
    ],
    relatedLinks: [
      { label: 'Comparer des produits Amazon proches', href: '/blog/comparer-deux-produits-amazon-qui-se-ressemblent' },
      { label: 'Comparer des produits Temu proches', href: '/blog/comparer-deux-produits-temu-qui-se-ressemblent' },
    ],
  },
  {
    slug: '/guides/camping',
    title: 'Gadgets de camping et de plein air à comparer',
    homepageTitle: 'Préparer une sortie sans remplir le sac de gadgets inutiles',
    description: 'Un parcours de découverte pour comparer les petits accessoires utiles en camping, randonnée et escapades, sans promettre une disponibilité stable.',
    updatedDate: '2026-07-14',
    category: 'Camping',
    readingHint: 'Éclairage, rangement, confort et petits imprévus : choisissez ce qui répond vraiment à votre sortie.',
    icon: 'outdoors',
    intro: 'Pour le plein air, le poids, l’alimentation, la météo et la solidité comptent plus qu’une longue liste de fonctions. Utilisez les enseignes comme points de départ, puis vérifiez chaque caractéristique.',
    checks: ['Quel poids et quel encombrement pouvez-vous porter ?', 'Le gadget fonctionne-t-il sans prise ou réseau ?', 'Les matériaux et la résistance annoncée correspondent-ils à l’usage ?'],
    merchants: [
      { merchantId: 'temu', href: 'https://www.temu.com/fr/', checkedAt: '2026-07-14', note: 'Destination générale : l’expédition, le vendeur et les caractéristiques doivent être contrôlés sur chaque fiche.' },
      { merchantId: 'amazon-fr', href: 'https://www.amazon.fr/s?k=gadgets+camping', checkedAt: '2026-07-14', note: 'Résultats de recherche : comparez la fiche, le vendeur, le stock et la livraison de l’offre choisie.' },
    ],
    relatedLinks: [
      { label: 'Comprendre une expédition locale sur Temu', href: '/blog/entrepot-local-temu-ce-que-ca-change' },
      { label: 'Comparer deux fiches très proches', href: '/blog/comparer-deux-produits-aliexpress-qui-se-ressemblent' },
    ],
  },
  {
    slug: '/guides/tech-gadgets',
    title: 'Gadgets informatique et bureau à comparer',
    homepageTitle: 'Rendre le bureau plus pratique, sans empiler les accessoires',
    description: 'Un hub pour chercher des accessoires de bureau et d’informatique en partant de l’usage : câbles, rangement, confort et petits dépannages.',
    updatedDate: '2026-07-14',
    category: 'Bureau & tech',
    readingHint: 'Commencez par le problème à résoudre : compatibilité, branchements, rangement ou confort devant l’écran.',
    icon: 'toolbox',
    intro: 'En informatique, une fiche qui se ressemble n’est pas forcément compatible. Notez le connecteur, les dimensions, la puissance et le système utilisé avant de comparer les offres.',
    checks: ['Quel connecteur, format ou système devez-vous réellement utiliser ?', 'La puissance, la longueur et les accessoires inclus sont-ils explicités ?', 'L’offre est-elle vendue par la marque, un vendeur tiers ou une marketplace ?'],
    merchants: [
      { merchantId: 'temu', href: 'https://www.temu.com/fr/', checkedAt: '2026-07-14', note: 'Destination générale : ne déduisez jamais la compatibilité du seul titre ou d’une photo.' },
      { merchantId: 'amazon-fr', href: 'https://www.amazon.fr/s?k=gadgets+bureau+informatique', checkedAt: '2026-07-14', note: 'Résultats de recherche : vérifiez modèle, vendeur, compatibilité, stock et livraison sur l’offre exacte.' },
    ],
    relatedLinks: [
      { label: 'Comparer deux produits Amazon proches', href: '/blog/comparer-deux-produits-amazon-qui-se-ressemblent' },
      { label: 'Comprendre qui vend sur Amazon', href: '/blog/qui-vend-sur-amazon-marketplace-vendeur-marque' },
    ],
  },
]
