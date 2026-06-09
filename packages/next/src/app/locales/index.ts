// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

export default async function fetchLocale(locale) {
  return Promise.all([
    import(`../[locale]/(app)/[agendaSlug]/_components/AggregateModal/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/[agendaSlug]/_components/ContextBar/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/[agendaSlug]/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/[agendaSlug]/events/[eventSlug]/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/[agendaSlug]/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/agendas/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/auth/magic-link/confirm/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/auth/manual/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/auth/reset/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/auth/signin/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/auth/signup/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/(app)/settings/_components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../[locale]/embed/agendas/[agendaUid]/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/ConsentBanner/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/ErrorDisplay/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/EventItems/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/LockIcon/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/Navbar/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/NavbarSearchInput/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/OfficialAgenda/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/auth/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/locales/compiled/${locale}.json`).then((mod) => mod.default),
    import(`../../components/strapi/locales/compiled/${locale}.json`).then((mod) => mod.default),
  ])
    .then((results) => Object.assign({}, ...results))
    .catch((e) => {
      console.error(`Failed to fetch locale ${locale}`, e);
      return {};
    });
}
