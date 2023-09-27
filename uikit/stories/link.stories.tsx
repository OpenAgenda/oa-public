import { Link, LinkOverlay, LinkBox, VStack } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Link',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack spacing="4">
      <Link isExternal href="https://google.com">
        This is a default link
      </Link>

      <Link isExternal href="https://google.com" colorScheme="primary">
        Link with colorScheme `primary`
      </Link>

      <Link isExternal href="https://google.com" colorScheme="danger">
        Link with colorScheme `danger`
      </Link>

      <Link isExternal href="https://google.com" colorScheme="black">
        Link with colorScheme `black`
      </Link>

      <LinkBox
        borderWidth="1px"
        bg="white"
        p="4"
        rounded="lg"
        as="article"
        _hover={{ shadow: 'lg' }}
      >
        <h2>
          <LinkOverlay href="google.com">Some blog post</LinkOverlay>
        </h2>
        <p>
          As a side note, using quotation marks around an attribute value is
          required only if this value is not a valid identifier.
        </p>
      </LinkBox>
    </VStack>
  );
}
