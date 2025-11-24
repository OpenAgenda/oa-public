import { useId } from 'react';
import { useIntl } from 'react-intl';
import { chakra, useBreakpointValue, Button, Link } from '@openagenda/uikit';
import {
  Tag,
  Tooltip,
  MenuRoot,
  MenuTrigger,
  MenuContent,
} from '@openagenda/uikit/snippets';
import { FaIcon } from 'icons';
import { faChevronDown } from 'icons/solid';
import { contextBar as messages } from '../../messages';
import useEvent from '../../hooks/useEvent';
import ContextBarButton from './ContextBarButton';

export default function ValidStatus({ editLink, contextBarRef }) {
  const intl = useIntl();

  const triggerId = useId();

  const { event } = useEvent();

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (event.valid !== false) {
    return null;
  }

  const nonCompliantLabel = intl.formatMessage(messages.nonCompliant);

  return (
    <MenuRoot
      ids={{ trigger: triggerId }}
      positioning={{
        sameWidth: isMobile,
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
        content={nonCompliantLabel}
        disabled={!isMobile}
        openDelay={0}
        closeDelay={0}
      >
        <MenuTrigger asChild>
          <ContextBarButton textAlign="start">
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
              marginEnd={{ base: 'none' /* md: '0.5rem' */ }}
              fontSize="xs"
              fontWeight="bold"
            >
              !
            </Tag>
            {!isMobile ? (
              <chakra.span flex="1">{nonCompliantLabel}</chakra.span>
            ) : null}
            <FaIcon icon={faChevronDown} />
          </ContextBarButton>
        </MenuTrigger>
      </Tooltip>

      <MenuContent borderTopRadius="0" maxW="var(--available-width)">
        <div>{intl.formatMessage(messages.invalidEventInfo)}</div>
        <Button asChild mt="4">
          <Link href={editLink}>{intl.formatMessage(messages.fixEvent)}</Link>
        </Button>
      </MenuContent>
    </MenuRoot>
  );
}
