import { MenuItem } from '@openagenda/uikit/snippets';

import { Link } from '@openagenda/uikit';

import canModifyLocation from '../../utils/canModifyLocation';

import LinkMenuItem from './LinkMenuItem';

export default function LocationMenuItem({
  agenda,
  event,
  me,
  intl,
  externalEditActions,
  messages,
}) {
  if (!event.location) {
    return null;
  }

  if (externalEditActions && externalEditActions.length > 0) {
    return (
      <MenuItem value="edit-location" asChild fontWeight="bold" height="50px">
        <Link
          unstyled
          href={externalEditActions[0].link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {intl.formatMessage(messages.suggestLocationChange)}
        </Link>
      </MenuItem>
    );
  }

  if (canModifyLocation(me.member, event, agenda)) {
    return (
      <LinkMenuItem
        value="edit-location"
        href={`/${agenda.slug}/admin/locations/${event.location.uid}/edit`}
      >
        {intl.formatMessage(messages.editLocation)}
      </LinkMenuItem>
    );
  }
  return (
    <LinkMenuItem
      value="edit-location"
      href={`/${agenda.slug}/locations/${event.location.agendaUid}.${event.location.uid}/suggest-change`}
    >
      {intl.formatMessage(messages.suggestLocationChange)}
    </LinkMenuItem>
  );
}
