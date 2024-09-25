import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Menu',
  decorators: [Provider],
};

export function All() {
  return (
    <Flex justify="space-around">
      <Menu placement="bottom-end" colorScheme="primary" defaultIsOpen>
        {/* TODO `p={4} py={0}` -> `px={4}` after https://github.com/chakra-ui/chakra-ui/pull/6905 */}
        <MenuButton as={Button} colorScheme="primary">
          Bertho
        </MenuButton>
        <MenuList>
          <MenuItem textAlign="right">Mes agendas</MenuItem>
          <MenuItem textAlign="right">Mes événements</MenuItem>
          <MenuDivider />
          <MenuItem textAlign="right">Paramètres</MenuItem>
          <MenuItem textAlign="right">Se déconnecter</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}
