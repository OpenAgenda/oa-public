import Image from 'next/image';
import { Box, Button, Container, Flex, HStack } from '@openagenda/uikit';
import logoPic from '../../public/images/openagenda.png';
import useUser from 'hooks/useUser';
import { FetchStatus } from 'config/types';

export default function Navbar() {
  const { user, status, error } = useUser();

  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl" py="4">
        <HStack spacing="8" justify="space-between">
          <Image alt="logo" width="125" height="22" src={logoPic} />
          <Flex justify="right">
            {status === FetchStatus.Fetched ? (
              <>
                Logged as {user.fullName}
              </>
            ) : (
              <HStack spacing="6">
                <Button variant="link" colorScheme="primary">Sign in</Button>
                <Button variant="link" colorScheme="primary">Sign up</Button>
              </HStack>
            )}
          </Flex>
        </HStack>
      </Container>
    </Box>
  );
}
