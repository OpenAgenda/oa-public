// The collator used everywhere OpenAgenda sorts user-facing labels
// alphabetically — form option lists (`@openagenda/form-schemas`) and choice
// facets (`@openagenda/react-filters`). One shared construction site so the
// two can't drift apart and show the same option set in two different orders.
//
// `sensitivity: 'base'` folds case and accents together, and `numeric: true`
// keeps routinely numbered sets ("1er", "2e", "10e" — arrondissements, years,
// age brackets) in numeric order instead of "10e" landing between "1er" and
// "2e".

const OPTIONS = {
  sensitivity: 'base',
  numeric: true,
  usage: 'sort',
};

// Locales are a bounded set in practice, but the tag can come from a request
// in a long-lived server: rather than grow without bound, the cache is dropped
// wholesale past a threshold no legitimate caller reaches.
const MAX_CACHED = 100;

const collators = new Map();

const build = (locale) => {
  try {
    return new Intl.Collator(locale || undefined, OPTIONS);
  } catch {
    // An unknown or malformed tag would otherwise take the caller down.
    return null;
  }
};

const cache = (key, collator) => {
  if (collators.size >= MAX_CACHED) collators.clear();
  collators.set(key, collator);
  return collator;
};

export default function getSortCollator(locale, fallbackLocale = undefined) {
  // Keyed on the requested locale alone whenever it yields a collator, so the
  // two consumers share one instance per locale even though only one of them
  // passes a fallback. `fallbackLocale` only ever matters for a tag that does
  // not resolve, and then it belongs in the key: two callers can name
  // different fallbacks for the same bad tag.
  const key = String(locale ?? '');

  if (collators.has(key)) return collators.get(key);

  const collator = build(locale);
  if (collator) return cache(key, collator);

  const fallbackKey = `${key}|${String(fallbackLocale ?? '')}`;
  if (collators.has(fallbackKey)) return collators.get(fallbackKey);

  // The host default (`undefined`) can't throw, so the chain always
  // terminates.
  return cache(
    fallbackKey,
    build(fallbackLocale) ?? new Intl.Collator(undefined, OPTIONS),
  );
}
