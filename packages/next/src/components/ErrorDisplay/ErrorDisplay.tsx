import { useIntl } from 'react-intl';
import { isHTTPError } from 'ky';
import { Button, chakra, Flex, Link, Text } from '@openagenda/uikit';
import ErrorContainer from './ErrorContainer';
import messages from './messages';
import ErrorActions from './ErrorActions';

export interface JsonError {
  name: string;
  message: string;
  shortMessage?: string;
  stack?: string;
  cause?: JsonError;
  info?: Record<string, any>;
}

interface ErrorProps {
  statusCode?: number;
  error?: Error | JsonError;
  errorTrackingId?: string;
  resetError?: () => void;
  actionsComponent?: typeof ErrorActions;
}

const httpErrorNames = new Set([
  'HTTPError',
  'BadRequest',
  'NotAuthenticated',
  'PaymentError',
  'Forbidden',
  'NotFound',
  'MethodNotAllowed',
  'NotAcceptable',
  'Timeout',
  'Conflict',
  'Gone',
  'LengthRequired',
  'Unprocessable',
  'TooManyRequests',
  'GeneralError',
  'NotImplemented',
  'BadGateway',
  'Unavailable',
]);

// enhanced VError.fullStack working with JsonError
function getFullStack(error) {
  const { cause } = error;

  if (cause) {
    return `${error.stack}\ncaused by: ${getFullStack(cause)}`;
  }

  return error.stack;
}

export function ErrorDisplay({
  statusCode,
  error,
  errorTrackingId,
  resetError,
  actionsComponent: ActionsComponent = ErrorActions,
}: ErrorProps) {
  const intl = useIntl();

  const errorStack = error ? getFullStack(error) : null;

  const message = error?.message;
  const isChunkLoadError =
    typeof message === 'string' &&
    message.toLowerCase().startsWith('failed to load chunk');
  const isNetworkError =
    error?.name === 'NetworkError' ||
    httpErrorNames.has(error?.name) ||
    isHTTPError(error);

  if (isChunkLoadError || isNetworkError) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold">
          {intl.formatMessage(messages.networkError)}
        </Text>
        <Text textAlign="center" mt="4">
          {intl.formatMessage(messages.networkErrorMsg)}
        </Text>

        <ActionsComponent resetError={resetError} />
      </ErrorContainer>
    );
  }

  if (statusCode === 404) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold">
          {intl.formatMessage(messages.pageNotFound)}
        </Text>
        <Text textAlign="center" mt="4">
          {intl.formatMessage(messages.pageNotFoundMsg)}
        </Text>

        <Button asChild variant="outline" mt="8">
          <Link unstyled href="/">
            {intl.formatMessage(messages.backToHome)}
          </Link>
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <ErrorContainer>
      <Text fontSize="2xl" fontWeight="bold">
        {intl.formatMessage(messages.internalError)}
      </Text>
      <Text textAlign="center" mt="4">
        {intl.formatMessage(messages.internalErrorMsg)}
      </Text>

      <ActionsComponent resetError={resetError} />

      {errorTrackingId && (
        <Flex flexDirection="column" textAlign="center" mt="8">
          <Text>{intl.formatMessage(messages.errorTrackingId)}</Text>
          <Flex alignItems="center">
            <Text>{errorTrackingId}</Text>
            {/* <IconButton variant="text" onClick={() => copyText(errorTrackingId)}>
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
