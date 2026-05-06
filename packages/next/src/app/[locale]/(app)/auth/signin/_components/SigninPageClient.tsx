'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Heading } from '@openagenda/uikit';
import Signin from 'components/auth/Signin';
import SignupComplete from 'components/auth/SignupComplete';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.AuthDialog.dialogTitle',
    defaultMessage: 'Sign in',
  },
  completeHeading: {
    id: 'next.components.auth.AuthDialog.dialogTitleSignupComplete',
    defaultMessage: 'Confirm your email address',
  },
});

interface SigninPageClientProps {
  redirect?: string;
  linkProvider?: 'google';
  linkError?: boolean;
  defaultEmail?: string;
}

export default function SigninPageClient({
  redirect,
  linkProvider,
  linkError,
  defaultEmail,
}: SigninPageClientProps) {
  const intl = useIntl();
  const [completeData, setCompleteData] = useState<{
    email: string;
    resendUrl: string;
  } | null>(null);

  if (completeData) {
    return (
      <>
        <Heading as="h1" size="xl" mb="6">
          {intl.formatMessage(messages.completeHeading)}
        </Heading>
        <SignupComplete
          email={completeData.email}
          resendUrl={completeData.resendUrl}
        />
      </>
    );
  }

  return (
    <>
      <Heading as="h1" size="xl" mb="6">
        {intl.formatMessage(messages.heading)}
      </Heading>
      <Signin
        redirect={redirect}
        linkProvider={linkProvider}
        linkError={linkError}
        defaultEmail={defaultEmail}
        onActivationRequired={setCompleteData}
      />
    </>
  );
}
