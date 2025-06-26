import ky from 'ky';
import { system } from '@openagenda/uikit';
import type { Color } from '../components/strapi/types';
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

interface PageData {
  documentId: string;
  locale: string;
  title: string;
  slug: string;
}

interface StrapiResponse {
  data: PageData[];
}

export function color(c: string | Color, swatch?: any): string {
  if (!c) {
    return;
  }
  const colorName = typeof c === 'string' ? c : c.name;
  return `${system.tokens.colorPaletteMap.has(colorName) ? colorName : `strapi.${colorName}`}${swatch ? `.${swatch}` : ''}`;
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

export const allowedItemColors = Array.from(
  system.tokens.colorPaletteMap.keys(),
).filter((k) => k.match(/^strapi\.flashy\./));
