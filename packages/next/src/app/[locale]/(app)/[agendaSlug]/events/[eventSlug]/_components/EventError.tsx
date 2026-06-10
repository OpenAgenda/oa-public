'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import { Text, Button, Link, Container, Box } from '@openagenda/uikit';
import {
  ErrorDisplay,
  ErrorContainer,
  JsonError,
} from '@/src/components/ErrorDisplay';
import base64 from '@/src/utils/base64';
import useLocalePath from '@/src/hooks/useLocalePath';
import type { Agenda } from '@/src/types';
import { eventError as messages } from '../messages';
import { AgendaProvider, useAgenda } from '../_context/agenda';
import AgendaHeader from './AgendaHeader';

export type EventErrorProps = {
  statusCode: number;
  agendaSlug: string;
  eventSlug?: string;
  agenda?: Agenda;
  error?: Error | JsonError;
  resetError?: () => void;
};

function EventErrorContent({
  statusCode,
  agendaSlug,
  error,
  resetError,
}: Omit<EventErrorProps, 'agenda'>) {
  const intl = useIntl();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localePath = useLocalePath();
  const agenda = useAgenda();
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
        <Button asChild mt="8">
          <Link unstyled href={localePath(`/${agendaSlug}/contact`)}>
            {intl.formatMessage(messages.contactAdministrators)}
          </Link>
        </Button>
      </ErrorContainer>
    );
  }

  if (statusCode === 404 || statusCode === 410) {
    // page.tsx renders this without `agenda` when the agenda itself 404s
    // (the event fetch never runs in that case), and with `agenda` when the
    // event 404s under an existing agenda.
    if (!agenda) {
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

    return (
      <>
        <Box as="header" w="full" bg="darkPurple.500" px="4" py="8">
          <Container
            maxW="container.lg"
            color="white"
            textAlign={{ base: 'center', md: 'start' }}
          >
            <AgendaHeader />
          </Container>
        </Box>

        <ErrorContainer>
          <Text fontSize="2xl" fontWeight="bold" mb="4">
            {intl.formatMessage(messages.eventNotFound)}
          </Text>
          <Text textAlign="center">
            {statusCode === 410
              ? intl.formatMessage(messages.eventGoneMsg)
              : intl.formatMessage(messages.notFoundMsg, { br: <br /> })}
          </Text>

          <Button asChild mt="8">
            <Link unstyled href={localePath(`/${agendaSlug}`)}>
              {intl.formatMessage(messages.seeAgenda)}
            </Link>
          </Button>
        </ErrorContainer>
      </>
    );
  }

  return <ErrorDisplay error={error} resetError={resetError} />;
}

export default function EventError({ agenda, ...rest }: EventErrorProps) {
  if (agenda) {
    return (
      <AgendaProvider agenda={agenda}>
        <EventErrorContent {...rest} />
      </AgendaProvider>
    );
  }
  return <EventErrorContent {...rest} />;
}
