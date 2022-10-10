import Image from 'next/future/image';
import { Box, Button, Container, Flex, HStack } from '@openagenda/uikit';
import logoPic from '../../public/images/openagenda.png';

export default function Navbar() {
  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl" py="4">
        <HStack spacing="8" justify="space-between">
          <Image width="125" height="22" src={logoPic} />
          <Flex justify="right">
            <HStack spacing="6">
              <Button variant="link" colorScheme="primary">Sign in</Button>
              <Button variant="link" colorScheme="primary">Sign up</Button>
            </HStack>
          </Flex>
        </HStack>
      </Container>
    </Box>
  );
}
