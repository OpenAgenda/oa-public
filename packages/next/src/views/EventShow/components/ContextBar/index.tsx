import { useRef } from 'react';
import qs from 'qs';
import { useRouter } from 'next/router';
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
import { FaIcon } from 'icons';
import { faTurnLeft } from 'icons/solid';
import base64 from 'utils/base64';
import { FetchStatus } from 'config/types';
import useLocationQuery from 'hooks/useLocationQuery';
import isAdminMod from '../../../../utils/isAdminMod';
import { useAgenda } from '../../contexts/agenda';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import { contextBar as messages } from '../../messages';
import StateSelector from './StateSelector';
import ContextBarButton from './ContextBarButton';
import OtherActions from './OtherActions';
import Edit from './Edit';

const Column = chakra('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    bg: 'oaBlue.500',
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

  const router = useRouter();
  const agenda = useAgenda();
  const { event } = useEvent();
  const { me, status } = useMember();

  const ref = useRef<HTMLDivElement | null>(null);

  const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
  const url = new URL(localePrefix + router.asPath, 'https://n');
  const currentUrl = url.pathname + url.search;

  const [nc] = useSessionStorageState('EventShow:nc');
  const eventNc = nc?.[`${agenda.uid}.${event.uid}`] || query.nc;

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (status === FetchStatus.Fetching) {
    return null;
  }

  const editLink = `/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`;

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
