import { accordionRecipe } from './recipes/accordion';
import { checkboxRecipe } from './recipes/checkbox';
import { menuRecipe } from './recipes/menu';
import { radioGroupRecipe } from './recipes/radio-group';
import { selectRecipe } from './recipes/select';
import { blockquoteSlotRecipe } from './recipes/blocquoteSlot';
import { listSlotRecipe } from './recipes/list';

export const slotRecipes = {
  accordion: accordionRecipe,
  checkbox: checkboxRecipe,
  menu: menuRecipe,
  radioGroup: radioGroupRecipe,
  select: selectRecipe,
  list: listSlotRecipe,
  blockquote: blockquoteSlotRecipe,
};
