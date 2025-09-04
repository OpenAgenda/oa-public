import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Text, Textarea, Button } from '@openagenda/uikit';
import useSWRMutation from 'swr/mutation';
import extractEmails from '@openagenda/mails/extractEmails';
import ky from 'ky';
import AccordionItem from '../AccordionItem';
import messages from './messages';

async function sendEmails(
  url,
  { arg }: { arg: { email: string }[] },
): Promise<{ count: number }> {
  return ky
    .post(url, {
      json: {
        mailsend: arg.map(({ email }) => email).join(';'),
      },
    })
    .json();
}

export default function ShareByEmail({ agenda, event, onClose, onEmailSent }) {
  const intl = useIntl();

  const [emailValue, setEmailValue] = useState('');
  const handleEmailsChange = (e) => {
    setEmailValue(e.target.value);
  };

  const emails = useMemo(() => extractEmails(emailValue), [emailValue]);

  const { trigger, isMutating } = useSWRMutation(
    `/${agenda.slug}/events/${event.uid}/email`,
    sendEmails,
    {
      onSuccess(data) {
        onClose();
        onEmailSent(data.count);
      },
    },
  );

  return (
    <AccordionItem
      value="email"
      title={intl.formatMessage(messages.shareByEmail)}
    >
      <div>
        <Textarea
          placeholder={intl.formatMessage(messages.shareByEmailPlaceholder)}
          value={emailValue}
          onChange={handleEmailsChange}
        />
        <Text fontSize="sm" mb="2">
          {intl.formatMessage(messages.byEmailSub)}
        </Text>
        <Button
          type="submit"
          disabled={!emails.length}
          loading={isMutating}
          onClick={(e) => {
            e.preventDefault();
            trigger(emails);
          }}
        >
          {intl.formatMessage(messages.send)}
        </Button>
      </div>
    </AccordionItem>
  );
}
