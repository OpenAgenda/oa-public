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

export const videoPoster =
  'https://cdn.openagenda.com/main/poster-pres-oa-video-4.svg';

export function color(c: string | Color, swatch?: any): string {
  if (!c) {
    return;
  }
  let colorName = typeof c === 'string' ? c : c.name;

  if (colorName === 'white') {
    colorName = 'oaWhite';
  }

  return `${system.tokens.colorPaletteMap.has(colorName) ? colorName : `strapi.${colorName}`}${swatch ? `.${swatch}` : ''}`;
}

function mapStrapiColorsFromCSSRule(css) {
  const start = css.indexOf('(');
  const end = css.indexOf(')');

  if (start === -1) {
    return css;
  }

  return [
    css.substr(0, start + 1),
    css
      .substr(start + 1, end - start - 1)
      .split(',')
      .map((c) => c.trim())
      .map((c) =>
        system.tokens.colorPaletteMap.has(`strapi.${c}`)
          ? `{colors.${color(c, 500)}}`
          : c,
      )
      .join(','),
    css.substr(end),
  ].join('');
}

export function getBackgroundImage(background) {
  if (!background) {
    return null;
  }

  const css = background.css
    ? mapStrapiColorsFromCSSRule(background.css)
    : null;

  if (css) {
    return css;
  }

  if (background.name) {
    return `linear-gradient({colors.${color(background.name, 500)}})`;
  }

  return null;
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
).filter((k) => k.match(/^strapi\./));
