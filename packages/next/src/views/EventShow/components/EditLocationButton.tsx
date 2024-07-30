import { useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { FetchStatus } from 'config/types';
import useMember from '../hooks/useMember';
import useEvent from '../hooks/useEvent';
import { useAgenda } from '../contexts/agenda';
import { editLocationButton as messages } from '../messages';

export default function EditLocationButton({ canEditEvent }: { canEditEvent: boolean }) {
  const intl = useIntl();
  const { status } = useMember();
  const { event } = useEvent();
  const agenda = useAgenda();

  if (status === FetchStatus.Fetching) return null;

  return (
    <Button
      as={Link}
      href={`/${agenda.slug}/admin/locations/${event.location.uid}/edit`}
      // leftIcon={<FaIcon icon={faEnvelope} />}
      variant="outline"
      // colorScheme="white"
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
      {intl.formatMessage(messages.editLocation)}
    </Button>
  );
}
