'use client';

import { useRef } from 'react';
import qs from 'qs';
import { usePathname, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import useSessionStorageState from 'use-session-storage-state';
import {
  chakra,
  SimpleGrid,
  Collapsible,
  Link,
  useBreakpointValue,
} from '@openagenda/uikit';
import { Tooltip } from '@openagenda/uikit/snippets';
import { FaIcon } from '@/src/icons';
import { faTurnLeft } from '@/src/icons/solid';
import base64 from '@/src/utils/base64';
import { FetchStatus } from '@/src/config/types';
import useLocationQuery from '@/src/hooks/useLocationQuery';
import useUser from '@/src/hooks/useUser';
import isAdminMod from '@/src/utils/isAdminMod';
import { useAgenda } from '../../_context/agenda';
import useEvent from '../../_hooks/useEvent';
import useMember from '../../_hooks/useMember';
import { contextBar as messages } from '../../messages';
import StateSelector from './StateSelector';
import ContextBarButton from './ContextBarButton';
import OtherActions from './OtherActions';
import OwnerActions from './OwnerActions';
import Edit from './Edit';

const Column = chakra('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    bg: 'primary.500',
    // flex: '1',
    h: '50px',
    // flexBasis: ['100%', null, 'auto'],
  },
});

function getAdminNav(eventNc) {
  if (!eventNc) {
    return null;
  }

  const result = {
    page: Math.floor(eventNc.from / 20) + 1,
  };

  for (const key in eventNc) {
    if (Object.prototype.hasOwnProperty.call(eventNc, key)) {
      if (
        key === 'from' ||
        key === 'fromAdmin' ||
        key === 'first' ||
        key === 'last'
      ) {
        continue;
      }
      // // ignore default sort
      // if (key === 'sort' && eventNc[key] === 'updatedAt.desc') {
      //   continue;
      // }
      // // ignore if contains all states
      // if (key === 'state' && eventNc[key].every(v => [-1, 0, 1, 2].includes(v))) {
      //   continue;
      // }
      result[`q.${key}`] = eventNc[key];
    }
  }

  return result;
}

export default function ContextBar() {
  const intl = useIntl();

  const query = useLocationQuery();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const agenda = useAgenda();
  const { event } = useEvent();
  const { me, member, status } = useMember();
  const { user } = useUser();

  const ref = useRef<HTMLDivElement | null>(null);

  const isEventContributor = member && member.userUid === me?.member?.userUid;
  const isOwnerOnly =
    !!user?.uid &&
    user.uid === event.ownerUid &&
    !isEventContributor &&
    !isAdminMod(me?.member);

  const search = searchParams.toString();
  const currentUrl = search ? `${pathname}?${search}` : pathname;

  const [nc] = useSessionStorageState('EventShow:nc');
  const eventNc = nc?.[`${agenda.uid}.${event.uid}`] || query.nc;

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (status === FetchStatus.Fetching) {
    return null;
  }

  const editLink = `/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`;

  // The user is the owner of the event but is no longer a contributor /
  // adminmod of its agenda (e.g. left a now-closed agenda). Surface a minimal
  // bar so they can still duplicate their own event towards another agenda.
  if (isOwnerOnly) {
    return (
      <Collapsible.Root open>
        <Collapsible.Content>
          <OwnerActions />
        </Collapsible.Content>
      </Collapsible.Root>
    );
  }

  return (
    <Collapsible.Root open>
      <Collapsible.Content>
        <SimpleGrid
          ref={ref}
          columns={isAdminMod(me?.member) ? 4 : 3}
          bg="white"
          gap="1px"
        >
          {isAdminMod(me?.member) ? (
            <Column>
              <Tooltip
                content={intl.formatMessage(messages.backToDashboard)}
                disabled={!isMobile}
                openDelay={0}
                closeDelay={0}
              >
                <ContextBarButton
                  asChild
                  justifyContent={{ base: 'center', md: 'space-between' }}
                >
                  <Link
                    href={`/${agenda.slug}/admin/events${qs.stringify(getAdminNav(eventNc), { addQueryPrefix: true })}`}
                  >
                    {isMobile ? (
                      <FaIcon icon={faTurnLeft} size="lg" />
                    ) : 
                      intl.formatMessage(messages.backToDashboard)
                    }
                  </Link>
                </ContextBarButton>
              </Tooltip>
            </Column>
          ) : null}
          <Column>
            <StateSelector
              agenda={agenda}
              editLink={editLink}
              contextBarRef={ref}
            />
          </Column>
          <Column>
            <Edit agenda={agenda} contextBarRef={ref} />
          </Column>
          <Column>
            <OtherActions
              agenda={agenda}
              editLink={editLink}
              contextBarRef={ref}
            />
          </Column>
        </SimpleGrid>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
