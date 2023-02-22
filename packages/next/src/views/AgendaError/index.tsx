import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';
import { chakra, Text, Button, Link, SystemStyleObject } from '@openagenda/uikit';
import fetchLocale from './locales';

export type AgendaErrorProps = {
  agendaSlug: string,
  errorStatusCode: number,
  errorStack?: string,
  // errorMessage?: string,
};

const messages = defineMessages({
  restrictedAccess: {
    id: 'next.views.AgendaError.restrictedAccess',
    defaultMessage: 'Restricted access',
  },
  unauthorizedMsg: {
    id: 'next.views.AgendaError.unauthorizedMsg',
    defaultMessage: 'Access to this agenda is restricted,{br}authenticate yourself before you can access it.',
  },
  signIn: {
    id: 'next.views.AgendaError.signIn',
    defaultMessage: 'Sign in',
  },
  orSignUp: {
    id: 'next.views.AgendaError.orSignup',
    defaultMessage: 'Or <link>sign up</link> if you don\'t have an account yet.',
  },
  forbiddenMsg: {
    id: 'next.views.AgendaError.forbiddenMsg',
    defaultMessage: 'You do not have access to this agenda.{br}Check the link provided to you or request access.',
  },
  requestInvitation: {
    id: 'next.views.AgendaError.requestInvitation',
    defaultMessage: 'Request an invitation',
  },
  agendaNotFound: {
    id: 'next.views.AgendaError.agendaNotFound',
    defaultMessage: 'Agenda not found',
  },
  notFoundMsg: {
    id: 'next.views.AgendaError.notFoundMsg',
    defaultMessage: 'There is no calendar corresponding to this link.{br}Either the link is invalid or the calendar has been deleted.',
  },
  searchAgenda: {
    id: 'next.views.AgendaError.searchAgenda',
    defaultMessage: 'Search an agenda',
  },
  internalError: {
    id: 'next.views.AgendaError.internalError',
    defaultMessage: 'Internal error',
  },
  internalErrorMsg: {
    id: 'next.views.AgendaError.internalErrorMsg',
    defaultMessage: 'If the problem persists, please contact support.',
  },
  contactSupport: {
    id: 'next.views.AgendaError.contactSupport',
    defaultMessage: 'Contact support',
  },
});

function ErrorContainer({ children, ...rest }) {
  const styles: SystemStyleObject = {
    minW: 'xl',
    maxW: 'full',
    w: 'fit-content',
    mx: 'auto',
    mt: '20',
    mb: '16',
    py: '8',
    px: '4',
    bg: 'white',
    borderRadius: 'base',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  };

  return (
    <chakra.div {...rest} __css={styles}>
      {children}
    </chakra.div>
  );
}

export default function AgendaError({ agendaSlug, errorStatusCode, errorStack }: AgendaErrorProps) {
  const router = useRouter();
  const intl = useIntl();

  if (errorStatusCode === 401) {
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
          href={`/signin?redirect=${Buffer.from(router.asPath).toString('base64')}`}
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
                href={`/signup?redirect=${Buffer.from(router.asPath).toString('base64')}`}
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

  if (errorStatusCode === 403) {
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

  if (errorStatusCode === 404) {
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
  }

  // 500
  return (
    <ErrorContainer>
      <Text fontSize="2xl" fontWeight="bold" mb="4">
        {intl.formatMessage(messages.internalError)}
      </Text>
      <Text textAlign="center">
        {intl.formatMessage(messages.internalErrorMsg)}
      </Text>
      {errorStack ? (
        <chakra.pre
          textAlign="left"
          w="full"
          maxW="6xl"
          bg="oaGray.10"
          p="4"
          mt="8"
          overflow="auto"
          borderRadius="base"
        >
          {errorStack}
        </chakra.pre>
      ) : null}

      <Button as={Link} href="/support" colorScheme="primary" mt="8">
        {intl.formatMessage(messages.contactSupport)}
      </Button>
    </ErrorContainer>
  );
}

AgendaError.fetchLocale = fetchLocale;
