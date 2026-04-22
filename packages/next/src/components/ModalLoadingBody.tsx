import { defineMessages, useIntl } from 'react-intl';
import { Center, Spinner } from '@openagenda/uikit';
import { DialogBody } from '@openagenda/uikit/snippets';

const messages = defineMessages({
  loading: {
    id: 'next.components.ModalLoadingBody.loading',
    defaultMessage: 'Loading',
  },
});

export default function ModalLoadingBody() {
  const intl = useIntl();

  return (
    <DialogBody>
      <Center
        h="100px"
        role="status"
        aria-label={intl.formatMessage(messages.loading)}
      >
        <Spinner size="xl" />
      </Center>
    </DialogBody>
  );
}
