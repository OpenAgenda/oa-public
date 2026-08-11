// The collator used everywhere OpenAgenda sorts user-facing labels
// alphabetically — form option lists (`@openagenda/form-schemas`) and choice
// facets (`@openagenda/react-filters`). One shared construction site so the
// two can't drift apart and show the same option set in two different orders.
//
// `sensitivity: 'base'` folds case and accents together, and `numeric: true`
// keeps routinely numbered sets ("1er", "2e", "10e" — arrondissements, years,
// age brackets) in numeric order instead of "10e" landing between "1er" and
// "2e".

const collators = new Map();

export default function getSortCollator(locale, fallbackLocale = undefined) {
  const key = `${locale}|${fallbackLocale}`;

  if (!collators.has(key)) {
    const options = {
      sensitivity: 'base',
      numeric: true,
      usage: 'sort',
    };

    // An unknown or malformed tag would otherwise take the caller down. The
    // host default (`undefined`) can't throw, so the chain always terminates.
    let collator;
    try {
      collator = new Intl.Collator(locale || undefined, options);
    } catch {
      try {
        collator = new Intl.Collator(fallbackLocale || undefined, options);
      } catch {
        collator = new Intl.Collator(undefined, options);
      }
    }
    collators.set(key, collator);
  }

  return collators.get(key);
}
