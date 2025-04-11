import { Button, HStack, Link, Text } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import {
  ErrorContainer,
  ErrorDisplay,
  JsonError,
} from 'components/ErrorDisplay';
import type { ErrorActionsProps } from 'components/ErrorDisplay/ErrorActions';
import errorDisplayMessages from 'components/ErrorDisplay/messages';
import fetchErrorLocale from 'components/ErrorDisplay/locales';
import eventErrorMessages from '../EventError/messages';
import fetchLocale from '../EventError/locales';
import { useAgenda } from '../EventShow/contexts/agenda';

export type EmbedEventErrorProps = {
  statusCode: number;
  error?: JsonError;
};

function ErrorActions({ resetError }: ErrorActionsProps) {
  const intl = useIntl();

  return (
    <HStack mt="8">
      {resetError ? (
        <Button onClick={resetError} variant="outline">
          {intl.formatMessage(errorDisplayMessages.retry)}
        </Button>
      ) : null}

      <Button asChild>
        <Link
          unstyled
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
        >
          {intl.formatMessage(errorDisplayMessages.contactSupport)}
        </Link>
      </Button>
    </HStack>
  );
}

export default function EmbedEventError({
  statusCode,
  error,
}: EmbedEventErrorProps) {
  const intl = useIntl();

  const agenda = useAgenda();

  if (statusCode === 401) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(eventErrorMessages.restrictedAccess)}
        </Text>
        <Text>
          {intl.formatMessage(eventErrorMessages.unauthorizedMsg, {
            br: <br />,
          })}
        </Text>
      </ErrorContainer>
    );
  }

  if (statusCode === 403) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(eventErrorMessages.restrictedAccess)}
        </Text>
        <Text>
          {intl.formatMessage(eventErrorMessages.forbiddenMsg, { br: <br /> })}
        </Text>
      </ErrorContainer>
    );
  }

  if (statusCode === 404) {
    if (!agenda) {
      return (
        <ErrorContainer>
          <Text fontSize="2xl" fontWeight="bold" mb="4">
            {intl.formatMessage(eventErrorMessages.agendaNotFound)}
          </Text>
          <Text textAlign="center">
            {intl.formatMessage(eventErrorMessages.notFoundMsg, { br: <br /> })}
          </Text>
        </ErrorContainer>
      );
    }

    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(eventErrorMessages.eventNotFound)}
        </Text>
        <Text textAlign="center">
          {intl.formatMessage(eventErrorMessages.notFoundMsg, { br: <br /> })}
        </Text>
      </ErrorContainer>
    );
  }

  // 500
  return <ErrorDisplay error={error} actionsComponent={ErrorActions} />;
}

EmbedEventError.fetchLocale = (locale: string) =>
  Promise.all([fetchLocale(locale), fetchErrorLocale(locale)]).then((results) =>
    Object.assign({}, ...results),
  );
