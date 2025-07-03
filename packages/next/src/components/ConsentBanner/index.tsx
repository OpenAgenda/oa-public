import { useRef } from 'react';
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
import {
  DialogRoot,
  DialogContent,
  DialogBody,
} from '@openagenda/uikit/snippets';
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

function ConsentFixed({ consentFor, setConsent }) {
  const intl = useIntl();

  const link = `https://support.google.com/analytics/answer/6004245?hl=${intl.locale || 'fr'}`;

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
          <Link
            mt="3"
            href={link}
            target="_blank"
            rel="noopener nofollow"
            color="oaBlue.500"
          >
            {intl.formatMessage(messages.moreInfoLink)}
          </Link>
        ) : null}
      </Box>
      <Spacer />
      <ButtonGroup gap="2">
        <Button onClick={() => setConsent(true)}>
          {intl.formatMessage(messages.accept)}
        </Button>
        <Button colorPalette="red" onClick={() => setConsent(false)}>
          {intl.formatMessage(messages.decline)}
        </Button>
      </ButtonGroup>
    </Flex>
  );
}

function ConsentOverlay({ consentFor, setConsent }) {
  const intl = useIntl();

  const declineRef = useRef(undefined);

  const link = `https://support.google.com/analytics/answer/6004245?hl=${intl.locale || 'fr'}`;

  return (
    <DialogRoot
      role="alertdialog"
      open
      initialFocusEl={() => declineRef.current}
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <DialogContent maxW="inherit" m="16" w="unset">
        <DialogBody display="flex" flexDir="column" gap="4">
          <Box mt="2">
            <Text>
              {intl.formatMessage(messages.informationText, {
                service: consentFor === 'ga' ? 'Google Analytics' : 'Matomo',
              })}
            </Text>
            {consentFor === 'ga' ? (
              <Link
                mt="3"
                href={link}
                target="_blank"
                rel="noopener nofollow"
                color="oaBlue.500"
              >
                {intl.formatMessage(messages.moreInfoLink)}
              </Link>
            ) : null}
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <Button onClick={() => setConsent(true)} borderRadius="none">
              {intl.formatMessage(messages.accept)}
            </Button>
            <Button
              ref={declineRef}
              onClick={() => setConsent(false)}
              bg="white"
              borderColor="oaGray.300"
              color="blackAlpha.800"
              _hover={{
                bg: 'oaGray.100',
                color: 'blackAlpha.900',
              }}
              borderRadius="none"
            >
              {intl.formatMessage(messages.decline)}
            </Button>
          </ButtonGroup>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}

export default function ConsentBanner({
  consentFor = 'ga',
  consentSource = 'cookies',
  display = 'fixed',
}) {
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
      if (consentFor === 'matomo') {
        setCookie('MatomoCookieConsent', value, {
          sameSite: 'none',
          secure: true,
        });
      }
    } else if (consentSource === 'localStorage') {
      if (consentFor === 'ga') setGaLocalStorageConsent(value);
      if (consentFor === 'matomo') setMatomoLocalStorageConsent(value);
    }
  };

  if (consentSource === 'localStorage' && !isMounted) {
    return null;
  }

  const ConsentComponent =
    display === 'overlay' ? ConsentOverlay : ConsentFixed;

  return <ConsentComponent consentFor={consentFor} setConsent={setConsent} />;
}
