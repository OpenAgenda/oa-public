'use client';

import { Button, HStack, Link, Text } from '@openagenda/uikit';
import { useIntl } from 'react-intl';
import {
  ErrorContainer,
  ErrorDisplay,
  JsonError,
} from '@/src/components/ErrorDisplay';
import type { ErrorActionsProps } from '@/src/components/ErrorDisplay/ErrorActions';
import errorDisplayMessages from '@/src/components/ErrorDisplay/messages';
import { eventError as eventErrorMessages } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/messages';
import { useAgenda } from '@/src/app/[locale]/(app)/[agendaSlug]/events/[eventSlug]/_context/agenda';

export type EmbedEventErrorProps = {
  statusCode: number;
  error?: JsonError;
  resetError?: () => void;
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
  resetError,
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
  return (
    <ErrorDisplay
      error={error}
      resetError={resetError}
      actionsComponent={ErrorActions}
    />
  );
}
