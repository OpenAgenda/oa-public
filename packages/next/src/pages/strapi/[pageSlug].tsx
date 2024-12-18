import { NextPage, GetServerSideProps } from 'next';
import ky from 'ky';
import StrapiPage from 'components/strapi/Page';

interface PageData {
  documentId: string;
  title: string;
  slug: string;
}

interface StrapiResponse {
  data: PageData[];
}

interface PageProps {
  page: any;
  assetsBasePath: string;
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query: queryWithParams,
}) => {
  const {
    NEXT_STRAPI_API_BASE: APIBase,
    NEXT_STRAPI_ASSETS_BASE: assetsBasePath,
  } = process.env;

  const pageSlug = queryWithParams.pageSlug as string;

  const { data: matches } = await ky(
    `${APIBase}/pages?filters[slug][$eq]=${pageSlug}`,
  ).json<StrapiResponse>();

  if (!matches.length) {
    return {
      notFound: true,
    };
  }

  const { data: page } = await ky(
    `${APIBase}/pages/${matches[0].documentId}?populate[0]=Segments&populate[1]=Segments.Features.image`,
  ).json<StrapiResponse>();

  return {
    props: {
      page,
      assetsBasePath,
    },
  };
};

const Page: NextPage<PageProps> = ({ page, assetsBasePath }) => (
  <StrapiPage page={page} assetsBasePath={assetsBasePath} />
);

export default Page;
