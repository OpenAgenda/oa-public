import { useContext, useState } from 'react';
import { validatePriceCategory } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../../components/Context';

import PriceCategoryForm from './Form';
import PriceCategoryItems from './Items';

export default function PriceCategories({
  initWithOpenForm = false,
  value = [],
  onSubFormToggle,
  onAdd,
  onRemove,
  onChange,
  disabled = false,
}) {
  const {
    Button,
  } = useContext(ComponentsContext);

  const [newItem, setNewItem] = useState(initWithOpenForm);
  const [editing, setEditing] = useState(false);

  return (
    <>
      <b>Tarifs</b>
      <PriceCategoryItems
        value={value.priceCategories}
        onRemove={onRemove}
        disabled={newItem || disabled}
        onToggleEditing={edit => {
          setEditing(edit);
          onSubFormToggle(edit);
        }}
        onChange={onChange}
      />
      {newItem ? (
        <PriceCategoryForm
          value={newItem}
          onChange={v => {
            setNewItem(v);
            onSubFormToggle(false);
          }}
          isValid={validatePriceCategory({ ...newItem, price: newItem.price * 100 }, { boolMode: true })}
          onCancel={() => {
            setNewItem(false);
            onSubFormToggle(false);
          }}
          onSubmit={() => {
            onAdd(newItem);
            setNewItem(false);
          }}
        />
      ) : (
        <Button
          onClick={() => {
            setNewItem({});
            onSubFormToggle(true);
          }}
          disabled={editing || disabled}
          shape="unpadded-link"
          label="Ajouter un tarif"
        />
      )}
    </>
  );
}
