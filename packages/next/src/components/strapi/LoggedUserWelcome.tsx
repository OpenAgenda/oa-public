import { Box, Container, Flex } from '@openagenda/uikit';
import { useIntl } from 'react-intl';

import messages from './messages';
import StrapiMarkdown from './StrapiMarkdown';

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
        bg="white"
        mx={4}
        py={4}
        px={6}
        borderRadius={8}
        borderColor="primary.500"
        borderWidth="1px"
      >
        <Box fontWeight="bold">
          {intl.formatMessage(messages.welcome, { firstName })}
        </Box>
        <Box>
          <StrapiMarkdown>
            {intl.formatMessage(messages.loggedIn, { email: user.email })}
          </StrapiMarkdown>
        </Box>
      </Flex>
    </Container>
  );
}
