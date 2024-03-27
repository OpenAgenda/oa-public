import { useIntl } from 'react-intl';
import {
  chakra,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Tooltip,
  Portal,
  useBreakpointValue, Link,
} from '@openagenda/uikit';
import stateMessages from '@openagenda/common-labels/event/states';
import StateTag from 'components/StateTag';
import { FaIcon } from 'icons';
import { faChevronDown } from 'icons/solid';
import useEvent from '../../hooks/useEvent';
import useMember from '../../hooks/useMember';
import { contextBar as messages } from '../../messages';
import ContextBarButton from './ContextBarButton';
import { fullWidth } from './popperModifiers';

const stateMap = {
  '-1': 'refused',
  0: 'toModerate',
  1: 'readyToPublish',
  2: 'published',
};

function getContributorInfo(intl, state) {
  switch (state) {
    case -1:
      return intl.formatMessage(messages.refusedContributorInfo);
    case 0:
      return intl.formatMessage(messages.toModerateContributorInfo);
    case 1:
      return intl.formatMessage(messages.readyToPublishContributorInfo);
    case 2:
      return intl.formatMessage(messages.publishedContributorInfo);
    default:
      return null;
  }
}

// <chakra.span display={{ base: 'none', md: 'inline-flex' }} verticalAlign="middle" alignItems="center">

export default function StateSelector({ agenda }) {
  const intl = useIntl();

  const { event, mutate } = useEvent();
  const { me } = useMember();

  const isMobile = useBreakpointValue({ base: true, md: false });

  const {
    canChangeState = false,
    canPublish = false,
  } = me?.authorizations ?? {};

  const changeState = async (state: number) => {
    try {
      const optimisticResponse = {
        success: true,
        event: {
          ...event,
          state,
        },
      };

      await mutate(async () => {
        const response = await fetch(`/api/agendas/${agenda.uid}/events/${event.uid}`, {
          method: 'PATCH',
          body: JSON.stringify({ state }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) return optimisticResponse;
        throw new Error('Error');
      }, {
        optimisticData: optimisticResponse,
        revalidate: false,
      });
    } catch (e) {
      console.log('UPDATE STATE ERROR', e);
    }
  };

  const stateLabel = (
    <>
      {intl.formatMessage(messages.state)}
      &nbsp;
      {intl.formatMessage(stateMessages[stateMap[event.state]])}
    </>
  );

  if (!canChangeState) {
    return (
      <Menu
        matchWidth
        gutter={0}
        modifiers={isMobile ? fullWidth as any : null}
      >
        <Tooltip label={stateLabel} isDisabled={!isMobile}>
          <MenuButton
            as={ContextBarButton}
            rightIcon={<FaIcon icon={faChevronDown} />}
          >
            {/* Adds Flex because MenuButton adds a span that shifts the elements */}
            <Flex as="span" align="center" justify={{ base: 'center', md: 'start' }}>
              <StateTag state={event.state} marginEnd={{ base: 'none', md: '0.5rem' }} />
              {!isMobile ? (
                <>
                  {intl.formatMessage(messages.state)}
                  &nbsp;
                  {intl.formatMessage(stateMessages[stateMap[event.state]])}
                </>
              ) : null}
            </Flex>
          </MenuButton>
        </Tooltip>

        <MenuList borderTopRadius="0" p="4">
          <div>
            {getContributorInfo(intl, event.state)}
          </div>
          <Button
            as={Link}
            href={`/${agenda.slug}/events/${event.slug}/contact`}
            mt="4"
            colorScheme="primary"
          >
            {intl.formatMessage(messages.contactAdministrators)}
          </Button>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Menu
      matchWidth
      gutter={0}
      modifiers={isMobile ? fullWidth as any : null}
    >
      <Tooltip label={stateLabel} isDisabled={!isMobile}>
        <MenuButton
          as={ContextBarButton}
          textAlign="start"
          display="inline-flex"
          leftIcon={<StateTag state={event.state} />}
          rightIcon={<FaIcon icon={faChevronDown} />}
        >
          <chakra.span display={{ base: 'none', md: 'inline' }}>
            {stateLabel}
          </chakra.span>
        </MenuButton>
      </Tooltip>
      <Portal>
        <MenuList borderTopRadius="0">
          <MenuItem onClick={() => changeState(-1)}>
            <StateTag state="refused" mr="2" />
            <Flex direction="column">
              <b>{intl.formatMessage(stateMessages.refused)}</b>
              {intl.formatMessage(messages.refusedInfo)}
            </Flex>
          </MenuItem>
          <MenuItem onClick={() => changeState(0)}>
            <StateTag state="toControl" mr="2" />
            <Flex direction="column">
              <b>{intl.formatMessage(stateMessages.toModerate)}</b>
              {intl.formatMessage(messages.toModerateInfo)}
            </Flex>
          </MenuItem>
          <MenuItem onClick={() => changeState(1)}>
            <StateTag state="controlled" mr="2" />
            <Flex direction="column">
              <b>{intl.formatMessage(stateMessages.readyToPublish)}</b>
              {intl.formatMessage(messages.readyToPublishInfo)}
            </Flex>
          </MenuItem>
          <MenuItem isDisabled={!canPublish} onClick={() => changeState(2)}>
            <StateTag state="published" mr="2" />
            <Flex direction="column">
              <b>{intl.formatMessage(stateMessages.published)}</b>
              {intl.formatMessage(messages.publishedInfo)}
            </Flex>
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
}
