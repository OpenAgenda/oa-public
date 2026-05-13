'use client';

import { defineMessages, useIntl } from 'react-intl';
import { Heading } from '@openagenda/uikit';
import ResetPassword from 'components/auth/ResetPassword';

const messages = defineMessages({
  heading: {
    id: 'next.components.auth.ResetPassword.heading',
    defaultMessage: 'Reset password',
  },
});

interface ResetPasswordPageClientProps {
  token: string | null;
}

export default function ResetPasswordPageClient({
  token,
}: ResetPasswordPageClientProps) {
  const intl = useIntl();

  return (
    <>
      <Heading as="h1" size="xl" mb="6">
        {intl.formatMessage(messages.heading)}
      </Heading>
      <ResetPassword token={token} />
    </>
  );
}
