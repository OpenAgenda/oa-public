import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { Button, ModalBody, ModalFooter, Text, Link } from '@openagenda/uikit';
import Description from './Description';
import messages from './messages';

export default function UnloggedBody({ agenda }) {
  const intl = useIntl();
  const router = useRouter();

  const url = new URL(router.asPath, 'http://n');
  url.searchParams.set('displayAggregatorModal', '1');
  const redirectUrlPart = Buffer.from(url.pathname + url.search).toString('base64');

  return (
    <>
      <ModalBody>
        <Description agenda={agenda} />
        <Text>{intl.formatMessage(messages.shouldConnect)}</Text>
      </ModalBody>
      <ModalFooter>
        <Button
          as={Link}
          href={`/${agenda.slug}/signin?redirect=${redirectUrlPart}`}
          colorScheme="primary"
        >
          {intl.formatMessage(messages.signin)}
        </Button>
      </ModalFooter>
    </>
  );
}
