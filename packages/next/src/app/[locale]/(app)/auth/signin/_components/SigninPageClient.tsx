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
  invitation?: string;
  linkProvider?: 'google';
  linkError?: boolean;
  defaultEmail?: string;
  view?: 'signin' | 'lost' | 'resend';
}

export default function SigninPageClient({
  redirect,
  invitation,
  linkProvider,
  linkError,
  defaultEmail,
  view,
}: SigninPageClientProps) {
  const intl = useIntl();
  // Lift the activation panel to the page level so it owns the heading
  // and can swap the entire view between Signin and SignupComplete. Signin
  // calls `onActivationRequired` instead of showing its built-in verify
  // panel when this callback is provided.
  //
  // `?view=resend&email=…` (the 301 target for legacy `/activate/resend`
  // links) lands directly on the SignupComplete view.
  const [completeData, setCompleteData] = useState<{
    email: string;
    callbackURL?: string;
  } | null>(view === 'resend' && defaultEmail ? { email: defaultEmail } : null);

  if (completeData) {
    return (
      <>
        <Heading as="h1" size="xl" mb="6">
          {intl.formatMessage(messages.completeHeading)}
        </Heading>
        <SignupComplete
          email={completeData.email}
          callbackURL={completeData.callbackURL}
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
        invitation={invitation}
        linkProvider={linkProvider}
        linkError={linkError}
        defaultEmail={defaultEmail}
        defaultLostPassword={view === 'lost'}
        onActivationRequired={setCompleteData}
      />
    </>
  );
}
