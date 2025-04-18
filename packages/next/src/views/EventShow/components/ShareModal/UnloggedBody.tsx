import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { Button, Flex, Link } from '@openagenda/uikit';
import base64 from 'utils/base64';
import { shareModal as messages } from '../../messages';
import AccordionItem from './AccordionItem';

export default function UnloggedBody() {
  const intl = useIntl();
  const router = useRouter();

  return (
    <AccordionItem value="on-oa" title={intl.formatMessage(messages.onOA)}>
      <Flex direction="column">
        <p>{intl.formatMessage(messages.mustSignIn)}</p>
        <Button asChild mt="4" alignSelf="center">
          <Link
            unstyled
            href={`/signin?redirect=${base64.encode(router.asPath)}`}
          >
            {intl.formatMessage(messages.signIn)}
          </Link>
        </Button>
      </Flex>
    </AccordionItem>
  );
}
