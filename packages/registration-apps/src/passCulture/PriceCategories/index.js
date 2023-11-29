import { useContext, useState, useEffect } from 'react';
import { validatePriceCategory } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../../components/Context';

import PriceCategoryForm from './Form';
import PriceCategoryItems from './Items';

const hasPriceCategories = value => !!(value?.priceCategories ?? []).length;

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

  useEffect(() => {
    if (hasPriceCategories(value)) {
      return;
    }
    onAdd({
      label: 'Tarif unique',
      price: 0,
    });
  }, []);

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
          isValid={validatePriceCategory(newItem, { boolMode: true })}
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
