import ky from 'ky';
import { cookies, headers } from 'next/headers';
import type { ButtonProps } from '@openagenda/uikit';
import { HStack } from '@openagenda/uikit';
import getIntl from '@/src/utils/getIntl';
import { FeaturedCard } from './FeaturedCard';
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

interface AutoFeaturedCardSetProps {
  title?: string;
  description?: string;
  background?: React.ReactNode;
  fontColor?: Color;
  descriptionColor?: Color;
  Cards: CardWrapper[];
  count?: number;
  agendaSearch?: string;
  additionalTopPadding?: any;
}

interface AgendaSummary {
  image: string | null;
  title: string;
  description: string;
  uid: string;
  slug: string;
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
        new Date(card.displayFrom!) <= now &&
        new Date(card.displayUntil!) >= now
      );
    })
    .slice(0, count);
}

async function fetchLoadedAgendas(
  loadingItemCount: number,
  agendaSearch: string,
): Promise<AgendaSummary[]> {
  if (loadingItemCount <= 0 || !agendaSearch) return [];

  const trailingSearch = agendaSearch.split('?').pop() ?? '';
  const url = `${process.env.NEXT_API_INTERNAL_BASE_URL}/api/agendas?size=${loadingItemCount}&useDefaultImage=1&${trailingSearch}`;
  const cookieStore = await cookies();
  const headersList = await headers();

  try {
    const { agendas } = await ky(url, {
      headers: {
        Cookie: cookieStore.toString(),
        Authorization: headersList.get('authorization') || '',
      },
    }).json<{ agendas: AgendaSummary[] }>();
    return agendas ?? [];
  } catch {
    return [];
  }
}

export default async function AutoFeaturedCardSet({
  title: segmentTitle = null,
  description: segmentDescription,
  Cards,
  count = 3,
  agendaSearch = '',
  background,
  fontColor,
  descriptionColor,
  additionalTopPadding,
}: AutoFeaturedCardSetProps) {
  const intl = await getIntl();
  const displayedCards = defineDisplayedCards(Cards, count);
  const loadingItemCount = agendaSearch?.length
    ? count - displayedCards.length
    : 0;

  const agendas = await fetchLoadedAgendas(loadingItemCount, agendaSearch);

  return (
    <SegmentContainer
      title={segmentTitle}
      description={segmentDescription}
      background={background}
      fontColor={fontColor}
      descriptionColor={descriptionColor}
      additionalTopPadding={additionalTopPadding}
    >
      <HStack gap={12} align="stretch" justify="center" flexWrap="wrap">
        {displayedCards.map((card, index) => (
          <FeaturedCard key={index} card={card.Card} />
        ))}
        {agendas.map(({ image, title, description, uid, slug }) => (
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
        ))}
      </HStack>
    </SegmentContainer>
  );
}
