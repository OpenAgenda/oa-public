import { useIntl } from 'react-intl';
import { Button, HStack, Link } from '@openagenda/uikit';
import messages from './messages';

export type ErrorActionsProps = {
  resetError?: () => void;
};

export default function ErrorActions({ resetError }: ErrorActionsProps) {
  const intl = useIntl();

  return (
    <HStack mt="8">
      {resetError ? (
        <Button onClick={resetError} colorScheme="primary" variant="outline">
          {intl.formatMessage(messages.retry)}
        </Button>
      ) : null}

      <Button as={Link} href="/" colorScheme="primary" variant="outline">
        {intl.formatMessage(messages.backToHome)}
      </Button>

      <Button as={Link} href="/support" colorScheme="primary">
        {intl.formatMessage(messages.contactSupport)}
      </Button>
    </HStack>
  );
}
