'use client';

import { useSWRConfig } from 'swr';
import { DialogBody } from '@openagenda/uikit/snippets';
import Signin from 'components/auth/Signin';
import Description from './Description';

export default function UnloggedBody({ agenda }) {
  const { mutate } = useSWRConfig();

  return (
    <DialogBody>
      <Description agenda={agenda} />
      <Signin
        agenda={{ slug: agenda.slug, uid: agenda.uid }}
        onSuccess={() => mutate('/users/me')}
      />
    </DialogBody>
  );
}
