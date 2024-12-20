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
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
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

  const { data: page } = await ky(
    `${APIBase}/pages/${matches[0].documentId}?populate[0]=Segments&populate[1]=Segments.Features.image`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  ).json<StrapiResponse>();

  return {
    props: {
      page,
    },
  };
};

const Page: NextPage<PageProps> = ({ page }) => <StrapiPage page={page} />;

export default Page;
