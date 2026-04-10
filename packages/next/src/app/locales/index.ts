// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

export default async function fetchLocale(locale) {
  return Promise.all([
    import(`components/ConsentBanner/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/ErrorDisplay/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/EventItems/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/LockIcon/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/Navbar/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/NavbarSearchInput/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/OfficialAgenda/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`components/strapi/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`views/AgendaError/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(
      `views/AgendaShow/components/AggregateModal/locales/compiled/${locale}.json`
    ).then((mod) => mod.default),
    import(
      `views/AgendaShow/components/ContextBar/locales/compiled/${locale}.json`
    ).then((mod) => mod.default),
    import(`views/AgendaShow/components/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`views/AgendaShow/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`views/AgendasSearch/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`views/EmbedAgendaShow/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`views/EventError/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`views/EventShow/components/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
    import(`views/EventShow/locales/compiled/${locale}.json`).then(
      (mod) => mod.default,
    ),
  ])
    .then((results) => Object.assign({}, ...results))
    .catch((e) => {
      console.error(`Failed to fetch locale ${locale}`, e);
      return null;
    });
}
