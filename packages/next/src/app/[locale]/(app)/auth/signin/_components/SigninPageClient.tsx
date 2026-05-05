'use client';

import { defineMessages, useIntl } from 'react-intl';
import { Heading } from '@openagenda/uikit';
import Signin from 'components/auth/Signin';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.AuthDialog.dialogTitle',
    defaultMessage: 'Sign in',
  },
});

interface SigninPageClientProps {
  redirect?: string;
}

export default function SigninPageClient({ redirect }: SigninPageClientProps) {
  const intl = useIntl();

  return (
    <>
      <Heading as="h1" size="xl" mb="6">
        {intl.formatMessage(messages.heading)}
      </Heading>
      <Signin redirect={redirect} />
    </>
  );
}
