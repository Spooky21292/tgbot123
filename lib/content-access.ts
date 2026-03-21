export const FREE_BLOG_SLUGS = [
  'byudzhet-bez-peregruza-sistema-kotoraya-derzhitsya-dolshe-nedeli',
  'inflyaciya-bez-paniki-kak-reagirovat-na-rost-cen-v-obychnoj-zhizni',
  'nalogi-bez-straha-kak-podstupitsya-k-teme-esli-vy-tolko-nachinaete-zarabatyvat',
  'finansovaya-bezopasnost-v-internete-10-bytovyh-pravil-kotorye-realno-rabotayut',
  'semejnye-celi-kak-dogovoritsya-o-prioritetah-a-ne-sporit-o-kazhdoj-pokupke'
] as const;

export function isFreeBlogSlug(slug: string) {
  return FREE_BLOG_SLUGS.includes(slug as (typeof FREE_BLOG_SLUGS)[number]);
}
