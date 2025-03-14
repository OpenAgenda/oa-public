import { NextPage, GetServerSideProps } from 'next';
import ky from 'ky';
import StrapiPage from 'components/strapi/Page';
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

  const populateList = await buildPopulateStrapiQuery('page');

  const populateParams = populateList.map((v) => `populate[]=${v}`).join('&');

  const pageRes = `${APIBase}/pages/${matches[0].documentId}?${populateParams}`;

  const { data: page } = await ky(pageRes, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }).json<StrapiResponse>();

  console.log(JSON.stringify(page, null, 2));

  return {
    props: {
      page,
    },
  };
};

const Page: NextPage<PageProps> = ({ page }) => <StrapiPage page={page} />;

export default Page;
