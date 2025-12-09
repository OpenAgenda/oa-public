import Head from 'next/head';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { videoPoster } from 'utils/strapi';

const extractImage = ({ video, image }) => {
  if (image?.formats.large) {
    return image.formats.large;
  }

  if (video) {
    return { url: videoPoster };
  }
  return undefined;
};

export default function Metas({ title, description = null, segment }) {
  const intl = useIntl();
  const router = useRouter();

  const ogImage = extractImage(segment);

  const absUrl = new URL(router.asPath, process.env.NEXT_PUBLIC_ROOT);
  const canonicalUrl = `${absUrl.origin}/${intl.locale === 'io' ? 'en' : intl.locale}${absUrl.pathname}`;

  const pageTitle = `${title} | OpenAgenda`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="robots" content="index, follow" />
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:site_name" content="OpenAgenda" />
      {ogImage?.url && <meta property="og:image" content={ogImage.url} />}
      {ogImage?.width && (
        <meta property="og:image:width" content={ogImage.width} />
      )}
      {ogImage?.height && (
        <meta property="og:image:height" content={ogImage.height} />
      )}
    </Head>
  );
}
