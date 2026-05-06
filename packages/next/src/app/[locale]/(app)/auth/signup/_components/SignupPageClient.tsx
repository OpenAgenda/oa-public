'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Heading } from '@openagenda/uikit';
import Signup from 'components/auth/Signup';
import SignupComplete from 'components/auth/SignupComplete';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.AuthDialog.dialogTitleSignup',
    defaultMessage: 'Create an account',
  },
  completeHeading: {
    id: 'next.components.auth.AuthDialog.dialogTitleSignupComplete',
    defaultMessage: 'Confirm your email address',
  },
});

interface SignupPageClientProps {
  invitation?: string;
  redirect?: string;
  email?: string;
}

export default function SignupPageClient({
  invitation,
  redirect,
  email,
}: SignupPageClientProps) {
  const intl = useIntl();
  const mtCaptchaSiteKey = process.env.NEXT_PUBLIC_MTCAPTCHA_SITEKEY;
  const [completeData, setCompleteData] = useState<{
    email: string;
    callbackURL?: string;
  } | null>(null);

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
      <Signup
        invitation={invitation}
        redirect={redirect}
        defaultEmail={email}
        mtCaptchaEnabled={!!mtCaptchaSiteKey}
        mtCaptchaSiteKey={mtCaptchaSiteKey}
        onSignupComplete={setCompleteData}
      />
    </>
  );
}
