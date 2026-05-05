import AppLayout from '@/src/components/Layout';
import Navbar from '@/src/components/Navbar';
import { color } from '@/src/utils/strapi';
import getLocale from '@/src/utils/getLocale';
import { resolveStrapiPage } from './_api';

type Params = Promise<{ pageSlug: string }>;

export default async function StrapiLayout({
  params,
  children,
}: {
  params: Params;
  children: React.ReactNode;
}) {
  const { pageSlug } = await params;
  const locale = await getLocale();
  const resolution = await resolveStrapiPage(locale, pageSlug);

  // On any non-ok resolution fall back to the default navbar — page.tsx will
  // handle notFound/redirect. Layout renders in parallel with the page so we
  // can't early-return a redirect from here without breaking streaming.
  const navProps =
    resolution.kind === 'ok'
      ? {
          discreet: !!resolution.page.navFontColor,
          sticky: !!resolution.page.navSticky,
          stickyBackground: resolution.page.navStickyBackground
            ? color(resolution.page.navStickyBackground, 500)
            : undefined,
          colorPalette: resolution.page.navFontColor
            ? color(resolution.page.navFontColor)
            : undefined,
          logoVariant: resolution.page.logoVariant,
        }
      : undefined;

  return <AppLayout navbar={<Navbar {...navProps} />}>{children}</AppLayout>;
}
