import { defineMessages, useIntl } from 'react-intl';
import {
  Text,
  Box,
  Flex,
  Link,
  Spacer,
  ButtonGroup,
  Button,
} from '@openagenda/uikit';

const messages = defineMessages({
  informationText: {
    id: 'next.components.ConsentBanner.informationText',
    defaultMessage: 'This agenda uses cookies from the {service} tracking service. They allow the administrators of the agenda to get insight on what content is viewed by visitors on websites. Do you accept them?',
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
  setCookie,
  consentFor = 'ga',
}) {
  const intl = useIntl();
  const link = `https://support.google.com/analytics/answer/6004245?hl=${intl.locale || 'fr'}`;

  const setRightCookie = value => {
    if (consentFor === 'ga') setCookie('GaCookieConsent', value);
    if (consentFor === 'matomo') setCookie('MatomoCookieConsent', value);
  };

  return (
    <Flex p="4" bg="oaGray.900" gap="2" alignItems="center" pos="fixed" bottom="0" right="0" left="0" zIndex="banner" direction={['column', 'row']}>
      <Box mt="2">
        <Text color="white">{intl.formatMessage(messages.informationText, { service: consentFor === 'ga' ? 'Google Analitycs' : 'Matomo' })}</Text>
        {consentFor === 'ga' ? <Link mt="3" href={link} isExternal color="primary.500">{intl.formatMessage(messages.moreInfoLink)}</Link> : null}
      </Box>
      <Spacer />
      <ButtonGroup gap="2">
        <Button colorScheme="red" onClick={() => setRightCookie(false)}>{intl.formatMessage(messages.decline)}</Button>
        <Button colorScheme="primary" onClick={() => setRightCookie(true)}>{intl.formatMessage(messages.accept)}</Button>
      </ButtonGroup>
    </Flex>
  );
}
