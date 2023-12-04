import { useRouter } from 'next/router';
import { Button, Flex, Link } from '@openagenda/uikit';
import base64 from 'utils/base64';

export default function UnloggedBody() {
  const router = useRouter();

  return (
    <Flex direction="column">
      <p>Vous devez vous connecter pour partager cet événement</p>
      <Button
        as={Link}
        href={`/signin?redirect=${base64.encode(router.asPath)}`}
        colorScheme="primary"
        mt="4"
        alignSelf="center"
      >
        Se connecter
      </Button>
    </Flex>
  );
}
