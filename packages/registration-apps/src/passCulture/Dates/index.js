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
  error = false,
}) {
  const { Button } = useContext(ComponentsContext);

  const [newItem, setNewItem] = useState(initWithOpenForm);
  const [editing, setEditing] = useState(false);

  return (
    <>
      <span className={`${error && error.length ? 'text-danger' : ''}`}>
        <b>Dates</b> (Champ obligatoire)
      </span>
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
      {error
        && error.length > 0
        && error.map(e => (
          <div key={e.code} className="text-danger">
            {e.label}
          </div>
        ))}
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
            ignoreId: true,
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
