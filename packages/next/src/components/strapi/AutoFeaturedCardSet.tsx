import { useIntl } from 'react-intl';
import useSWR from 'swr';
import type { ButtonProps } from '@openagenda/uikit';
import { HStack } from '@openagenda/uikit';
import { FetchStatus } from 'config/types';
import { FeaturedCard, SkeletonFeaturedCard } from './FeaturedCard';
import SegmentContainer from './SegmentContainer';
import type { Color } from './types';

import messages from './messages';

interface Card {
  image: {
    url: string;
  } | null;
  title: string;
  description: string;
  slug?: string;
  CTAs?: Array<{
    label: string;
    link: string;
    color?: Color;
    variant?: ButtonProps['variant'];
  }>;
}

interface CardWrapper {
  Card: Card;
  displayFrom?: string | null;
  displayUntil?: string | null;
}

interface FeaturedAgendasProps {
  title?: string;
  description?: string;
  background?: React.ReactNode;
  fontColor?: Color;
  descriptionColor?: Color;
  Cards: CardWrapper[];
  count?: number;
  agendaSearch?: string;
}

function defineDisplayedCards(
  cards: CardWrapper[],
  count: number,
): CardWrapper[] {
  const now = new Date();

  return cards
    .filter((card) => {
      // If no displayFrom or displayUntil, include the card
      if (!card.displayFrom && !card.displayUntil) return true;

      // If only displayFrom exists, check if current time is after displayFrom
      if (card.displayFrom && !card.displayUntil) {
        return new Date(card.displayFrom) <= now;
      }

      // If only displayUntil exists, check if current time is before displayUntil
      if (!card.displayFrom && card.displayUntil) {
        return new Date(card.displayUntil) >= now;
      }

      // If both exist, check if current time is between displayFrom and displayUntil
      return (
        new Date(card.displayFrom) <= now && new Date(card.displayUntil) >= now
      );
    })
    .slice(0, count);
}

export default function AutoFeaturedCardSet({
  title: segmentTitle = null,
  description: segmentDescription,
  Cards,
  count = 3,
  agendaSearch,
  background,
  fontColor,
  descriptionColor,
}: FeaturedAgendasProps) {
  const intl = useIntl();
  const displayedCards = defineDisplayedCards(Cards, count);
  const loadingItemCount = agendaSearch?.length
    ? count - displayedCards.length
    : 0;

  const { data: { agendas } = { agendas: [] }, status } = useSWR(
    loadingItemCount > 0
      ? `/api/agendas?size=${loadingItemCount}&useDefaultImage=1&${agendaSearch.split('?').pop()}`
      : null,
  );

  return (
    <SegmentContainer
      title={segmentTitle}
      description={segmentDescription}
      background={background}
      fontColor={fontColor}
      descriptionColor={descriptionColor}
    >
      <HStack gap={12} align="stretch" justify="center" flexWrap="wrap">
        {displayedCards.map((card, index) => (
          <FeaturedCard key={index} card={card.Card} />
        ))}
        {status === FetchStatus.Fetched
          ? agendas.map(({ image, title, description, uid, slug }) => (
              <FeaturedCard
                key={uid}
                card={{
                  image: image ? { url: image } : null,
                  title,
                  description,
                  CTAs: [
                    {
                      link: `/${slug}/contribute`,
                      label: intl.formatMessage(messages.addEvent),
                    },
                  ],
                }}
              />
            ))
          : Array.from({ length: loadingItemCount }).map((_, index) => (
              <SkeletonFeaturedCard key={`skeleton-${index}`} />
            ))}
      </HStack>
    </SegmentContainer>
  );
}
