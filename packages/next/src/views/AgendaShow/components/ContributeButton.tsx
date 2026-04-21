import { defineMessages, useIntl } from 'react-intl';
import { useCookies } from 'react-cookie';
import { Button, Link } from '@openagenda/uikit';
import { faPlus } from 'icons/solid';
import { FaIcon } from 'icons';
import AuthDialog from 'components/auth/AuthDialog';
import hrefWithLang from 'utils/hrefWithLang';
import getSession from 'utils/getSession';

const messages = defineMessages({
  addEvent: {
    id: 'next.views.AgendaShow.AgendaHeader.addEvent',
    defaultMessage: 'Add an event',
  },
});

interface ContributeButtonProps {
  agenda: { slug: string; uid: string };
}

export default function ContributeButton({ agenda }: ContributeButtonProps) {
  const intl = useIntl();
  const [cookies] = useCookies();
  const sessionUser = getSession(cookies)?.user;

  const contributeHref = hrefWithLang(
    `/${agenda.slug}/contribute`,
    sessionUser ? null : intl.locale,
  );

  if (sessionUser) {
    return (
      <Button asChild>
        <Link unstyled href={contributeHref}>
          <FaIcon icon={faPlus} />
          {intl.formatMessage(messages.addEvent)}
        </Link>
      </Button>
    );
  }

  return (
    <AuthDialog
      agenda={{ slug: agenda.slug, uid: agenda.uid }}
      redirectOnSuccess={contributeHref}
    >
      <Button>
        <FaIcon icon={faPlus} />
        {intl.formatMessage(messages.addEvent)}
      </Button>
    </AuthDialog>
  );
}
