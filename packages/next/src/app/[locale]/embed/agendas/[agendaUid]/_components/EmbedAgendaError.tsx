'use client';

import { useIntl } from 'react-intl';
import { Button, HStack, Link, Text } from '@openagenda/uikit';
import {
  ErrorContainer,
  ErrorDisplay,
  JsonError,
} from '@/src/components/ErrorDisplay';
import type { ErrorActionsProps } from '@/src/components/ErrorDisplay/ErrorActions';
import errorDisplayMessages from '@/src/components/ErrorDisplay/messages';
import { agendaError as agendaErrorMessages } from '@/src/app/[locale]/(app)/[agendaSlug]/messages';

export type EmbedAgendaErrorProps = {
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
  resetError,
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
  return (
    <ErrorDisplay
      error={error}
      resetError={resetError}
      actionsComponent={ErrorActions}
    />
  );
}
