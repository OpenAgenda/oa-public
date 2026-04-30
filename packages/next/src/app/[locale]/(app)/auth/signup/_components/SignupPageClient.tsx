'use client';

import { useState } from 'react';
import Signup from 'components/auth/Signup';
import SignupComplete from 'components/auth/SignupComplete';

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
  const mtCaptchaSiteKey = process.env.NEXT_PUBLIC_MTCAPTCHA_SITEKEY;
  const [completeData, setCompleteData] = useState<{
    email: string;
    resendUrl: string;
  } | null>(null);

  if (completeData) {
    return (
      <SignupComplete
        email={completeData.email}
        resendUrl={completeData.resendUrl}
      />
    );
  }

  return (
    <Signup
      iToken={iToken}
      invitation={invitation}
      redirect={redirect}
      mtCaptchaEnabled={!!mtCaptchaSiteKey}
      mtCaptchaSiteKey={mtCaptchaSiteKey}
      onSignupComplete={setCompleteData}
    />
  );
}
