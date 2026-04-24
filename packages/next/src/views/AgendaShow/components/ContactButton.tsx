import qs from 'qs';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { faEnvelope } from 'icons/solid';
import { FaIcon } from 'icons';
import AuthDialog from 'components/auth/AuthDialog';
import hrefWithLang from 'utils/hrefWithLang';
import useUser from 'hooks/useUser';

const messages = defineMessages({
  contact: {
    id: 'next.views.AgendaShow.AgendaHeader.contact',
    defaultMessage: 'Contact',
  },
});

function getMailtoUrl(mailtoSettings) {
  if (!mailtoSettings?.enabled || !mailtoSettings.email) return null;

  return `mailto:${mailtoSettings.email}${qs.stringify(
    {
      subject: mailtoSettings.subject,
      body: mailtoSettings.body,
    },
    { addQueryPrefix: true, skipNulls: true },
  )}`;
}

interface ContactButtonProps {
  agenda: {
    slug: string;
    uid: string;
    settings: { inbox?: { mailto?: Record<string, unknown> } };
  };
}

const outlineStyle = {
  color: 'white',
  borderColor: 'white',
  _hover: {
    bg: 'white',
    borderColor: 'white',
    color: 'primary.500',
    textDecoration: 'none',
  },
} as const;

export default function ContactButton({ agenda }: ContactButtonProps) {
  const intl = useIntl();
  const { user } = useUser();

  const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);
  const contactHref = hrefWithLang(
    `/${agenda.slug}/contact`,
    user ? null : intl.locale,
  );

  if (user || mailtoUrl) {
    return (
      <Button asChild variant="outline" {...outlineStyle}>
        <Link unstyled href={mailtoUrl || contactHref}>
          <FaIcon icon={faEnvelope} />
          {intl.formatMessage(messages.contact)}
        </Link>
      </Button>
    );
  }

  return (
    <AuthDialog
      agenda={{ slug: agenda.slug, uid: agenda.uid }}
      redirectOnSuccess={contactHref}
    >
      <Button variant="outline" aria-haspopup="dialog" {...outlineStyle}>
        <FaIcon icon={faEnvelope} />
        {intl.formatMessage(messages.contact)}
      </Button>
    </AuthDialog>
  );
}
