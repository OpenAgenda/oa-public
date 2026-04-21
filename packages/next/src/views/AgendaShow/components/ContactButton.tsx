import qs from 'qs';
import { defineMessages, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { Button, Link } from '@openagenda/uikit';
import { faEnvelope } from 'icons/solid';
import { FaIcon } from 'icons';
import AuthDialog from 'components/auth/AuthDialog';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';

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
  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;

  const mailtoUrl = getMailtoUrl(agenda.settings.inbox?.mailto);
  const contactHref = hrefWithLang(
    `/${agenda.slug}/contact`,
    sessionUser ? null : intl.locale,
  );

  if (sessionUser || mailtoUrl) {
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
      <Button variant="outline" {...outlineStyle}>
        <FaIcon icon={faEnvelope} />
        {intl.formatMessage(messages.contact)}
      </Button>
    </AuthDialog>
  );
}
