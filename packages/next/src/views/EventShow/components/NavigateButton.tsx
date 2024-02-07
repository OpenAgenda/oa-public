import { useRouter } from 'next/router';
import ky from 'ky';
import qs from 'qs';
import { preload } from 'swr';
import { useIntl } from 'react-intl';
import { IconButton } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faChevronLeft, faChevronRight } from 'icons/regular';
import useLocationQuery from 'hooks/useLocationQuery';
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

  const goToSiblingEvent = async () => {
    console.log('goToSiblingEvent');
    const response = await ky(`/${agenda.slug}/navigate?${qs.stringify({
      nav: direction === 'previous' ? 'prev' : 'next',
      nc: query.nc,
    })}`).json<any>();
    if (!response.event) return;
    const index = parseInt(query.nc.index, 10);

    // speed up context bar display
    preload(`/api/me/agendas/${agenda.uid}/events/${response.event.uid}`, input => ky(input).json());

    router.push(`/n/${agenda.slug}/events/${response.event.slug}?${qs.stringify({
      ...query,
      nc: {
        ...query.nc,
        index: direction === 'previous' ? index - 1 : index + 1,
        first: response.isFirst ? 'true' : undefined,
        last: response.isLast ? 'true' : undefined,
      },
    })}`);
  };

  const isVisible = (direction === 'previous' && !query.nc?.first)
    || (direction === 'next' && !query.nc?.last);

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
