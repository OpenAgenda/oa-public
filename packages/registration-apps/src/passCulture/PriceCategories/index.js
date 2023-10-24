import { useContext, useState } from 'react';

import ComponentsContext from '../../components/Context';

import { isPriceCategoryValid } from '../utils';

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
          onChange={v => setNewItem(v)}
          isValid={isPriceCategoryValid(newItem)}
          onCancel={() => setNewItem(false)}
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
