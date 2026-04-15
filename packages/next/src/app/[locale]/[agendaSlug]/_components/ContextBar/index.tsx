import useSWR from 'swr';
import { Flex, Collapsible } from '@openagenda/uikit';
import { FetchStatus } from '@/src/config/types';
import defaultSize from '@/src/utils/defaultSize';
import isAdminMod from '@/src/utils/isAdminMod';
import ContributorContextBar from './ContributorContextBar';
import ModeratorContextBar from './ModeratorContextBar';
import VisibilityContextBar from './VisibilityContextBar';

export default function ContextBar({ agenda }) {
  const { data: { me, events } = {}, status } = useSWR(
    `/api/me/agendas/${agenda.uid}?includes[]=me.member&includes[]=me.authorizations&includes[]=me.events&includes[]=events`,
  );

  if (status === FetchStatus.Fetching) return null;

  // not a member
  if (!me) return null;

  const { drafts } = me.events;

  return (
    <Collapsible.Root open>
      <Collapsible.Content>
        <Flex
          minH="50px"
          px="6"
          bg="primary.500"
          align="center"
          color="white"
          fontSize={defaultSize}
        >
          <VisibilityContextBar agenda={agenda} />
          {isAdminMod(me.member) ? (
            <ModeratorContextBar
              agenda={agenda}
              states={events?.states ?? []}
            />
          ) : (
            <ContributorContextBar
              agenda={agenda}
              drafts={drafts}
              states={me.events.states}
            />
          )}
        </Flex>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
