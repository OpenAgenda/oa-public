'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { Box, Container, Flex, Link, CloseButton } from '@openagenda/uikit';
import { useIntl } from 'react-intl';

import messages from './messages';

const STORAGE_WELCOME_KEY = 'oa:hideLoggedWelcomeUntil';
const KEY_EXPIRY_DELAY = 1000 * 60 * 60 * 48;

// `initialTop` and `stuckTop` are both viewport-y px values. The banner
// appears at `initialTop` initially and sticks at `stuckTop` once scrolled
// past — pure-CSS slide. Set them equal for a fixed sticky position (no
// slide).
export function LoggedUserWelcome({
  initialTop = 0,
  stuckTop = 0,
  user,
  onClose = null,
  onHeightChange,
}) {
  const intl = useIntl();

  const flexRef = useRef(null);

  useLayoutEffect(() => {
    if (!flexRef.current || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const flex = flexRef.current;
      if (!flex) return;
      onHeightChange?.(flex.offsetHeight);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(flexRef.current);
    return () => ro.disconnect();
  }, [onHeightChange]);

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
  }, [onClose]);

  return (
    <Container
      maxW="7xl"
      px={0}
      // Overlay pattern, applied uniformly so layout is the same whether the
      // banner slides or stays put: `height: 0` + `mb` cancels `mt` → Container
      // takes 0 flow space. Hero segments below stay anchored at y=0 and their
      // bg can extend behind the navbar. The Flex inside overflows visibly —
      // do NOT add `overflow: hidden` here or the banner disappears.
      // Pure-CSS slide: `mt={initialTop}` sets the sticky natural position to
      // viewport y=initialTop. Sticky then engages at y=stuckTop once scrolled
      // past, following the navbar leaving the screen.
      mt={`${initialTop}px`}
      mb={`-${initialTop}px`}
      height="0"
      position="sticky"
      top={`${stuckTop}px`}
      animation="slide-from-top 0.5s ease-out, fade-in 0.5s ease-in"
      zIndex="docked"
    >
      <Flex
        ref={flexRef}
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
                  variant="underline"
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
