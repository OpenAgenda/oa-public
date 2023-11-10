import { useContext, useState } from 'react';
import { validateDate } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../../components/Context';

import DateForm from './Form';
import DateItems from './Items';

export default function Dates({
  initWithOpenForm = false,
  value = {},
  onAdd,
  timings,
  onChange,
  onRemove,
  onSubFormToggle,
  disabled = false,
}) {
  const {
    Button,
  } = useContext(ComponentsContext);

  const [newItem, setNewItem] = useState(initWithOpenForm);
  const [editing, setEditing] = useState(false);

  return (
    <>
      <b>Dates</b>
      <DateItems
        value={value.dates ?? []}
        priceCategories={value.priceCategories ?? []}
        timings={timings}
        disabled={newItem || disabled}
        onToggleEditing={edit => {
          setEditing(edit);
          onSubFormToggle(edit);
        }}
        onChange={onChange}
        onRemove={onRemove}
      />
      {newItem ? (
        <DateForm
          value={newItem}
          priceCategories={value.priceCategories ?? []}
          onChange={v => {
            setNewItem(v);
            onSubFormToggle(false);
          }}
          onCancel={() => {
            setNewItem(false);
            onSubFormToggle(false);
          }}
          onSubmit={() => {
            onAdd(newItem);
            setNewItem(false);
          }}
          timings={timings}
          isValid={validateDate(newItem, {
            priceCategories: value.priceCategories,
            timings,
            boolMode: true,
          })}
        />
      ) : (
        <Button
          onClick={() => {
            setNewItem({});
            onSubFormToggle(true);
          }}
          disabled={editing || !(value.priceCategories ?? []).length || disabled}
          shape="unpadded-link"
          label="Ajouter une date"
        />
      )}
    </>
  );
}
