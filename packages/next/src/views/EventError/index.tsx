import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { Text, Button, Link, Container, Box } from '@openagenda/uikit';
import {
  ErrorDisplay,
  ErrorContainer,
  JsonError,
} from 'components/ErrorDisplay';
import fetchErrorLocale from 'components/ErrorDisplay/locales';
import base64 from 'utils/base64';
import { useAgenda } from 'views/EventShow/contexts/agenda';
import AgendaHeader from 'views/EventShow/components/AgendaHeader';
import messages from './messages';
import fetchLocale from './locales';

export type EventErrorProps = {
  agendaSlug: string;
  eventSlug: string;
  statusCode: number;
  error?: JsonError;
};

export default function EventError({
  agendaSlug,
  eventSlug: _eventSlug,
  statusCode,
  error,
}: EventErrorProps) {
  const router = useRouter();
  const intl = useIntl();

  const agenda = useAgenda();

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
          <Link
            unstyled
            href={`/signin?redirect=${base64.encode(router.asPath)}`}
          >
            {intl.formatMessage(messages.signIn)}
          </Link>
        </Button>

        <Text mt="2">
          {intl.formatMessage(messages.orSignUp, {
            link: (chunks) => (
              <Button asChild variant="link">
                <Link
                  unstyled
                  href={`/signup?redirect=${base64.encode(router.asPath)}`}
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
          <Link unstyled href={`/${agendaSlug}/contact`}>
            {intl.formatMessage(messages.contactAdministrators)}
          </Link>
        </Button>
      </ErrorContainer>
    );
  }

  if (statusCode === 404) {
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
            <Link unstyled href="/agendas">
              {intl.formatMessage(messages.searchAgenda)}
            </Link>
          </Button>
        </ErrorContainer>
      );
    }

    return (
      <>
        <Box as="header" w="full" bg="#413a42" px="4" py="8">
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
            {intl.formatMessage(messages.notFoundMsg, { br: <br /> })}
          </Text>

          <Button asChild mt="8">
            <Link unstyled href={`/${agendaSlug}`}>
              {intl.formatMessage(messages.seeAgenda)}
            </Link>
          </Button>
        </ErrorContainer>
      </>
    );
  }

  // 500
  return <ErrorDisplay error={error} />;
}

EventError.fetchLocale = (locale: string) =>
  Promise.all([fetchLocale(locale), fetchErrorLocale(locale)]).then((results) =>
    Object.assign({}, ...results),
  );
