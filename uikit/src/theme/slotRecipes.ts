import { accordionRecipe } from './recipes/accordion';
import { checkboxRecipe } from './recipes/checkbox';
import { comboboxRecipe } from './recipes/combobox';
import { fieldRecipe } from './recipes/field';
import { menuRecipe } from './recipes/menu';
import { nativeSelectRecipe } from './recipes/native-select';
import { radioCardRecipe } from './recipes/radio-card';
import { radioGroupRecipe } from './recipes/radio-group';
import { segmentGroupRecipe } from './recipes/segment-group';
import { selectRecipe } from './recipes/select';
import { tagRecipe } from './recipes/tag';
import { tagsInputRecipe } from './recipes/tags-input';
import { blockquoteSlotRecipe } from './recipes/blocquoteSlot';
import { listSlotRecipe } from './recipes/list';

export const slotRecipes = {
  accordion: accordionRecipe,
  checkbox: checkboxRecipe,
  combobox: comboboxRecipe,
  field: fieldRecipe,
  menu: menuRecipe,
  nativeSelect: nativeSelectRecipe,
  radioCard: radioCardRecipe,
  radioGroup: radioGroupRecipe,
  segmentGroup: segmentGroupRecipe,
  select: selectRecipe,
  tag: tagRecipe,
  tagsInput: tagsInputRecipe,
  list: listSlotRecipe,
  blockquote: blockquoteSlotRecipe,
};
