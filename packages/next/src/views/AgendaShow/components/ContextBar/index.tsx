import useSWR from 'swr';
import { Flex, Collapse } from '@openagenda/uikit';
import { FetchStatus } from 'config/types';
import ContributorContextBar from './ContributorContextBar';
import ModeratorContextBar from './ModeratorContextBar';

export default function ContextBar({ agenda }) {
  const {
    data: {
      me,
      events,
    } = {},
    status,
  } = useSWR(`/api/me/agendas/${agenda.uid}?includes[]=me.member&includes[]=me.authorizations&includes[]=me.events&includes[]=events`);

  if (status === FetchStatus.Fetching) return null;

  // not a member
  if (!me) return null;

  const { drafts } = me.events;
  const isAdminMod = ['administrator', 'moderator'].includes(me.member.role);

  return (
    <Collapse in animateOpacity>
      <Flex minH="50px" px="6" bg="primary.500" align="center" color="white">
        {isAdminMod ? (
          <ModeratorContextBar agenda={agenda} states={events?.states ?? []} />
        ) : (
          <ContributorContextBar agenda={agenda} drafts={drafts} states={me.events.states} />
        )}
      </Flex>
    </Collapse>
  );
}
