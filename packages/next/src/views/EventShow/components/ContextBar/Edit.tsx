import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Flex,
  Tooltip,
  useBreakpointValue,
} from '@openagenda/uikit';
import { FaIcon } from 'icons';
import { faPencil, faChevronDown } from 'icons/solid';
import base64 from 'utils/base64';
import { contextBar as messages } from '../../messages';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import canModifyLocation from '../../utils/canModifyLocation';
import ContextBarButton from './ContextBarButton';
import { fullWidth } from './popperModifiers';

function LinkMenuItem({ action, href, rel = null }) {
  return (
    <MenuItem as="a" href={href} rel={rel}>
      <Flex direction="column" justifyContent="center" height="50px">
        <Text fontWeight="bold" display="block">
          {action}
        </Text>
      </Flex>
    </MenuItem>
  );
}

function LocationMenuItem({ agenda, event, member, intl }) {
  if (!event.location) {
    return null;
  }
  if (canModifyLocation(member, event, agenda)) {
    return (
      <LinkMenuItem
        href={`/${agenda.slug}/admin/locations/${event.location.uid}/edit`}
        action={intl.formatMessage(messages.editLocation)}
      />
    );
  }
  return (
    <LinkMenuItem
      href={`/${agenda.slug}/locations/${event.location.agendaUid}.${event.location.uid}/suggest-change`}
      action={intl.formatMessage(messages.suggestLocaitonChange)}
    />
  );
}

export default function Edit({ agenda }) {
  const intl = useIntl();

  const router = useRouter();

  const { event } = useEvent();
  const { me } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
  const url = new URL(localePrefix + router.asPath, 'https://n');
  const currentUrl = url.pathname + url.search;
  const editLink = `/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`;

  return (
    <Menu
      matchWidth
      gutter={0}
      modifiers={isMobile ? (fullWidth as any) : null}
    >
      <Tooltip label={intl.formatMessage(messages.edit)} isDisabled={!isMobile}>
        <MenuButton
          as={ContextBarButton}
          textAlign={{ base: 'center', md: 'start' }}
          lineHeight="normal"
          display="inline-flex"
          rightIcon={isMobile ? null : <FaIcon icon={faChevronDown} />}
        >
          {isMobile ? (
            <FaIcon icon={faPencil} size="lg" />
          ) : (
            <p>{intl.formatMessage(messages.edit)}</p>
          )}
        </MenuButton>
      </Tooltip>
      <MenuList borderTopRadius="0">
        <LinkMenuItem
          href={editLink}
          action={intl.formatMessage(messages.editEvent)}
        />
        <LocationMenuItem
          agenda={agenda}
          event={event}
          member={me.member}
          intl={intl}
        />
      </MenuList>
    </Menu>
  );
}
