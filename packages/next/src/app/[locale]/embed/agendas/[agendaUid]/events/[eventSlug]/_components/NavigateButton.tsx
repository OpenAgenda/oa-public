'use client';

import { useIntl } from 'react-intl';
import useSessionStorageState from 'use-session-storage-state';
import { IconButton } from '@openagenda/uikit';
import useLocationQuery from '@/src/hooks/useLocationQuery';
import { FaIcon } from '@/src/icons';
import { faChevronLeft, faChevronRight } from '@/src/icons/regular';
import { navigationButton as messages } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/messages';
import { useAgenda } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';
import {
  NavigateButtonProps,
  useGoToSiblingEvent,
} from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_components/NavigateButton';
import applyPrefilterToEventsQuery from '@/src/utils/applyPrefilterToEventsQuery';
import { useEmbedLayoutData } from '@/src/app/[locale]/embed/_components/EmbedLayoutShell';
import { omitParams } from '@/src/utils/embedParams';
import isUpcomingOnlyQuery from '@/src/utils/isUpcomingOnlyQuery';
import useEvent from '../_hooks/useEvent';

export default function NavigateButton({
  direction,
  prefilter,
  filters,
  referrer,
}: NavigateButtonProps) {
  const intl = useIntl();
  const query = useLocationQuery() as any;
  const agenda = useAgenda();
  const { event } = useEvent({ referrer });

  const { sort } = useEmbedLayoutData();

  const [nc] = useSessionStorageState('EventShow:nc');
  const eventNc = nc?.[`${agenda.uid}.${event.uid}`] || query.nc;

  const goToSiblingEvent = useGoToSiblingEvent({
    direction,
    agenda,
    eventNc: omitParams({
      ...isUpcomingOnlyQuery(eventNc || {})
        ? {
            relative: ['current', 'upcoming'],
          }
        : null,
      ...applyPrefilterToEventsQuery({
        query: eventNc || {},
        prefilter,
        filters,
      }),
    }),
    query: {
      ...query,
      host: referrer,
    },
    urlPrefix: `/embed/agendas/${agenda.uid}`,
    sort: sort || 'lastTimingWithFeatured.asc',
  });

  if (!eventNc) {
    return null;
  }

  const isVisible =
    (direction === 'previous' && !eventNc?.first) ||
    (direction === 'next' && !eventNc?.last);

  return (
    <IconButton
      variant="plain"
      size="2xl"
      w="1em"
      minW="fit-content"
      aria-label={intl.formatMessage(
        direction === 'previous' ? messages.previousEvent : messages.nextEvent,
      )}
      h="auto"
      color="primary.500"
      _hover={{
        color: 'primary.700',
        // borderColor: 'primary.500',
      }}
      // border="2px"
      // borderColor="blackAlpha.900"
      p="2"
      onClick={goToSiblingEvent}
      visibility={isVisible ? 'visible' : 'hidden'}
    >
      <FaIcon
        icon={direction === 'previous' ? faChevronLeft : faChevronRight}
        width="1em"
      />
    </IconButton>
  );
}
