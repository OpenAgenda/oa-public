import { useIntl } from 'react-intl';
import { useSWRConfig } from 'swr';
import { Text } from '@openagenda/uikit';
import { DialogBody } from '@openagenda/uikit/snippets';
import Signin from 'components/auth/Signin';
import Description from './Description';
import messages from './messages';

export default function UnloggedBody({ agenda }) {
  const intl = useIntl();
  const { mutate } = useSWRConfig();

  return (
    <DialogBody>
      <Description agenda={agenda} />
      <Text mb="4">{intl.formatMessage(messages.shouldConnect)}</Text>
      <Signin
        agenda={{ slug: agenda.slug, uid: agenda.uid }}
        onSuccess={() => mutate('/users/me')}
      />
    </DialogBody>
  );
}
