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
    defaultMessage: 'This agenda uses cookies from the Google Analytics tracking service. They allow the administrators of the agenda to get insight on what content is viewed by visitors on websites. Do you accept them?',
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
}) {
  const intl = useIntl();
  const link = `https://support.google.com/analytics/answer/6004245?hl=${intl.locale || 'fr'}`;

  return (
    <Flex p="4" bg="oaGray.900" gap="2" alignItems="center" pos="fixed" bottom="0" right="0" left="0" zIndex="banner">
      <Box mt="2">
        <Text color="white">{intl.formatMessage(messages.informationText)}</Text>
        <Link mt="3" href={link} isExternal color="primary.500">{intl.formatMessage(messages.moreInfoLink)}</Link>
      </Box>
      <Spacer />
      <ButtonGroup gap="2">
        <Button colorScheme="red" onClick={() => setCookie('CookieConsent', false)}>{intl.formatMessage(messages.decline)}</Button>
        <Button colorScheme="primary" onClick={() => setCookie('CookieConsent', true)}>{intl.formatMessage(messages.accept)}</Button>
      </ButtonGroup>
    </Flex>
  );
}
