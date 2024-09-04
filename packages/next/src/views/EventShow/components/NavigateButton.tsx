import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import ky from 'ky';
import qs from 'qs';
import { preload } from 'swr';
import { useIntl } from 'react-intl';
import useSessionStorageState from 'use-session-storage-state';
import { IconButton } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faChevronLeft, faChevronRight } from 'icons/regular';
import useLocationQuery from 'hooks/useLocationQuery';
import useEvent from '../hooks/useEvent';
import { useAgenda } from '../contexts/agenda';
import { navigationButton as messages } from '../messages';

export type NavigateButtonProps = {
  direction: 'previous' | 'next';
};

export function useGoToSiblingEvent({
  direction,
  agenda,
  eventNc,
  setNc,
  query,
  urlPrefix = `/${agenda.slug}`,
}) {
  const router = useRouter();

  return useCallback(async () => {
    const response = await ky(
      `/${agenda.slug}/navigate?${qs.stringify({
        nav: direction === 'previous' ? 'prev' : 'next',
        nc: {
          state: eventNc.fromAdmin ? [-1, 0, 1, 2] : undefined,
          sort: eventNc.fromAdmin ? 'updatedAt.desc' : undefined,
          ...eventNc,
          fromAdmin: undefined,
          first: undefined,
          last: undefined,
        },
      })}`,
    ).json<any>();
    if (!response.event) return;

    // speed up context bar display
    preload(
      `/api/me/agendas/${agenda.uid}/events/${response.event.uid}`,
      input => ky(input).json(),
    ).catch(() => null);

    router
      .push(
        `${urlPrefix}/events/${response.event.slug}${qs.stringify(query, { addQueryPrefix: true })}`,
      )
      .then(() => {
        setNc({
          [`${agenda.uid}.${response.event.uid}`]: {
            ...eventNc,
            from:
              direction === 'previous' ? eventNc.from - 1 : eventNc.from + 1,
            first: response.isFirst ? 'true' : undefined,
            last: response.isLast ? 'true' : undefined,
          },
        });
      });
  }, [agenda.slug, agenda.uid, direction, eventNc, query, router, setNc]);
}

export function useNavigateKeyboardShortcut({ direction, goToSiblingEvent }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();

        const isPrevious = e.key === 'ArrowLeft';
        if (
          (isPrevious && direction === 'previous')
          || (!isPrevious && direction === 'next')
        ) {
          goToSiblingEvent().catch(() => null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, goToSiblingEvent]);
}

export default function NavigateButton({ direction }: NavigateButtonProps) {
  const intl = useIntl();
  const query = useLocationQuery() as any;
  const agenda = useAgenda();
  const { event } = useEvent();

  const [nc, setNc] = useSessionStorageState('EventShow:nc');
  const eventNc = nc?.[`${agenda.uid}.${event.uid}`] || query.nc;

  const goToSiblingEvent = useGoToSiblingEvent({
    direction,
    agenda,
    eventNc,
    setNc,
    query,
  });

  useNavigateKeyboardShortcut({ direction, goToSiblingEvent });

  if (!eventNc) {
    return null;
  }

  const isVisible = (direction === 'previous' && !eventNc?.first)
    || (direction === 'next' && !eventNc?.last);

  return (
    <IconButton
      isRound
      variant="unstyled"
      aria-label={intl.formatMessage(
        direction === 'previous' ? messages.previousEvent : messages.nextEvent,
      )}
      icon={(
        <FaIcon
          icon={direction === 'previous' ? faChevronLeft : faChevronRight}
          width="1em"
          size="2xl"
        />
      )}
      h="auto"
      _hover={{
        color: 'primary.500',
        borderColor: 'primary.500',
      }}
      border="2px"
      borderColor="blackAlpha.900"
      p="4"
      onClick={goToSiblingEvent}
      visibility={isVisible ? 'visible' : 'hidden'}
    />
  );
}
