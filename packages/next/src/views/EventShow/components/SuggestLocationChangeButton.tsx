import { useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { FetchStatus } from 'config/types';
import { useAgenda } from '../contexts/agenda';
import useEvent from '../hooks/useEvent';
import useMember from '../hooks/useMember';
import { suggestLocationChangeButton as messages } from '../messages';

export default function SuggestLocationChangeButton({
  canEditEvent,
}: {
  canEditEvent: boolean;
}) {
  const intl = useIntl();
  const agenda = useAgenda();
  const { event } = useEvent();
  const { status } = useMember();

  if (status === FetchStatus.Fetching) return null;

  return (
    <Button
      as={Link}
      href={`/${agenda.slug}/locations/${event.location.agendaUid}.${event.location.uid}/suggest-change`}
      variant="outline"
      borderColor={!canEditEvent ? 'oaGray.300' : 'transparent'}
      color="blackAlpha.800"
      _hover={{
        bg: !canEditEvent ? 'gray.100' : 'transparent',
        color: !canEditEvent ? 'blackAlpha.900' : undefined,
        textDecoration: 'none',
      }}
      position={!canEditEvent ? 'absolute' : undefined}
      top={!canEditEvent ? '6' : undefined}
      right={!canEditEvent ? '6' : undefined}
    >
      {intl.formatMessage(messages.suggestLocaitonChange)}
    </Button>
  );
}
