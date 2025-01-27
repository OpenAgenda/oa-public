import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { Text, Button, Link } from '@openagenda/uikit';
import {
  ErrorDisplay,
  ErrorContainer,
  JsonError,
} from 'components/ErrorDisplay';
import fetchErrorLocale from 'components/ErrorDisplay/locales';
import base64 from 'utils/base64';
import fetchLocale from './locales';
import messages from './messages';

export type AgendaErrorProps = {
  agendaSlug: string;
  statusCode: number;
  error?: JsonError;
};

export default function AgendaError({
  agendaSlug,
  statusCode,
  error,
}: AgendaErrorProps) {
  const router = useRouter();
  const intl = useIntl();

  if (statusCode === 401) {
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
        <Text>{intl.formatMessage(messages.forbiddenMsg, { br: <br /> })}</Text>
        <Button
          as={Link}
          href={`/${agendaSlug}/contact`}
          colorScheme="primary"
          mt="8"
        >
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
  }

  // 500
  return <ErrorDisplay error={error} />;
}

AgendaError.fetchLocale = (locale: string) =>
  Promise.all([fetchLocale(locale), fetchErrorLocale(locale)]).then((results) =>
    Object.assign({}, ...results),
  );
