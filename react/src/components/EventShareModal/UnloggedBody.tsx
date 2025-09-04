import { useIntl } from 'react-intl';
import { Button, Flex, Link } from '@openagenda/uikit';
import base64 from '../../utils/base64';
import AccordionItem from '../AccordionItem';
import messages from './messages';

export default function UnloggedBody() {
  const intl = useIntl();

  const asPath = window.location.pathname + window.location.search + window.location.hash;

  return (
    <AccordionItem value="on-oa" title={intl.formatMessage(messages.onOA)}>
      <Flex direction="column">
        <p>{intl.formatMessage(messages.mustSignIn)}</p>
        <Button asChild mt="4" alignSelf="center">
          <Link unstyled href={`/signin?redirect=${base64.encode(asPath)}`}>
            {intl.formatMessage(messages.signIn)}
          </Link>
        </Button>
      </Flex>
    </AccordionItem>
  );
}
