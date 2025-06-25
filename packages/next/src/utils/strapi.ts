import ky from 'ky';
import buildPopulateStrapiQuery from './buildPopulateStrapiQuery';
interface FetchStrapiPageDataParams {
  APIBase: string;
  authToken: string;
  documentId: string;
  locale: string;
  fetchLocale: (locale: string) => Promise<Record<string, string>>;
}

interface FetchStrapiPageDataResult {
  intlMessages: Record<string, string>;
  page: any;
  footer: any;
}

export function color(c) {
  if (!c) {
    return;
  }
  return [undefined, null].includes(c.swatch)
    ? c.name
    : `${c.name}.${c.swatch.replace('s', '')}`;
}

interface PageData {
  documentId: string;
  locale: string;
  title: string;
  slug: string;
}

interface StrapiResponse {
  data: PageData[];
}

export async function fetchPageData({
  APIBase,
  authToken,
  documentId,
  locale,
  fetchLocale,
}: FetchStrapiPageDataParams): Promise<FetchStrapiPageDataResult> {
  const populateList = await buildPopulateStrapiQuery('page');
  const populateParams = populateList.map((v) => `populate[]=${v}`).join('&');
  const pageRes = `${APIBase}/pages/${documentId}?${populateParams}&locale=${locale}`;

  const footerPopulateList = await buildPopulateStrapiQuery('footer');
  const footerPopulateParams = footerPopulateList
    .map((v) => `populate[]=${v}`)
    .join('&');
  const footerRes = `${APIBase}/footer?${footerPopulateParams}&locale=${locale}`;

  const [intlMessages, { data: page }, { data: footer }] = await Promise.all([
    fetchLocale(locale),
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
    intlMessages,
    page,
    footer,
  };
}

export const allowedItemColors = [
  'strapi.flashy.rosyRed',
  'strapi.flashy.blueViolet',
  'strapi.flashy.paleLavender',
  'strapi.flashy.blueGreen',
  'strapi.flashy.sandBeige',
  'strapi.flashy.mutedPlum',
];
