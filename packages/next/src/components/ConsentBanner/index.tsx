import { defineMessages, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import useLocalStorageState from 'use-local-storage-state';
import {
  Text,
  Box,
  Flex,
  Link,
  Spacer,
  ButtonGroup,
  Button,
} from '@openagenda/uikit';
import useIsMounted from 'hooks/useIsMounted';

const messages = defineMessages({
  informationText: {
    id: 'next.components.ConsentBanner.informationText',
    defaultMessage:
      'This agenda uses cookies from the {service} tracking service. They allow the administrators of the agenda to get insight on what content is viewed by visitors on websites. Do you accept them?',
  },
  moreInfoLink: {
    id: 'next.components.ConsentBanner.moreInfoLink',
    defaultMessage: 'Click here for more information',
  },
  decline: {
    id: 'next.components.ConsentBanner.decline',
    defaultMessage: 'Decline',
  },
  accept: {
    id: 'next.components.ConsentBanner.accept',
    defaultMessage: 'Accept',
  },
});

export default function ConsentBanner({
  consentFor = 'ga',
  consentSource = 'cookies',
}) {
  const intl = useIntl();
  const link = `https://support.google.com/analytics/answer/6004245?hl=${intl.locale || 'fr'}`;

  const isMounted = useIsMounted();

  const [, setCookie] = useCookies();
  const [, setGaLocalStorageConsent] = useLocalStorageState<string | null>(
    'GaCookieConsent',
  );
  const [, setMatomoLocalStorageConsent] = useLocalStorageState<string | null>(
    'MatomoCookieConsent',
  );

  const setConsent = (value: any) => {
    if (consentSource === 'cookies') {
      if (consentFor === 'ga')
        setCookie('GaCookieConsent', value, { sameSite: 'none', secure: true });
      if (consentFor === 'matomo')
        setCookie('MatomoCookieConsent', value, {
          sameSite: 'none',
          secure: true,
        });
    } else if (consentSource === 'localStorage') {
      if (consentFor === 'ga') setGaLocalStorageConsent(value);
      if (consentFor === 'matomo') setMatomoLocalStorageConsent(value);
    }
  };

  if (consentSource === 'localStorage' && !isMounted) {
    return null;
  }

  return (
    <Flex
      p="4"
      bg="oaGray.900"
      gap="2"
      alignItems="center"
      direction={['column', 'row']}
      pos="fixed"
      bottom="0"
      right="0"
      left="0"
      zIndex="banner"
    >
      <Box mt="2">
        <Text color="white">
          {intl.formatMessage(messages.informationText, {
            service: consentFor === 'ga' ? 'Google Analytics' : 'Matomo',
          })}
        </Text>
        {consentFor === 'ga' ? (
          <Link mt="3" href={link} isExternal color="primary.500">
            {intl.formatMessage(messages.moreInfoLink)}
          </Link>
        ) : null}
      </Box>
      <Spacer />
      <ButtonGroup gap="2">
        <Button colorScheme="red" onClick={() => setConsent(false)}>
          {intl.formatMessage(messages.decline)}
        </Button>
        <Button colorScheme="primary" onClick={() => setConsent(true)}>
          {intl.formatMessage(messages.accept)}
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
