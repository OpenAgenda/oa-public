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
            // TODO remove useless type after upgrade of react-intl
            link: (chunks: React.ReactNode) => (
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
            {intl.formatMessage(messages.requestInvitation)}
          </Link>
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

        <Button asChild mt="8">
          <Link unstyled href="/agendas">
            {intl.formatMessage(messages.searchAgenda)}
          </Link>
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
