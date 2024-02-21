import { useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { FetchStatus } from 'config/types';
import { useAgenda } from '../contexts/agenda';
import useEvent from '../hooks/useEvent';
import useMember from '../hooks/useMember';
import { suggestLocationChangeButton as messages } from '../messages';

export default function SuggestLocationChangeButton() {
  const intl = useIntl();
  const agenda = useAgenda();
  const { event } = useEvent();
  const { me, status } = useMember();

  if (status === FetchStatus.Fetching) return null;

  const isAdminMod = me?.member && ['administrator', 'moderator'].includes(me?.member.role);

  if (isAdminMod) return null;

  return (
    <Button
      as={Link}
      href={`/${agenda.slug}/locations/${event.uid}.${event.location.uid}/suggest-change`}
      variant="outline"
      alignSelf="flex-start"
      borderColor="oaGray.300"
      color="blackAlpha.800"
      _hover={{
        bg: 'oaGray.100',
        color: 'blackAlpha.900',
        textDecoration: 'none',
      }}
    >
      {intl.formatMessage(messages.suggestLocaitonChange)}
    </Button>
  );
}
