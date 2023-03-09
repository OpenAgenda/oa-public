import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { SUPPORTED_LOCALES } from 'config/constants';

export default function Metas({ agenda, query, preload }) {
  const intl = useIntl();
  const router = useRouter();

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_SITE_ROOT);
  const pageTitle = `${agenda.title} | OpenAgenda`;

  return (
    <Head>
      <title>{pageTitle}</title>
      {agenda.indexed ? (
        <meta name="robots" content={`${query.passed || query.after ? 'noindex' : 'index'}, follow`} />
      ) : (
        <meta name="robots" content="noindex, nofollow" />
      )}

      <link rel="canonical" href={absUrl.origin + absUrl.pathname} />
      {Object.keys(agenda.summary.languages).map(key => (key === intl.locale ? null : (
        <link
          key={`alternate:${key}`}
          rel="alternate"
          hrefLang={key}
          href={SUPPORTED_LOCALES.includes(key)
            ? `${absUrl.origin}/${key}${absUrl.pathname}`
            : `${absUrl.origin}${absUrl.pathname}?lang=${key}`}
        />
      )))}
      <link rel="alternate" hrefLang="x-default" href={absUrl.origin + absUrl.pathname} />

      <meta property="og:site_name" content="OpenAgenda" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${agenda.title} | OpenAgenda`} />
      <meta property="og:description" content={agenda.description} />
      {/* <meta property="og:type" content="website" /> */}
      <meta property="og:locale" content={intl.locale} />
      {Object.keys(agenda.summary.languages).map(key => (key === intl.locale ? null : (
        <meta key={`ogLocale:${key}`} property="og:locale:alternate" content={key} />
      )))}
      <meta property="og:url" content={absUrl.origin + absUrl.pathname} />
      {agenda.image ? (
        <meta property="og:image" content={agenda.image} />
      ) : null}

      <meta property="twitter:card" content="summary" />
      <meta property="twitter:site" content={process.env.NEXT_PUBLIC_SITE_DOMAIN} />
      <meta property="twitter:title" content={`${agenda.title} | OpenAgenda`} />
      <meta property="twitter:description" content={agenda.description} />
      <meta property="twitter:domain" content="@oagenda" />
      <meta property="twitter:url" content={absUrl.origin + absUrl.pathname} />
      {agenda.image ? (
        <meta property="twitter:image" content={agenda.image} />
      ) : null}

      {preload?.map(href => (
        <link key={`preload-${href}`} rel="preload" href={href} as="fetch" crossOrigin="anonymous" />
      ))}
    </Head>
  );
}
