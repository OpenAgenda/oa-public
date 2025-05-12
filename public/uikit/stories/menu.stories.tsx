import { Button, Flex } from '../src';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Menu',
  decorators: [Provider],
};

export function All() {
  return (
    <Flex justify="space-around">
      <MenuRoot positioning={{ placement: 'bottom-end' }} defaultOpen>
        <MenuTrigger asChild>
          <Button colorPalette="primary">Bertho</Button>
        </MenuTrigger>
        <MenuContent minW="3xs">
          <MenuItem value="agendas">Mes agendas</MenuItem>
          <MenuItem value="events">Mes événements</MenuItem>
          <MenuSeparator my="2" />
          <MenuItem value="parameters" textAlign="right">
            Paramètres
          </MenuItem>
          <MenuItem value="signout" textAlign="right">
            Se déconnecter
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Flex>
  );
}

All.storyName = 'Menu';
