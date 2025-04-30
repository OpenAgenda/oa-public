import { useIntl } from 'react-intl';
import { Button, HStack, Link, Text } from '@openagenda/uikit';
import {
  ErrorContainer,
  ErrorDisplay,
  JsonError,
} from 'components/ErrorDisplay';
import type { ErrorActionsProps } from 'components/ErrorDisplay/ErrorActions';
import errorDisplayMessages from 'components/ErrorDisplay/messages';
import fetchErrorLocale from 'components/ErrorDisplay/locales';
import agendaErrorMessages from '../AgendaError/messages';
import fetchLocale from '../AgendaError/locales';

export type EmbedAgendaErrorProps = {
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
        <Link unstyled target="_blank" rel="noopener" href="/support">
          {intl.formatMessage(errorDisplayMessages.contactSupport)}
        </Link>
      </Button>
    </HStack>
  );
}

export default function EmdedAgendaError({
  statusCode,
  error,
}: EmbedAgendaErrorProps) {
  const intl = useIntl();

  if (statusCode === 401) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(agendaErrorMessages.restrictedAccess)}
        </Text>
        <Text>
          {intl.formatMessage(agendaErrorMessages.unauthorizedMsg, {
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
          {intl.formatMessage(agendaErrorMessages.restrictedAccess)}
        </Text>
        <Text>
          {intl.formatMessage(agendaErrorMessages.forbiddenMsg, { br: <br /> })}
        </Text>
      </ErrorContainer>
    );
  }

  if (statusCode === 404) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(agendaErrorMessages.agendaNotFound)}
        </Text>
        <Text textAlign="center">
          {intl.formatMessage(agendaErrorMessages.notFoundMsg, { br: <br /> })}
        </Text>
      </ErrorContainer>
    );
  }

  // 500
  return <ErrorDisplay error={error} actionsComponent={ErrorActions} />;
}

EmdedAgendaError.fetchLocale = (locale: string) =>
  Promise.all([fetchLocale(locale), fetchErrorLocale(locale)]).then((results) =>
    Object.assign({}, ...results),
  );
