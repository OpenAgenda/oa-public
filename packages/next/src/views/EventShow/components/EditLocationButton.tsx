import { useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { FetchStatus } from 'config/types';
import useMember from '../hooks/useMember';
import useEvent from '../hooks/useEvent';
import { useAgenda } from '../contexts/agenda';
import { editLocationButton as messages } from '../messages';

export default function EditLocationButton() {
  const intl = useIntl();
  const { me, status } = useMember();
  const { event } = useEvent();
  const agenda = useAgenda();

  if (status === FetchStatus.Fetching) return null;

  const isAdminMod = me?.member && ['administrator', 'moderator'].includes(me?.member.role);

  if (!isAdminMod) return null;

  return (
    <Button
      as={Link}
      href={`/${agenda.slug}/admin/locations/${event.location.uid}/edit`}
      // leftIcon={<FaIcon icon={faEnvelope} />}
      variant="outline"
      // colorScheme="white"
      borderColor="oaGray.300"
      color="blackAlpha.800"
      _hover={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
      position="absolute"
      top="6"
      right="6"
    >
      {intl.formatMessage(messages.editLocation)}
    </Button>
  );
}
