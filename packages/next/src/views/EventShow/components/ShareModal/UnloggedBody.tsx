import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { Button, Flex, Link } from '@openagenda/uikit';
import base64 from 'utils/base64';
import { shareModal as messages } from '../../messages';

export default function UnloggedBody() {
  const intl = useIntl();
  const router = useRouter();

  return (
    <Flex direction="column">
      <p>{intl.formatMessage(messages.mustSignIn)}</p>
      <Button
        as={Link}
        href={`/signin?redirect=${base64.encode(router.asPath)}`}
        colorScheme="primary"
        mt="4"
        alignSelf="center"
      >
        {intl.formatMessage(messages.signIn)}
      </Button>
    </Flex>
  );
}
