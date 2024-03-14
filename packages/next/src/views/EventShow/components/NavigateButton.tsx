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

type NavigateButtonProps = {
  direction: 'previous' | 'next';
};

export default function NavigateButton({ direction }: NavigateButtonProps) {
  const intl = useIntl();
  const router = useRouter();
  const query = useLocationQuery() as any;
  const agenda = useAgenda();
  const { event } = useEvent();

  const [nc, setNc] = useSessionStorageState('EventShow:nc');

  const eventNc = nc?.[`${agenda.uid}.${event.uid}`] || query.nc;

  const goToSiblingEvent = async () => {
    const response = await ky(`/${agenda.slug}/navigate?${qs.stringify({
      nav: direction === 'previous' ? 'prev' : 'next',
      nc: eventNc,
    })}`).json<any>();
    if (!response.event) return;
    const index = parseInt(eventNc.index, 10);

    // speed up context bar display
    preload(`/api/me/agendas/${agenda.uid}/events/${response.event.uid}`, input => ky(input).json());

    router.push(`/n/${agenda.slug}/events/${response.event.slug}${qs.stringify(query, { addQueryPrefix: true })}`)
      .then(() => {
        setNc({
          [`${agenda.uid}.${response.event.uid}`]: {
            ...eventNc,
            index: direction === 'previous' ? index - 1 : index + 1,
            first: response.isFirst ? 'true' : undefined,
            last: response.isLast ? 'true' : undefined,
          },
        });
      });
  };

  if (!eventNc) {
    return null;
  }

  const isVisible = (direction === 'previous' && !eventNc?.first)
    || (direction === 'next' && !eventNc?.last);

  return (
    <IconButton
      isRound
      variant="unstyled"
      aria-label={intl.formatMessage(direction === 'previous' ? messages.previousEvent : messages.nextEvent)}
      icon={<FaIcon icon={direction === 'previous' ? faChevronLeft : faChevronRight} size="2xl" />}
      _hover={{
        color: 'primary.500',
      }}
      onClick={goToSiblingEvent}
      visibility={isVisible ? 'visible' : 'hidden'}
    />
  );
}
