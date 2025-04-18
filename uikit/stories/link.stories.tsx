import { Link, LinkOverlay, LinkBox, VStack } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Link',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack gap="4">
      <Link href="https://google.com" target="_blank" rel="noopener noreferrer">
        This is a default link
      </Link>

      <Link
        href="https://google.com"
        target="_blank"
        rel="noopener noreferrer"
        colorPalette="primary"
      >
        Link with colorPalette `primary`
      </Link>

      <Link
        href="https://google.com"
        target="_blank"
        rel="noopener noreferrer"
        colorPalette="danger"
      >
        Link with colorPalette `danger`
      </Link>

      <Link
        href="https://google.com"
        target="_blank"
        rel="noopener noreferrer"
        color="black"
      >
        Link with color `black`
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

All.storyName = 'Link';
