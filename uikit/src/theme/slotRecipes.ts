import { accordionRecipe } from './recipes/accordion';
import { checkboxRecipe } from './recipes/checkbox';
import { fieldRecipe } from './recipes/field';
import { menuRecipe } from './recipes/menu';
import { nativeSelectRecipe } from './recipes/native-select';
import { radioCardRecipe } from './recipes/radio-card';
import { radioGroupRecipe } from './recipes/radio-group';
import { selectRecipe } from './recipes/select';
import { blockquoteSlotRecipe } from './recipes/blocquoteSlot';
import { listSlotRecipe } from './recipes/list';

export const slotRecipes = {
  accordion: accordionRecipe,
  checkbox: checkboxRecipe,
  field: fieldRecipe,
  menu: menuRecipe,
  nativeSelect: nativeSelectRecipe,
  radioCard: radioCardRecipe,
  radioGroup: radioGroupRecipe,
  select: selectRecipe,
  list: listSlotRecipe,
  blockquote: blockquoteSlotRecipe,
};
