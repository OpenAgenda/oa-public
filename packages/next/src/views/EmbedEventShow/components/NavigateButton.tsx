import { useIntl } from 'react-intl';
import useSessionStorageState from 'use-session-storage-state';
import { IconButton } from '@openagenda/uikit';
import useLocationQuery from 'hooks/useLocationQuery';
import { FaIcon } from 'icons';
import { faChevronLeft, faChevronRight } from 'icons/regular';
import { navigationButton as messages } from 'views/EventShow/messages';
import { useAgenda } from 'views/EventShow/contexts/agenda';
import {
  NavigateButtonProps,
  useGoToSiblingEvent,
} from 'views/EventShow/components/NavigateButton';
import useEvent from '../hooks/useEvent';

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
    urlPrefix: `/embed/agendas/${agenda.uid}`,
  });

  if (!eventNc) {
    return null;
  }

  const isVisible =
    (direction === 'previous' && !eventNc?.first) ||
    (direction === 'next' && !eventNc?.last);

  return (
    <IconButton
      variant="unstyled"
      aria-label={intl.formatMessage(
        direction === 'previous' ? messages.previousEvent : messages.nextEvent,
      )}
      icon={
        <FaIcon
          icon={direction === 'previous' ? faChevronLeft : faChevronRight}
          width="1em"
          size="xl"
        />
      }
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
    />
  );
}
