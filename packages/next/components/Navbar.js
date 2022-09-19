import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  useColorModeValue,
} from '@openagenda/uikit';

export default function Navbar() {
  return (
    <Box as="nav" bg="white" boxShadow={useColorModeValue('sm', 'sm-dark')}>
      <Container maxW="container.xl" py={{ base: '4', lg: '4' }}>
        <HStack spacing="10" justify="space-between">
          <img width="125" src="https://openagenda.com/images/openagenda.png"></img>
          <Flex justify="right" flex="1">
            <HStack spacing="6">
              <Button variant="link">Sign in</Button>
              <Button variant="link">Sign up</Button>
            </HStack>
          </Flex>
        </HStack>
      </Container>
    </Box>
  );
}
