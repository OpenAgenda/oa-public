'use client';

import { useIntl } from 'react-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button, Text, Link } from '@openagenda/uikit';
import { DialogBody, DialogFooter } from '@openagenda/uikit/snippets';
import base64 from '@/src/utils/base64';
import Description from './Description';
import messages from './messages';

export default function UnloggedBody({ agenda }) {
  const intl = useIntl();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());
  params.set('displayAggregatorModal', '1');
  const redirectUrlPart = base64.encode(`${pathname}?${params.toString()}`);

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
