import { defineMessages, useIntl } from 'react-intl';
import { Button, Link } from '@openagenda/uikit';
import { faPlus } from 'icons/solid';
import { FaIcon } from 'icons';
import AuthDialog from 'components/auth/AuthDialog';
import hrefWithLang from 'utils/hrefWithLang';
import useUser from 'hooks/useUser';

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
  const { user } = useUser();

  const contributeHref = hrefWithLang(
    `/${agenda.slug}/contribute`,
    user ? null : intl.locale,
  );

  if (user) {
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
