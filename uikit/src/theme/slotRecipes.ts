import { accordionRecipe } from './recipes/accordion';
import { checkboxRecipe } from './recipes/checkbox';
import { menuRecipe } from './recipes/menu';
import { nativeSelectRecipe } from './recipes/native-select';
import { radioGroupRecipe } from './recipes/radio-group';
import { selectRecipe } from './recipes/select';
import { blockquoteSlotRecipe } from './recipes/blocquoteSlot';
import { listSlotRecipe } from './recipes/list';

export const slotRecipes = {
  accordion: accordionRecipe,
  checkbox: checkboxRecipe,
  menu: menuRecipe,
  nativeSelect: nativeSelectRecipe,
  radioGroup: radioGroupRecipe,
  select: selectRecipe,
  list: listSlotRecipe,
  blockquote: blockquoteSlotRecipe,
};
