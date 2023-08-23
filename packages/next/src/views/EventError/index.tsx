// import { useRouter } from 'next/router';
// import { defineMessages, useIntl } from 'react-intl';
import { ErrorDisplay, JsonError } from 'components/ErrorDisplay';
import fetchErrorLocale from 'components/ErrorDisplay/locales';
// import base64 from 'utils/base64';
// import fetchLocale from './locales';

export type EventErrorProps = {
  // agendaSlug: string,
  // eventSlug: string,
  // statusCode: number,
  error?: JsonError
};

// const messages = defineMessages({
//   restrictedAccess: {
//     id: 'next.views.EventError.restrictedAccess',
//     defaultMessage: 'Restricted access',
//   },
//   unauthorizedMsg: {
//     id: 'next.views.EventError.unauthorizedMsg',
//     defaultMessage: 'Access to this agenda is restricted,{br}authenticate yourself before you can access it.',
//   },
//   signIn: {
//     id: 'next.views.EventError.signIn',
//     defaultMessage: 'Sign in',
//   },
//   orSignUp: {
//     id: 'next.views.EventError.orSignup',
//     defaultMessage: 'Or <link>sign up</link> if you don\'t have an account yet.',
//   },
//   forbiddenMsg: {
//     id: 'next.views.EventError.forbiddenMsg',
//     defaultMessage: 'You do not have access to this agenda.{br}Check the link provided to you or request access.',
//   },
//   requestInvitation: {
//     id: 'next.views.EventError.requestInvitation',
//     defaultMessage: 'Request an invitation',
//   },
//   agendaNotFound: {
//     id: 'next.views.EventError.agendaNotFound',
//     defaultMessage: 'Agenda not found',
//   },
//   notFoundMsg: {
//     id: 'next.views.EventError.notFoundMsg',
//     defaultMessage: 'There is no calendar corresponding to this link.{br}Either the link is invalid or the calendar has been deleted.',
//   },
//   searchAgenda: {
//     id: 'next.views.EventError.searchAgenda',
//     defaultMessage: 'Search an agenda',
//   },
// });

export default function EventError({ /* agendaSlug, eventSlug, statusCode, */ error }: EventErrorProps) {
  // const router = useRouter();
  // const intl = useIntl();

  /* if (statusCode === 401) {
    return (
      <ErrorContainer>
        <Text fontSize="2xl" fontWeight="bold" mb="4">
          {intl.formatMessage(messages.restrictedAccess)}
        </Text>
        <Text>
          {intl.formatMessage(messages.unauthorizedMsg, { br: <br /> })}
        </Text>
        <Button
          as={Link}
          href={`/signin?redirect=${base64.encode(router.asPath)}`}
          colorScheme="primary"
          mt="8"
        >
          {intl.formatMessage(messages.signIn)}
        </Button>

        <Text mt="2">
          {intl.formatMessage(messages.orSignUp, {
            // TODO remove useless type after upgrade of react-intl
            link: (chunks: React.ReactNode) => (
              <Button
                as={Link}
                href={`/signup?redirect=${base64.encode(router.asPath)}`}
                variant="link"
                colorScheme="primary"
              >
                {chunks}
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
        <Text>
          {intl.formatMessage(messages.forbiddenMsg, { br: <br /> })}
        </Text>
        <Button as={Link} href={`/${agendaSlug}/contact`} colorScheme="primary" mt="8">
          {intl.formatMessage(messages.requestInvitation)}
        </Button>
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

        <Button as={Link} href="/agendas" colorScheme="primary" mt="8">
          {intl.formatMessage(messages.searchAgenda)}
        </Button>
      </ErrorContainer>
    );
  } */

  // 500
  return (
    <ErrorDisplay error={error} />
  );
}

EventError.fetchLocale = locale => Promise.all([
  // fetchLocale(locale),
  fetchErrorLocale(locale),
]).then(results => Object.assign({}, ...results));
