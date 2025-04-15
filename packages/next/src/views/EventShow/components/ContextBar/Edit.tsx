import { useId } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import { chakra, Link, useBreakpointValue } from '@openagenda/uikit';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Tooltip,
} from '@openagenda/uikit/snippets';
import { FaIcon } from 'icons';
import { faPencil, faChevronDown } from 'icons/solid';
import base64 from 'utils/base64';
import { contextBar as messages } from '../../messages';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import canModifyLocation from '../../utils/canModifyLocation';
import ContextBarButton from './ContextBarButton';

function LinkMenuItem({ value, href, children }) {
  return (
    <MenuItem value={value} asChild fontWeight="bold" height="50px">
      <Link unstyled href={href}>
        {children}
      </Link>
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

export default function Edit({ agenda, contextBarRef }) {
  const intl = useIntl();

  const triggerId = useId();

  const router = useRouter();

  const { event } = useEvent();
  const { me } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const localePrefix = router.locale === 'default' ? '' : `/${router.locale}`;
  const url = new URL(localePrefix + router.asPath, 'https://n');
  const currentUrl = url.pathname + url.search;
  const editLink = `/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`;

  return (
    <MenuRoot
      ids={{ trigger: triggerId }}
      positioning={{
        sameWidth: true,
        gutter: 0,
        overflowPadding: 0,
        fitViewport: true,
        getAnchorRect: isMobile
          ? () => {
              return contextBarRef.current!.getBoundingClientRect();
            }
          : null,
      }}
    >
      <Tooltip
        ids={{ trigger: triggerId }}
        content={intl.formatMessage(messages.edit)}
        disabled={!isMobile}
        openDelay={0}
        closeDelay={0}
      >
        <MenuTrigger asChild>
          <ContextBarButton
            textAlign={{ base: 'center', md: 'start' }}
            lineHeight="normal"
            display="inline-flex"
            justifyContent="center"
          >
            {isMobile ? (
              <FaIcon icon={faPencil} size="lg" />
            ) : (
              <chakra.p flex="1">{intl.formatMessage(messages.edit)}</chakra.p>
            )}
            {isMobile ? null : <FaIcon icon={faChevronDown} />}
          </ContextBarButton>
        </MenuTrigger>
      </Tooltip>

      <MenuContent borderTopRadius="0" maxW="var(--available-width)">
        <LinkMenuItem value="edit-event" href={editLink}>
          {intl.formatMessage(messages.editEvent)}
        </LinkMenuItem>
        <LocationMenuItem
          agenda={agenda}
          event={event}
          member={me.member}
          intl={intl}
        />
      </MenuContent>
    </MenuRoot>
  );
}
