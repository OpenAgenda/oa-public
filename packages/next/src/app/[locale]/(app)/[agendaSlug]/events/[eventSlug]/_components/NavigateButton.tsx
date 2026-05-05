'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ky from 'ky';
import qs from 'qs';
import { preload } from 'swr';
import { useIntl } from 'react-intl';
import useSessionStorageState from 'use-session-storage-state';
import { IconButton } from '@openagenda/uikit';
import { FaIcon } from '@/src/icons';
import { faChevronLeft, faChevronRight } from '@/src/icons/regular';
import useLocationQuery from '@/src/hooks/useLocationQuery';
import useLocalePath from '@/src/hooks/useLocalePath';
import useEvent from '../_hooks/useEvent';
import { useAgenda } from '../_context/agenda';
import { navigationButton as messages } from '../messages';

export type NavigateButtonProps = {
  direction: 'previous' | 'next';
  prefilter?: Record<string, any>;
  filters?: any;
  referrer?: string;
  overlapping?: boolean;
};

function shouldIgnoreKeyboard(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  if (!el) return false;

  if (el.isContentEditable) return true;

  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;

  const role = el.getAttribute('role');
  if (role === 'textbox' || role === 'combobox') return true;

  return false;
}

export function useGoToSiblingEvent({
  direction,
  agenda,
  eventNc,
  query,
  urlPrefix = undefined,
  sort = null,
}) {
  const router = useRouter();
  const localePath = useLocalePath();
  const effectiveUrlPrefix = urlPrefix ?? localePath(`/${agenda.slug}`);

  return useCallback(async () => {
    let response: any;
    try {
      response = await ky(
        `/${agenda.slug}/navigate?${qs.stringify({
          nav: direction === 'previous' ? 'prev' : 'next',
          nc: {
            state: eventNc.fromAdmin ? [-1, 0, 1, 2] : undefined,
            sort: eventNc.fromAdmin ? 'updatedAt.desc' : sort || undefined,
            ...eventNc,
            fromAdmin: undefined,
            first: undefined,
            last: undefined,
          },
        })}`,
      ).json<any>();
    } catch {
      // Sibling lookup failed (network, 4xx/5xx). Don't navigate; the user
      // stays on the current event. Click handler must not throw.
      return;
    }
    if (!response.event) return;

    // speed up context bar display
    preload(
      `/api/me/agendas/${agenda.uid}/events/${response.event.uid}`,
      (input) => ky(input).json(),
    ).catch(() => null);

    const nextNc = {
      ...eventNc,
      from: direction === 'previous' ? eventNc.from - 1 : eventNc.from + 1,
      first: response.isFirst ? 'true' : undefined,
      last: response.isLast ? 'true' : undefined,
    };

    // NC travels via the URL only. The new page's `useNcEffect` writes it to
    // sessionStorage after mount. Writing here would replace the current
    // event's entry and make the still-mounted old tree flash during the
    // transition. Server render also needs it in the URL so the nav bar is
    // in the SSR HTML.
    router.push(
      `${effectiveUrlPrefix}/events/${response.event.slug}${qs.stringify(
        { ...query, nc: nextNc },
        { addQueryPrefix: true },
      )}`,
    );
  }, [
    agenda.slug,
    agenda.uid,
    direction,
    effectiveUrlPrefix,
    eventNc,
    query,
    router,
    sort,
  ]);
}

export function useNavigateKeyboardShortcut({
  direction,
  goToSiblingEvent,
  enabled,
}: {
  direction: 'previous' | 'next';
  goToSiblingEvent: () => Promise<void>;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboard(e)) return;

      if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();

        const isPrevious = e.key === 'ArrowLeft';
        if (
          (isPrevious && direction === 'previous') ||
          (!isPrevious && direction === 'next')
        ) {
          goToSiblingEvent().catch(() => null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, goToSiblingEvent, enabled]);
}

export default function NavigateButton({
  direction,
  overlapping = false,
}: NavigateButtonProps) {
  const intl = useIntl();
  const query = useLocationQuery() as any;
  const agenda = useAgenda();
  const { event } = useEvent();

  const [nc] = useSessionStorageState('EventShow:nc');
  const eventNc = nc?.[`${agenda.uid}.${event.uid}`] || query.nc;

  const goToSiblingEvent = useGoToSiblingEvent({
    direction,
    agenda,
    eventNc,
    query,
  });

  const isVisible =
    !!eventNc &&
    ((direction === 'previous' && !eventNc?.first) ||
      (direction === 'next' && !eventNc?.last));

  useNavigateKeyboardShortcut({
    direction,
    goToSiblingEvent,
    enabled: isVisible,
  });

  if (!eventNc) {
    return null;
  }

  return (
    <IconButton
      rounded="full"
      aria-label={intl.formatMessage(
        direction === 'previous' ? messages.previousEvent : messages.nextEvent,
      )}
      size="2xl"
      fontSize="2xl"
      border={overlapping ? '0px' : '2px solid'}
      color={overlapping ? 'bg' : 'fg'}
      borderColor="fg"
      bg={overlapping ? 'primary.500' : 'transparent'}
      _hover={{
        color: overlapping ? 'oaGray.100' : 'primary.500',
        borderColor: 'primary.500',
        bg: overlapping ? 'primary.600' : 'transparent',
      }}
      onClick={goToSiblingEvent}
      visibility={isVisible ? 'visible' : 'hidden'}
    >
      <FaIcon
        icon={direction === 'previous' ? faChevronLeft : faChevronRight}
      />
    </IconButton>
  );
}
