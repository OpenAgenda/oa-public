import { Suspense } from 'react';
import AutoFeaturedCardSet from '@/src/components/strapi/AutoFeaturedCardSet';
import Footer from '@/src/components/strapi/Footer';
import HighlightCardSet from '@/src/components/strapi/HighlightCardSet';
import PageHead from '@/src/components/strapi/PageHead';
import ReferenceSet from '@/src/components/strapi/ReferenceSet';
import SplitHeroSegment from '@/src/components/strapi/SplitHeroSegment';
import TabSet from '@/src/components/strapi/TabSet';
import type { StrapiPageData } from '@/src/components/strapi/types';
import SkeletonCardSet from './SkeletonCardSet';

const SEGMENT_MAP: Record<string, React.ComponentType<any>> = {
  'segments.highlight-card-set': HighlightCardSet,
  'segments.page-head': PageHead,
  'segments.tab-set': TabSet,
  'segments.reference-set': ReferenceSet,
  'components.split-hero': SplitHeroSegment,
};

interface StrapiPageProps {
  page: StrapiPageData;
  footer: any;
}

// Spacer consumed by SegmentContainer's `additionalTopPadding`. The CSS var
// is set by StrapiPageClient when the logged-user welcome banner is visible,
// so the first segment leaves room for it without leaking client state into
// the server tree.
const FIRST_SEGMENT_SPACER = 'var(--oa-welcome-spacer, 0px)';

export default function StrapiPage({ page, footer }: StrapiPageProps) {
  const segments: any[] = page.Segments ?? [];
  const firstSegmentId = segments[0]?.id;

  return (
    <>
      {segments.map((segment) => {
        const additionalTopPadding =
          segment.id === firstSegmentId ? FIRST_SEGMENT_SPACER : undefined;

        if (segment.__component === 'segments.auto-featured-card-set') {
          return (
            <Suspense
              key={segment.id}
              fallback={<SkeletonCardSet count={segment.count ?? 3} />}
            >
              <AutoFeaturedCardSet
                {...segment}
                additionalTopPadding={additionalTopPadding}
              />
            </Suspense>
          );
        }

        const Component = SEGMENT_MAP[segment.__component];
        if (!Component) return null;
        return (
          <Component
            key={segment.id}
            {...segment}
            additionalTopPadding={additionalTopPadding}
          />
        );
      })}
      {footer && <Footer {...footer} />}
    </>
  );
}
