import { contextBar as messages } from '../../messages';
import LinkMenuItem from './LinkMenuItem';

export default function MemberMenuItem({ agenda, me, member, intl }) {
  const isEventContributor = member?.userUid === me?.member?.userUid;

  const href = isEventContributor
    ? `/home?agendaUid=${agenda.uid}`
    : `/${agenda.slug}/admin/members?userUid=${member.userUid}`;

  return (
    <LinkMenuItem value="edit-member" href={href}>
      {intl.formatMessage(
        messages[isEventContributor ? 'editMemberMe' : 'editMember'],
      )}
    </LinkMenuItem>
  );
}
