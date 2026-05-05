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
  iToken?: string;
  invitation?: string;
  redirect?: string;
}

export default function SignupPageClient({
  iToken,
  invitation,
  redirect,
}: SignupPageClientProps) {
  const intl = useIntl();
  const mtCaptchaSiteKey = process.env.NEXT_PUBLIC_MTCAPTCHA_SITEKEY;
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
      <Signup
        iToken={iToken}
        invitation={invitation}
        redirect={redirect}
        mtCaptchaEnabled={!!mtCaptchaSiteKey}
        mtCaptchaSiteKey={mtCaptchaSiteKey}
        onSignupComplete={setCompleteData}
      />
    </>
  );
}
