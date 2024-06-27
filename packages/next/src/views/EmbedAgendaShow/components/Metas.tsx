import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { SUPPORTED_LOCALES } from 'config/constants';

export default function Metas({ agenda, preload }) {
  const intl = useIntl();
  const router = useRouter();

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  const canonicalUrl = absUrl.origin + absUrl.pathname;
  const languages = agenda.summary.languages ? Object.keys(agenda.summary.languages) : [];

  return (
    <Head>
      <title>OpenAgenda Embed</title>
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

      {preload?.map(href => (
        <link key={`preload-${href}`} rel="preload" href={href} as="fetch" crossOrigin="anonymous" />
      ))}
    </Head>
  );
}
