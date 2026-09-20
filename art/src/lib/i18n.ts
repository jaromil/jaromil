/**
 * Multi-language system.
 *
 * Locales: en (default, unprefixed URLs) and it (prefixed /it/).
 * Each locale is a real static URL — shareable, indexable, no client-side
 * string swapping. Content without a translation falls back to the only
 * language available (e.g. Italian source prose shows on English pages).
 *
 * Selection: browser language wins on the entry point; a manual choice in
 * the header switch is stored (localStorage "lang") and overrides the
 * browser on later visits.
 */
export const locales = ['en', 'it'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

const en = {
  skipLink: 'Skip to content',
  closeIndex: 'Close index',
  siteNav: 'Site',
  practices: 'Practices',
  works: 'Works',
  texts: 'Texts',
  exhibitions: 'Exhibitions',
  bio: 'Bio',
  prevWork: 'Previous work',
  nextWork: 'Next work',
  stageLabel: 'Featured works and practices',
  stageHint: 'scroll · swipe · arrows',
  stageHome: 'Jaromil — artist',
  of: 'of',
  practice: 'Practice',
  work: 'Work',
  exhibition: 'Exhibition',
  text: 'Text',
  since: 'since',
  ongoing: 'ongoing',
  archived: 'archived',
  currentRealization: 'current realization',
  relatedWorks: 'Related works',
  worksShown: 'Works shown',
  curatedBy: 'curated by',
  showings: 'Showings',
  forthcoming: 'forthcoming',
  watchOn: 'Watch',
  on: 'on',
  bioP1:
    'Artist and hacker. His work moves between code and conceptual art: free software as an artistic medium, the aesthetics of computation, and the visibility of the systems that surround us.',
  bioP2: 'He has recently opened his art studio in Lugano, with new projects and works forthcoming.',
  bioTodo: 'Full biography — forthcoming',
  journalNote:
    "Long-form writing also lives inside the practice and work pages. Jaromil's journal of musings is at",
  noExhibitions: 'No exhibitions documented yet',
} as const;

export type UiKey = keyof typeof en;

const it: Record<UiKey, string> = {
  skipLink: 'Salta al contenuto',
  closeIndex: "Chiudi l'indice",
  siteNav: 'Sito',
  practices: 'Pratiche',
  works: 'Opere',
  texts: 'Testi',
  exhibitions: 'Mostre',
  bio: 'Bio',
  prevWork: 'Opera precedente',
  nextWork: 'Opera successiva',
  stageLabel: 'Opere e pratiche in evidenza',
  stageHint: 'scorri · swipe · frecce',
  stageHome: 'Jaromil — artista',
  of: 'di',
  practice: 'Pratica',
  work: 'Opera',
  exhibition: 'Mostra',
  text: 'Testo',
  since: 'dal',
  ongoing: 'in corso',
  archived: 'archiviata',
  currentRealization: 'realizzazione attuale',
  relatedWorks: 'Opere correlate',
  worksShown: 'Opere esposte',
  curatedBy: 'a cura di',
  showings: 'Presentazioni',
  forthcoming: 'in arrivo',
  watchOn: 'Guarda',
  on: 'su',
  bioP1:
    "Artista e hacker. Il suo lavoro si muove tra codice e arte concettuale: il software libero come medium artistico, l'estetica della computazione e la visibilità dei sistemi che ci circondano.",
  bioP2: "Ha recentemente aperto il suo studio d'arte a Lugano, con nuovi progetti e opere in arrivo.",
  bioTodo: 'Biografia completa — in arrivo',
  journalNote:
    'La scrittura di lungo corso vive anche dentro le pagine delle pratiche e delle opere. Il journal of musings di Jaromil è su',
  noExhibitions: 'Nessuna mostra documentata finora',
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, it };

/** Translate a UI string, falling back to the default locale. */
export function t(locale: string | undefined, key: UiKey): string {
  const found = (locales as readonly string[]).includes(locale ?? '')
    ? (locale as Locale)
    : defaultLocale;
  return ui[found][key];
}

/** The locale of a URL pathname (which includes the base). */
export function pageLocale(pathname: string): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const first = rest.split('/')[0];
  return (locales as readonly string[]).includes(first) && first !== defaultLocale
    ? (first as Locale)
    : defaultLocale;
}

/** Build a site-internal href honoring base, trailing slash, and locale. */
export function href(path = '', locale: string = defaultLocale): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const prefix = locale === defaultLocale ? '' : `${locale}/`;
  return path ? `${base}${prefix}${path.replace(/^\//, '')}/` : `${base}${prefix}`;
}

/** The same page in another locale, computed from the current pathname. */
export function altLocaleUrl(pathname: string, target: Locale): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  let rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  for (const l of locales) {
    if (l !== defaultLocale && rest.startsWith(`${l}/`)) {
      rest = rest.slice(l.length + 1);
      break;
    }
  }
  rest = rest.replace(/\/+$/, '');
  return href(rest, target);
}
