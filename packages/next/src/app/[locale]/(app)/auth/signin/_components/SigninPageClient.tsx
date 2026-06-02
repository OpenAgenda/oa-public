'use client';

import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Heading } from '@openagenda/uikit';
import Signin from 'components/auth/Signin';
import SignupComplete from 'components/auth/SignupComplete';
import MessageAlert from '@/src/components/MessageAlert';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.AuthDialog.dialogTitle',
    defaultMessage: 'Sign in',
  },
  completeHeading: {
    id: 'next.components.auth.AuthDialog.dialogTitleSignupComplete',
    defaultMessage: 'Confirm your email address',
  },
  invalidActivationTitle: {
    id: 'next.components.auth.Signin.invalidActivation.title',
    defaultMessage: 'The activation link is not valid',
  },
  invalidActivationDescription: {
    id: 'next.components.auth.Signin.invalidActivation.description',
    defaultMessage:
      'This can be because it has already been used. If that is the case, your account should be activated.',
  },
  accountUnavailableTitle: {
    id: 'next.components.auth.Signin.accountUnavailable.title',
    defaultMessage: 'This account is unavailable',
  },
  accountUnavailableDescription: {
    id: 'next.components.auth.Signin.accountUnavailable.description',
    defaultMessage:
      'You cannot sign in to this account. If you think this is a mistake, please contact us through the Help menu.',
  },
});

// Each banner maps a `?msg=` value (parsed in page.tsx) to its alert copy.
// Generalising the lookup keeps a single render path as new banners are added.
const bannerMessages = {
  invalidActivation: {
    title: messages.invalidActivationTitle,
    description: messages.invalidActivationDescription,
  },
  accountUnavailable: {
    title: messages.accountUnavailableTitle,
    description: messages.accountUnavailableDescription,
  },
} as const;

interface SigninPageClientProps {
  redirect?: string;
  invitation?: string;
  linkProvider?: 'google';
  linkError?: boolean;
  defaultEmail?: string;
  view?: 'signin' | 'lost' | 'magic' | 'resend';
  banner?: 'invalidActivation' | 'accountUnavailable';
}

export default function SigninPageClient({
  redirect,
  invitation,
  linkProvider,
  linkError,
  defaultEmail,
  view,
  banner,
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
      {banner && (
        <MessageAlert
          role="alert"
          status="error"
          mb="4"
          description={intl.formatMessage(bannerMessages[banner].description)}
        >
          {intl.formatMessage(bannerMessages[banner].title)}
        </MessageAlert>
      )}
      <Signin
        redirect={redirect}
        invitation={invitation}
        linkProvider={linkProvider}
        linkError={linkError}
        defaultEmail={defaultEmail}
        defaultLostPassword={view === 'lost'}
        defaultMagicLink={view === 'magic'}
        onActivationRequired={setCompleteData}
      />
    </>
  );
}
