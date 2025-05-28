import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

export default function Metas({ title }) {
  const intl = useIntl();
  const router = useRouter();

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  const canonicalUrl = `${absUrl.origin}/${intl.locale === 'io' ? 'en' : intl.locale}${absUrl.pathname}`;

  const pageTitle = `${title} | OpenAgenda`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="robots" content="index, follow" />

      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
}
