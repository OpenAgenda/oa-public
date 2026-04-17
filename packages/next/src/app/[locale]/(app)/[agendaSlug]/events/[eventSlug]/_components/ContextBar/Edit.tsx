'use client';

import { useId, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useIntl } from 'react-intl';
import {
  chakra,
  Link,
  useBreakpointValue,
  Text,
  Flex,
} from '@openagenda/uikit';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Tooltip,
  Tag,
} from '@openagenda/uikit/snippets';
import { FaIcon } from '@/src/icons';
import { faPencil, faChevronDown } from '@/src/icons/solid';
import base64 from '@/src/utils/base64';
import completeExternalActions from '@/src/utils/completeExternalActions';
import { contextBar as messages } from '../../messages';
import useEvent from '../../_hooks/useEvent';
import useMember from '../../_hooks/useMember';
import ContextBarButton from './ContextBarButton';
import LocationMenuItem from './LocationMenuItem';
import MemberMenuItem from './MemberMenuItem';

export default function Edit({ agenda, contextBarRef }) {
  const intl = useIntl();

  const triggerId = useId();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { event } = useEvent();
  const { me, member } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const search = searchParams.toString();
  const currentUrl = search ? `${pathname}?${search}` : pathname;
  const editLink = `/${agenda.slug}/contribute/event/${event.uid}?redirect=${base64.encode(currentUrl)}`;

  const { externalActions } = useMemo(
    () =>
      completeExternalActions(
        agenda.settings?.locations?.extIds,
        (event.location as any)?.extIds || [],
      ),
    [agenda, event.location],
  );

  const externalEditActions = useMemo(() => {
    if (!externalActions || !Array.isArray(externalActions)) return [];
    return externalActions.filter((action) => action.action === 'edit');
  }, [externalActions]);

  const isInvalid = event.valid === false;

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
              <Flex alignItems="center" gap="2">
                {isInvalid ? (
                  <Tag
                    borderRadius="full"
                    variant="solid"
                    bg="danger.500"
                    borderWidth="1px"
                    borderColor="white"
                    w="5"
                    h="5"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    !
                  </Tag>
                ) : null}
                <FaIcon icon={faPencil} size="lg" />
              </Flex>
            ) : (
              <Flex direction="column" flex="1">
                <chakra.span>{intl.formatMessage(messages.edit)}</chakra.span>
                {isInvalid ? (
                  <Flex alignItems="center" gap="2" mt="1">
                    <Tag
                      borderRadius="full"
                      variant="solid"
                      bg="danger.500"
                      borderWidth="1px"
                      borderColor="white"
                      w="5"
                      h="5"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      !
                    </Tag>
                    <Text fontSize="xs">
                      {intl.formatMessage(messages.nonCompliant)}
                    </Text>
                  </Flex>
                ) : null}
              </Flex>
            )}
            {isMobile ? null : <FaIcon icon={faChevronDown} />}
          </ContextBarButton>
        </MenuTrigger>
      </Tooltip>

      <MenuContent borderTopRadius="0" maxW="var(--available-width)">
        <MenuItem
          value="edit-event"
          asChild
          fontWeight="bold"
          height="50px"
          title={
            isInvalid
              ? intl.formatMessage(messages.invalidEventInfo)
              : undefined
          }
        >
          <Link unstyled href={editLink}>
            <Flex alignItems="center" gap="2">
              {intl.formatMessage(messages.editEvent)}
              {isInvalid ? (
                <Tag
                  borderRadius="full"
                  variant="solid"
                  bg="danger.500"
                  borderWidth="1px"
                  borderColor="white"
                  w="5"
                  h="5"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  !
                </Tag>
              ) : null}
            </Flex>
          </Link>
        </MenuItem>
        <LocationMenuItem
          messages={messages}
          agenda={agenda}
          event={event}
          me={me}
          intl={intl}
          externalEditActions={externalEditActions}
        />
        {member ? (
          <MemberMenuItem agenda={agenda} me={me} member={member} intl={intl} />
        ) : null}
      </MenuContent>
    </MenuRoot>
  );
}
