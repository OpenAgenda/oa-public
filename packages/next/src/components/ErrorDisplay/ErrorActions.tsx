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
        <Button onClick={resetError} variant="outline">
          {intl.formatMessage(messages.retry)}
        </Button>
      ) : null}

      <Button asChild variant="outline">
        <Link unstyled href="/">
          {intl.formatMessage(messages.backToHome)}
        </Link>
      </Button>

      <Button asChild>
        <Link unstyled href="/support">
          {intl.formatMessage(messages.contactSupport)}
        </Link>
      </Button>
    </HStack>
  );
}
