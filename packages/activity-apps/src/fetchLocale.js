// Lazy per-locale loader for the compiled messages, mirroring the
// `fetchLocale` helpers in @openagenda/react and @openagenda/react-filters.
// The dynamic import is RELATIVE to this package so bundlers build the
// import context against a real local directory — consumers (e.g. the next
// app's global IntlProvider) can merge ActivityApps.* labels without reaching
// in with a bare `@openagenda/activity-apps/locales-compiled/${locale}` path,
// which webpack can't resolve through the package `exports` field.
export default function fetchLocale(locale) {
  return import(`./locales-compiled/${locale}.json`, {
    with: { type: 'json' },
  }).then((mod) => mod.default);
}
