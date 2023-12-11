import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import useLocationQuery from 'hooks/useLocationQuery';
import { SUPPORTED_LOCALES } from 'config/constants';
import messages from '../messages';

function usePageTitle({ networkTitle, locationSetTitle }) {
  const { search } = useLocationQuery() as {
    search?: string
  };
  const intl = useIntl();

  if (search || networkTitle || locationSetTitle) {
    return `${search || networkTitle || locationSetTitle} - ${intl.formatMessage(messages.pageTitle)}`;
  }

  return intl.formatMessage(messages.pageTitle);
}

export default function Metas({ networkTitle = null, locationSetTitle = null, preload }) {
  const intl = useIntl();
  const query = useLocationQuery();
  const router = useRouter();

  const pageTitle = usePageTitle({ networkTitle, locationSetTitle });

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  const canonicalUrl = absUrl.origin + absUrl.pathname;

  return (
    <Head>
      <title>{`${pageTitle} | OpenAgenda`}</title>

      <meta name="robots" content={`${query.search || query.after ? 'noindex' : 'index'}, follow`} />

      <link rel="canonical" href={canonicalUrl} />
      {SUPPORTED_LOCALES.map(key => (key === intl.locale ? null : (
        <link
          key={`alternate:${key}`}
          rel="alternate"
          hrefLang={key}
          href={`${absUrl.origin}/${key}${absUrl.pathname}`}
        />
      )))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {preload?.map(href => (
        <link key={`preload-${href}`} rel="preload" href={href} as="fetch" crossOrigin="anonymous" />
      ))}
    </Head>
  );
}
