import ky from 'ky';
import { colors } from '@openagenda/uikit/theme/tokens/colors';
import type { Color } from '../components/strapi/types';
import buildPopulateStrapiQuery from './buildPopulateStrapiQuery';

// Names under the `strapi.*` color namespace (e.g. `strapi.frenchBlue`).
// We import the raw tokens object — a static JS object produced by
// `defineTokens` (a @__PURE__ proxy in Chakra). Unlike `system` from the
// UIKit barrel, this import path does NOT evaluate `createSystem` / the
// Chakra preset chain, so it is safe to use from Server Components where
// Turbopack otherwise hits `anatomy.extendWith is not a function`.
const STRAPI_COLOR_NAMES = new Set(Object.keys(colors.strapi ?? {}));

interface FetchStrapiPageDataParams {
  APIBase: string;
  authToken: string;
  documentId: string;
  locale: string;
}

interface FetchStrapiPageDataResult {
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

/**
 * Resolve a color name coming from Strapi content to a Chakra colorPalette
 * reference. Strapi stores short names (e.g. `frenchBlue`); if that name is
 * part of our `strapi.*` palette namespace we prefix it, otherwise we pass
 * it through untouched so Chakra resolves standard tokens (primary, oaBlue,
 * red, …) directly.
 */
export function color(
  c: string | Color,
  swatch?: number | string,
): string | undefined {
  if (!c) {
    return;
  }
  let colorName = typeof c === 'string' ? c : c.name;

  if (colorName === 'white') {
    colorName = 'oaWhite';
  }

  const resolved = STRAPI_COLOR_NAMES.has(colorName)
    ? `strapi.${colorName}`
    : colorName;

  return swatch ? `${resolved}.${swatch}` : resolved;
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
      .map((c) => (STRAPI_COLOR_NAMES.has(c) ? `{colors.${color(c, 500)}}` : c))
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
}: FetchStrapiPageDataParams): Promise<FetchStrapiPageDataResult> {
  const populateList = await buildPopulateStrapiQuery('page');
  const populateParams = populateList.map((v) => `populate[]=${v}`).join('&');
  const pageRes = `${APIBase}/pages/${documentId}?${populateParams}&locale=${locale}`;

  const footerPopulateList = await buildPopulateStrapiQuery('footer');
  const footerPopulateParams = footerPopulateList
    .map((v) => `populate[]=${v}`)
    .join('&');
  const footerRes = `${APIBase}/footer?${footerPopulateParams}&locale=${locale}`;

  const [{ data: page }, { data: footer }] = await Promise.all([
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
    page,
    footer,
  };
}

export const allowedItemColors = Array.from(STRAPI_COLOR_NAMES).map(
  (k) => `strapi.${k}`,
);
