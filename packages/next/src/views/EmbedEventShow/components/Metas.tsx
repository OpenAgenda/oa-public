import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { SUPPORTED_LOCALES } from 'config/constants';
import { useAgenda } from '../../EventShow/contexts/agenda';
import useEvent from '../hooks/useEvent';

export default function Metas({ preload, contentLocale }) {
  const intl = useIntl();
  const router = useRouter();

  const agenda = useAgenda();
  const { event } = useEvent();

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  const canonicalUrl = `${absUrl.origin}/${intl.locale === 'io' ? 'en' : intl.locale}${absUrl.pathname}`;

  return (
    <Head>
      <title>{`${event.title[contentLocale]} | ${agenda.title} | OpenAgenda Embed`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <link rel="canonical" href={canonicalUrl} />
      {SUPPORTED_LOCALES.map((key) =>
        key === 'io' ? null : (
          <link
            key={`alternate:${key}`}
            rel="alternate"
            hrefLang={key}
            href={`${absUrl.origin}/${key}${absUrl.pathname}`}
          />
        ),
      )}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${absUrl.origin}/en${absUrl.pathname}`}
      />

      {preload?.map((href) => (
        <link
          key={`preload-${href}`}
          rel="preload"
          href={href}
          as="fetch"
          crossOrigin="anonymous"
        />
      ))}
    </Head>
  );
}
