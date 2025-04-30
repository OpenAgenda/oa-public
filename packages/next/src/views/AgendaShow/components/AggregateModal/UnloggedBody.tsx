import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { Button, Text, Link } from '@openagenda/uikit';
import { DialogBody, DialogFooter } from '@openagenda/uikit/snippets';
import base64 from 'utils/base64';
import Description from './Description';
import messages from './messages';

export default function UnloggedBody({ agenda }) {
  const intl = useIntl();
  const router = useRouter();

  const url = new URL(router.asPath, 'https://n');
  url.searchParams.set('displayAggregatorModal', '1');
  const redirectUrlPart = base64.encode(url.pathname + url.search);

  return (
    <>
      <DialogBody>
        <Description agenda={agenda} />
        <Text>{intl.formatMessage(messages.shouldConnect)}</Text>
      </DialogBody>
      <DialogFooter>
        <Button asChild>
          <Link
            unstyled
            href={`/${agenda.slug}/signin?redirect=${redirectUrlPart}`}
          >
            {intl.formatMessage(messages.signin)}
          </Link>
        </Button>
      </DialogFooter>
    </>
  );
}
