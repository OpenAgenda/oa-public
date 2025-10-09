import { Box, Container, Flex, Link } from '@openagenda/uikit';
import { useIntl } from 'react-intl';

import messages from './messages';

export default function LoggedUserWelcome({ top = 0, user }) {
  const intl = useIntl();

  // Extract first name from fullName
  const firstName =
    user.fullName?.split(' ')[0] ||
    intl.formatMessage({
      id: 'next.components.Strapi.LoggedUserWelcome.defaultUser',
      defaultMessage: 'user',
    });

  return (
    <Container
      maxW="7xl"
      px={0}
      position="sticky"
      top={top}
      animation="slide-from-top 0.5s ease-out, fade-in 0.5s ease-in"
      height={0}
      zIndex={1001}
    >
      <Flex
        direction="column"
        bg="strapi.frenchBlue.500"
        color="white"
        mx={4}
        py={4}
        px={6}
        borderRadius={8}
      >
        <Box fontWeight="bold">
          {intl.formatMessage(messages.welcome, { firstName })}
        </Box>
        <Box>
          {intl.formatMessage(messages.loggedIn, {
            email: user.email ? <b>{user.email}</b> : null,
            dashboard: (
              <Link href="/home" fontSize="md" fontWeight="bold" color="white">
                {intl.formatMessage(messages.dashboard)}
              </Link>
            ),
          })}
        </Box>
      </Flex>
    </Container>
  );
}
