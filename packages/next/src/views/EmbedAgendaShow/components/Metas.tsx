import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { SUPPORTED_LOCALES } from 'config/constants';

export default function Metas({ agenda, preload }) {
  const intl = useIntl();
  const router = useRouter();

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  const canonicalUrl = `${absUrl.origin}/${intl.locale === 'io' ? intl.locale : 'en'}${absUrl.pathname}`;

  return (
    <Head>
      <title>{`${agenda.title} | OpenAgenda Embed`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={canonicalUrl} />
      {SUPPORTED_LOCALES.map(key =>
        (key === 'io' ? null : (
          <link
            key={`alternate:${key}`}
            rel="alternate"
            hrefLang={key}
            href={`${absUrl.origin}/${key}${absUrl.pathname}`}
          />
        )))}
      <link rel="alternate" hrefLang="x-default" href={`${absUrl.origin}/en${absUrl.pathname}`} />

      {preload?.map(href => (
        <link key={`preload-${href}`} rel="preload" href={href} as="fetch" crossOrigin="anonymous" />
      ))}
    </Head>
  );
}
