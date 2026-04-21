'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import { Text, Button, Link } from '@openagenda/uikit';
import {
  ErrorDisplay,
  ErrorContainer,
  JsonError,
} from '@/src/components/ErrorDisplay';
import base64 from '@/src/utils/base64';
import useLocalePath from '@/src/utils/useLocalePath';
import { agendaError as messages } from '../messages';

export type AgendaErrorProps = {
  statusCode: number;
  agendaSlug?: string;
  error?: Error | JsonError;
  resetError?: () => void;
};

export default function AgendaError({
  statusCode,
  agendaSlug,
  error,
  resetError,
}: AgendaErrorProps) {
  const intl = useIntl();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localePath = useLocalePath();
  const qs = searchParams.toString();
  const asPath = qs ? `${pathname}?${qs}` : pathname;

  if (statusCode === 401) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(messages.restrictedAccess)}
        </Text>
        <Text>
          {intl.formatMessage(messages.unauthorizedMsg, { br: <br /> })}
        </Text>
        <Button asChild mt="8">
          <Link unstyled href={`/signin?redirect=${base64.encode(asPath)}`}>
            {intl.formatMessage(messages.signIn)}
          </Link>
        </Button>

        <Text mt="2">
          {intl.formatMessage(messages.orSignUp, {
            link: (chunks: React.ReactNode) => (
              <Button asChild variant="link">
                <Link
                  unstyled
                  href={`/signup?redirect=${base64.encode(asPath)}`}
                >
                  {chunks}
                </Link>
              </Button>
            ),
          })}
        </Text>
      </ErrorContainer>
    );
  }

  if (statusCode === 403) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(messages.restrictedAccess)}
        </Text>
        <Text>{intl.formatMessage(messages.forbiddenMsg, { br: <br /> })}</Text>
        {agendaSlug ? (
          <Button asChild mt="8">
            <Link unstyled href={localePath(`/${agendaSlug}/contact`)}>
              {intl.formatMessage(messages.requestInvitation)}
            </Link>
          </Button>
        ) : null}
      </ErrorContainer>
    );
  }

  if (statusCode === 404) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(messages.agendaNotFound)}
        </Text>
        <Text textAlign="center">
          {intl.formatMessage(messages.notFoundMsg, { br: <br /> })}
        </Text>

        <Button asChild mt="8">
          <Link unstyled href={localePath('/agendas')}>
            {intl.formatMessage(messages.searchAgenda)}
          </Link>
        </Button>
      </ErrorContainer>
    );
  }

  return <ErrorDisplay error={error} resetError={resetError} />;
}
