import { useContext, useState } from 'react';
import { validatePriceCategory } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../../components/Context.js';

import PriceCategoryForm from './Form.js';
import PriceCategoryItems from './Items.js';

export default function PriceCategories({
  userRole,
  initWithOpenForm = false,
  value = [],
  onSubFormToggle,
  onAdd,
  onRemove,
  onChange,
  disabled = false,
  error = false,
}) {
  const { Button } = useContext(ComponentsContext);

  const [newItem, setNewItem] = useState(initWithOpenForm);
  const [editing, setEditing] = useState(false);

  return (
    <>
      <span className={`${error && error.length ? 'text-danger' : ''}`}>
        <b>Tarifs</b> (Champ obligatoire)
      </span>
      <PriceCategoryItems
        userRole={userRole}
        value={value.priceCategories}
        onRemove={onRemove}
        disabled={newItem || disabled}
        onToggleEditing={(edit) => {
          setEditing(edit);
          onSubFormToggle(edit);
        }}
        onChange={onChange}
      />
      {error
        && error.length > 0
        && error.map((e) => (
          <div key={e.code} className="text-danger">
            {e.label}
          </div>
        ))}
      {newItem ? (
        <PriceCategoryForm
          userRole={userRole}
          value={newItem}
          onChange={(v) => {
            setNewItem(v);
            onSubFormToggle(false);
          }}
          isValid={validatePriceCategory(
            { ...newItem, price: newItem.price * 100 },
            { boolMode: true },
          )}
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
