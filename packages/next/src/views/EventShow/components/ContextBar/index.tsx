import qs from 'qs';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { chakra, Box, SimpleGrid, Collapse, Link, Tooltip, useBreakpointValue } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faTurnLeft, faPencil } from 'icons/solid';
import base64 from 'utils/base64';
import { FetchStatus } from 'config/types';
import useLocationQuery from 'hooks/useLocationQuery';
import { useAgenda } from '../../contexts/agenda';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import { contextBar as messages } from '../../messages';
import StateSelector from './StateSelector';
import ContextBarButton from './ContextBarButton';
import OtherActions from './OtherActions';

const Column = chakra(Box, {
  baseStyle: {
    display: 'flex',
    alignItems: 'center',
    bg: 'primary.500',
    // flex: '1',
    h: '50px',
    // flexBasis: ['100%', null, 'auto'],
  },
});

export default function ContextBar() {
  const intl = useIntl();

  const query = useLocationQuery();

  const router = useRouter();
  const agenda = useAgenda();
  const { event } = useEvent();
  const {
    me,
    status,
  } = useMember();

  const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
  const url = new URL(localePrefix + router.asPath, 'https://n');
  const currentUrl = url.pathname + url.search;

  const isAdminMod = me?.member?.role === 'administrator' || me?.member?.role === 'moderator';

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (status === FetchStatus.Fetching) {
    return null;
  }

  return (
    <Collapse in animateOpacity>
      <SimpleGrid columns={isAdminMod ? 4 : 3} bg="white" spacing="1px">
        {isAdminMod ? (
          <Column>
            <Tooltip label={intl.formatMessage(messages.backToDashboard)} isDisabled={!isMobile}>
              <ContextBarButton
                as={Link}
                href={`/${agenda.slug}/admin/events${qs.stringify(query.nc, { addQueryPrefix: true })}`}
                justifyContent={{ base: 'center', md: 'space-between' }}
              >
                {isMobile
                  ? <FaIcon icon={faTurnLeft} size="lg" />
                  : intl.formatMessage(messages.backToDashboard)}
              </ContextBarButton>
            </Tooltip>
          </Column>
        ) : null}
        <Column>
          <StateSelector agenda={agenda} />
        </Column>
        <Column>
          <Tooltip label={intl.formatMessage(messages.edit)} isDisabled={!isMobile}>
            <ContextBarButton
              as={Link}
              href={`/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`}
              justifyContent={{ base: 'center', md: 'space-between' }}
            >
              {isMobile
                ? <FaIcon icon={faPencil} size="lg" />
                : intl.formatMessage(messages.edit)}
            </ContextBarButton>
          </Tooltip>
        </Column>
        <Column>
          <OtherActions agenda={agenda} />
        </Column>
      </SimpleGrid>
    </Collapse>
  );
}
