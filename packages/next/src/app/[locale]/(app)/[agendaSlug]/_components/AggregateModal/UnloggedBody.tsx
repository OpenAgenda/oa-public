'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { DialogBody } from '@openagenda/uikit/snippets';
import Signin from 'components/auth/Signin';
import SignupComplete from 'components/auth/SignupComplete';
import Description from './Description';

export default function UnloggedBody({ agenda }) {
  const { mutate } = useSWRConfig();
  // Parent-driven activation flow: when BA returns EMAIL_NOT_VERIFIED, swap
  // the Signin form for <SignupComplete> instead of relying on Signin's
  // (now-removed) inline verify panel.
  const [completeData, setCompleteData] = useState<{
    email: string;
    callbackURL?: string;
  } | null>(null);

  if (completeData) {
    return (
      <DialogBody>
        <SignupComplete
          email={completeData.email}
          callbackURL={completeData.callbackURL}
        />
      </DialogBody>
    );
  }

  return (
    <DialogBody>
      <Description agenda={agenda} />
      <Signin
        agenda={{ slug: agenda.slug, uid: agenda.uid }}
        onSuccess={() => mutate('/users/me')}
        onActivationRequired={setCompleteData}
      />
    </DialogBody>
  );
}
