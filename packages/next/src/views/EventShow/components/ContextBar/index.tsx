import qs from 'qs';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { chakra, Box, SimpleGrid, Collapse, Icon, Link } from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faList } from 'icons/regular';
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

  if (status === FetchStatus.Fetching) {
    return null;
  }

  return (
    <Collapse in animateOpacity>
      <SimpleGrid columns={{ sm: 1, md: isAdminMod ? 4 : 3 }} bg="white" spacing="1px">
        {isAdminMod ? (
          <Column>
            <ContextBarButton
              as="a"
              href={`/${agenda.slug}/admin/events${qs.stringify(query.nc, { addQueryPrefix: true })}`}
              sx={{
                '.list-icon': {
                  opacity: 0.6,
                  transitionProperty: 'opacity',
                },
                _hover: {
                  '.list-icon': {
                    opacity: 1,
                  },
                  color: 'white',
                  bgColor: 'primary.600',
                },
                _active: {
                  '.list-icon': {
                    opacity: 1,
                  },
                  color: 'white',
                  bgColor: 'primary.600',
                },
              }}
              rightIcon={(
                <Icon
                  className="list-icon"
                  as={FaIcon}
                  icon={faList}
                  size="2xl"
                  // opacity="0.4"
                  // _hover={{ opacity: 1 }}
                />
              )}
            >
              {intl.formatMessage(messages.backToDashboard)}
            </ContextBarButton>
          </Column>
        ) : null}
        <Column>
          <StateSelector agenda={agenda} />
        </Column>
        <Column>
          <ContextBarButton
            as={Link}
            href={`/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`}
            _hover={{
              textDecoration: 'none',
              bgColor: 'primary.600',
            }}
          >
            {intl.formatMessage(messages.edit)}
          </ContextBarButton>
        </Column>
        <Column>
          <OtherActions agenda={agenda} />
        </Column>
      </SimpleGrid>
    </Collapse>
  );
}
