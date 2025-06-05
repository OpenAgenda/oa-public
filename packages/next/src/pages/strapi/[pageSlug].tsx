import { GetServerSideProps } from 'next';
import ky from 'ky';
import { NextPageWithLayout } from 'pages/_app';
import StrapiPage from 'views/StrapiPage';
import Layout from 'components/Layout';
import buildPopulateStrapiQuery from 'utils/buildPopulateStrapiQuery';

interface PageData {
  documentId: string;
  title: string;
  slug: string;
}

interface StrapiResponse {
  data: PageData[];
}

interface PageProps {
  intlMessages?: Record<string, string>;
  page: any;
  footer: any;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  locale,
  query: queryWithParams,
}) => {
  const {
    NEXT_STRAPI_API_BASE: APIBase,
    NEXT_STRAPI_API_AUTH_TOKEN: authToken,
  } = process.env;

  const pageSlug = queryWithParams.pageSlug as string;

  const { data: matches } = await ky(
    `${APIBase}/pages?filters[slug][$eq]=${pageSlug}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  ).json<StrapiResponse>();

  if (!matches.length) {
    return {
      notFound: true,
    };
  }

  const populateList = await buildPopulateStrapiQuery('page');
  const populateParams = populateList.map((v) => `populate[]=${v}`).join('&');
  const pageRes = `${APIBase}/pages/${matches[0].documentId}?${populateParams}&locale=${locale}`;

  const footerPopulateList = await buildPopulateStrapiQuery('footer');
  const footerPopulateParams = footerPopulateList
    .map((v) => `populate[]=${v}`)
    .join('&');
  const footerRes = `${APIBase}/footer?${footerPopulateParams}&locale=${locale}`;

  const [intlMessages, { data: page }, { data: footer }] = await Promise.all([
    StrapiPage.fetchLocale(locale),
    ky(pageRes, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }).json<StrapiResponse>(),
    ky(footerRes, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .json<{ data: any }>()
      .catch(() => ({ data: null })),
  ]);

  return {
    props: {
      intlMessages,
      page,
      footer,
    },
  };
};

const Page: NextPageWithLayout<PageProps> = ({ page, footer }) => (
  <StrapiPage page={page} footer={footer} />
);

Page.Layout = Layout;

export default Page;
