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

  const pageRes = `${APIBase}/pages/${matches[0].documentId}?${[
    'CTA',
    'backgroundColor.name',
    'fontColor.name',
    'Illustration.image',
    'Illustration.width.name',
    'Components',
    'Components.maxWidth',
    'Components.Illustration.image',
    'Components.backgroundColor.name',
    'Components.fontColor.name',
    'Components.fontSize.name',
    'Components.Illustration.width.name',
    'Components.Icon.size',
  ]
    .map((v) => `populate[]=Segments.${v}`)
    .join('&')}`;

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
