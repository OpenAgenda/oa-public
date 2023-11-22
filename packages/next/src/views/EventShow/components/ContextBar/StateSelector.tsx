import { useIntl } from 'react-intl';
import { Menu, MenuButton, MenuList, MenuItem, Flex } from '@openagenda/uikit';
import stateMessages from '@openagenda/common-labels/event/states';
import StateTag from 'components/StateTag';
import { FaIcon } from 'icons';
import { faChevronDown } from 'icons/solid';
import useEvent from '../../hooks/useEvent';
import ContextBarButton from './ContextBarButton';

const stateMap = {
  '-1': 'refused',
  0: 'toModerate',
  1: 'readyToPublish',
  2: 'published',
};

// <chakra.span display={{ base: 'none', md: 'inline-flex' }} verticalAlign="middle" alignItems="center">

export default function StateSelector({ agenda }) {
  const intl = useIntl();

  const { event, mutate } = useEvent();

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

  return (
    <Menu matchWidth gutter={0}>
      <MenuButton
        as={ContextBarButton}
        textAlign="start"
        lineHeight="normal"
        display="inline-flex"
        leftIcon={<StateTag state={event.state} />}
        rightIcon={<FaIcon icon={faChevronDown} />}
      >
        Statut:&nbsp;
        {intl.formatMessage(stateMessages[stateMap[event.state]])}
      </MenuButton>
      <MenuList borderTopRadius="0">
        <MenuItem onClick={() => changeState(-1)}>
          <StateTag state="refused" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.refused)}</b>
            Cet événement n'est pas compatible avec l'agenda et ne sera pas publié
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => changeState(0)}>
          <StateTag state="toControl" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.toModerate)}</b>
            Cet événement doit être modéré et n'est pas prêt à être publié
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => changeState(1)}>
          <StateTag state="controlled" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.readyToPublish)}</b>
            Cet événement a été modéré et est prêt à être publié
          </Flex>
        </MenuItem>
        <MenuItem onClick={() => changeState(2)}>
          <StateTag state="published" mr="2" />
          <Flex direction="column">
            <b>{intl.formatMessage(stateMessages.published)}</b>
            Publiez cet événement pour le rendre visible sur l'agenda
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
