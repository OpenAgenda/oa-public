'use client';

import { defineMessages, useIntl } from 'react-intl';
import { Box, Heading } from '@openagenda/uikit';
import { fromMarkdownToHTML } from '@openagenda/md';

const messages = defineMessages({
  title: {
    id: 'next.auth.manual.title',
    defaultMessage: 'Verification of you account creation request',
  },
  context: {
    id: 'next.auth.manual.context',
    defaultMessage:
      'Due to a recent increase of account creations for the sole purpose of publishing advertisement content, a temporary measure has been set up to verify accounts prior to their creation.',
  },
  instruction: {
    id: 'next.auth.manual.instruction',
    defaultMessage:
      '**You will be quickly notified of the activation of your account by email (a few minutes during office hours Paris time).**',
  },
  complaint: {
    id: 'next.auth.manual.complaint',
    defaultMessage:
      'In case there is delay in processing your request, send us a message via the chat tool on our [homepage](/) or send us an email at [verif@openagenda.com](mailto:verif@openagenda.com) with the email used during the account creation.',
  },
});

export default function ManualPageClient() {
  const intl = useIntl();

  const context = fromMarkdownToHTML(intl.formatMessage(messages.context));
  const instruction = fromMarkdownToHTML(
    intl.formatMessage(messages.instruction),
  );
  const complaint = fromMarkdownToHTML(intl.formatMessage(messages.complaint));

  return (
    <>
      <Heading as="h1" size="xl" mb="6" textAlign="center">
        {intl.formatMessage(messages.title)}
      </Heading>
      <Box dangerouslySetInnerHTML={{ __html: context as string }} />
      <Box my="6" dangerouslySetInnerHTML={{ __html: instruction as string }} />
      <Box dangerouslySetInnerHTML={{ __html: complaint as string }} />
    </>
  );
}
