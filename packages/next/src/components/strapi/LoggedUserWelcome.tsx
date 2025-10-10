import { useCallback } from 'react';
import { Box, Container, Flex, Link, CloseButton } from '@openagenda/uikit';
import { useIntl } from 'react-intl';

import messages from './messages';

const STORAGE_WELCOME_KEY = 'oa:hideLoggedWelcomeUntil';
const KEY_EXPIRY_DELAY = 1000 * 60 * 60 * 48;

export function LoggedUserWelcome({ top = 0, user, onClose = null }) {
  const intl = useIntl();

  // Extract first name from fullName
  const firstName =
    user.fullName?.split(' ')[0] ||
    intl.formatMessage({
      id: 'next.components.Strapi.LoggedUserWelcome.defaultUser',
      defaultMessage: 'user',
    });

  const close = useCallback(() => {
    if (!window?.localStorage) return;
    window.localStorage.setItem(
      STORAGE_WELCOME_KEY,
      `${new Date().getTime() + KEY_EXPIRY_DELAY}`,
    );
    if (onClose) {
      onClose();
    }
  }, []);

  return (
    <Container
      maxW="7xl"
      px={0}
      position="sticky"
      top={top}
      animation="slide-from-top 0.5s ease-out, fade-in 0.5s ease-in"
      height={0}
      zIndex="docked"
    >
      <Flex
        bg="strapi.frenchBlue.500"
        color="white"
        mx={4}
        py={4}
        px={6}
        borderRadius={8}
        justifyContent="space-between"
      >
        <Flex direction="column">
          <Box fontWeight="bold">
            {intl.formatMessage(messages.welcome, { firstName })}
          </Box>
          <Box>
            {intl.formatMessage(messages.loggedIn, {
              email: user.email ? <b>{user.email}</b> : null,
              dashboard: (
                <Link
                  href="/home"
                  fontSize="md"
                  fontWeight="bold"
                  color="white"
                >
                  {intl.formatMessage(messages.dashboard)}
                </Link>
              ),
            })}
          </Box>
        </Flex>
        <CloseButton onClick={close} color="white" />
      </Flex>
    </Container>
  );
}

export function shouldDisplayLoggedUserWelcome(user) {
  if (!user || !window) {
    return false;
  }
  const expiry = window.localStorage.getItem(STORAGE_WELCOME_KEY);
  if (!expiry) {
    return true;
  }

  return new Date().getTime() > Number.parseInt(expiry, 10);
}
