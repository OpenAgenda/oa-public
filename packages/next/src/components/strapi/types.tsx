export type Color = {
  name: string;
};

export interface StrapiPageData {
  title: string;
  description?: string;
  navFontColor?: Color;
  navSticky?: boolean;
  navStickyBackground?: Color;
  logoVariant?: 'white' | 'regular';
  Segments?: any[];
}
