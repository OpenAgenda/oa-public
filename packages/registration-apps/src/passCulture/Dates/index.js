import { useContext, useState } from 'react';

import ComponentsContext from '../../components/Context';

import { isDateValid } from '../utils';

import DateForm from './Form';
import DateItems from './Items';

export default function Dates({
  initWithOpenForm = false,
  value = {},
  onAdd,
  timings,
  onChange,
  onRemove,
}) {
  const {
    Button,
  } = useContext(ComponentsContext);

  const [newItem, setNewItem] = useState(initWithOpenForm);
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <b>Dates</b>
      <DateItems
        value={value.dates ?? []}
        priceCategories={value.priceCategories ?? []}
        timings={timings}
        disabled={newItem}
        onToggleEditing={setEditing}
        onChange={onChange}
        onRemove={onRemove}
      />
      {newItem ? (
        <DateForm
          value={newItem}
          priceCategories={value.priceCategories ?? []}
          onChange={v => setNewItem(v)}
          onCancel={() => setNewItem(false)}
          onSubmit={() => {
            onAdd(newItem);
            setNewItem(false);
          }}
          timings={timings}
          isValid={isDateValid(newItem, value.priceCategories)}
        />
      ) : (
        <Button
          onClick={() => setNewItem({})}
          disabled={editing || !(value.priceCategories ?? []).length}
          shape="unpadded-link"
          label="Ajouter une date"
        />
      )}
    </div>
  );
}
