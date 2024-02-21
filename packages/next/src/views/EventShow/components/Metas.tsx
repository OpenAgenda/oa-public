import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { SUPPORTED_LOCALES } from 'config/constants';
import { useAgenda } from '../contexts/agenda';
import useEvent from '../hooks/useEvent';

const IMAGE_PREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX;

export default function Metas({ preload, contentLocale }) {
  const intl = useIntl();
  const router = useRouter();

  const agenda = useAgenda();
  const { event } = useEvent();

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  const canonicalUrl = absUrl.origin + absUrl.pathname;
  const languages = Object.keys(event.description);

  const pageTitle = `${event.title[intl.locale]} | ${agenda.title} | OpenAgenda`;
  const description = event.description[contentLocale];

  const image = event.image ? `${IMAGE_PREFIX}${event.image.filename}` : null;

  return (
    <Head>
      <title>{pageTitle}</title>
      {agenda.indexed ? (
        <meta name="robots" content="index, follow" />
      ) : (
        <meta name="robots" content="noindex, nofollow" />
      )}

      <meta name="description" content={description} />

      <link rel="canonical" href={canonicalUrl} />
      {languages.map(key => (key === intl.locale ? null : (
        <link
          key={`alternate:${key}`}
          rel="alternate"
          hrefLang={key}
          href={SUPPORTED_LOCALES.includes(key)
            ? `${absUrl.origin}/${key}${absUrl.pathname}`
            : `${absUrl.origin}${absUrl.pathname}?lang=${key}`}
        />
      )))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      <meta property="og:site_name" content="OpenAgenda" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={contentLocale} />
      {languages.map(key => (key === contentLocale ? null : (
        <meta key={`ogLocale:${key}`} property="og:locale:alternate" content={key} />
      )))}
      <meta property="og:url" content={canonicalUrl} />
      {image ? (
        <meta property="og:image" content={image} />
      ) : null}

      <meta property="twitter:card" content="summary" />
      <meta property="twitter:site" content={process.env.NEXT_PUBLIC_DOMAIN} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:domain" content="@oagenda" />
      <meta property="twitter:url" content={canonicalUrl} />
      {image ? (
        <meta property="twitter:image" content={image} />
      ) : null}

      {preload?.map(href => (
        <link key={`preload-${href}`} rel="preload" href={href} as="fetch" crossOrigin="anonymous" />
      ))}
    </Head>
  );
}
