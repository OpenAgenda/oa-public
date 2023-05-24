import { defineMessages, useIntl } from 'react-intl';
import { Button, chakra, Flex, Link, Text, HStack } from '@openagenda/uikit';
import ErrorContainer from './ErrorContainer';

export interface JsonError {
  name: string
  message: string
  shortMessage?: string
  stack?: string
  cause?: JsonError
  info?: Record<string, any>
}

interface ErrorProps {
  error?: Error | JsonError
  eventId?: string
  resetError?: () => void
}

const messages = defineMessages({
  internalError: {
    id: 'next.components.ErrorDisplay.internalError',
    defaultMessage: 'Internal error',
  },
  internalErrorMsg: {
    id: 'next.components.ErrorDisplay.internalErrorMsg',
    defaultMessage: 'If the problem persists, please contact support.',
  },
  contactSupport: {
    id: 'next.components.ErrorDisplay.contactSupport',
    defaultMessage: 'Contact support',
  },
  errorTrackingId: {
    id: 'next.components.ErrorDisplay.errorTrackingId',
    defaultMessage: 'Error tracking id',
  },
  retry: {
    id: 'next.components.ErrorDisplay.retry',
    defaultMessage: 'Retry',
  },
  backToHome: {
    id: 'next.components.ErrorDisplay.backToHome',
    defaultMessage: 'Back to home',
  },
});

// enhanced VError.fullStack working with JsonError
function getFullStack(error) {
  const { cause } = error;

  if (cause) {
    return `${error.stack}\ncaused by: ${getFullStack(cause)}`;
  }

  return error.stack;
}

export function ErrorDisplay({ error, eventId, resetError }: ErrorProps) {
  const intl = useIntl();

  const errorStack = error ? getFullStack(error) : null;

  return (
    <ErrorContainer>
      <Text fontSize="2xl" fontWeight="bold">
        {intl.formatMessage(messages.internalError)}
      </Text>
      <Text textAlign="center" mt="4">
        {intl.formatMessage(messages.internalErrorMsg)}
      </Text>

      <HStack mt="8">
        <Button onClick={resetError} colorScheme="primary" variant="outline">
          {intl.formatMessage(messages.retry)}
        </Button>

        <Button as={Link} href="/" colorScheme="primary" variant="outline">
          {intl.formatMessage(messages.backToHome)}
        </Button>

        <Button as={Link} href="/support" colorScheme="primary">
          {intl.formatMessage(messages.contactSupport)}
        </Button>
      </HStack>

      {eventId && (
        <Flex flexDirection="column" textAlign="center" mt="8">
          <Text>{intl.formatMessage(messages.errorTrackingId)}</Text>
          <Flex alignItems="center">
            <Text>{eventId}</Text>
            {/* <IconButton variant="text" onClick={() => copyText(eventId)}>
                  <CopyIcon color="primary" width="24px" />
                </IconButton> */}
          </Flex>
        </Flex>
      )}

      {errorStack ? (
        <chakra.pre
          textAlign="left"
          w="full"
          maxW="6xl"
          bg="oaGray.10"
          p="4"
          mt="4"
          overflow="auto"
          borderRadius="base"
        >
          {errorStack}
        </chakra.pre>
      ) : null}
    </ErrorContainer>
  );
}
