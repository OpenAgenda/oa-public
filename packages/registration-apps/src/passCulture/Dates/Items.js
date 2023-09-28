import { useState, useContext } from 'react';

import ComponentsContext from '../../components/Context';
import { findTimingLabel, isDateValid } from '../utils';
import DateForm from './Form';

export default function DateItems({
  value,
  priceCategories,
  timings,
  onToggleEditing,
  onRemove,
  onChange,
  disabled = false,
}) {
  const [editValue, setEditValue] = useState(false);
  const [editedItemIndex, setEditedItemIndex] = useState(-1);

  const {
    Button,
    ListItemPart,
  } = useContext(ComponentsContext);

  if (!value.length) {
    return <div>Aucune date n&apos;est encore définie. {priceCategories.length ? 'Ajoutez une date en cliquant sur le lien ci-dessous' : 'Commencez par définir des catégories de prix'}</div>;
  }

  return (
    <ul className="margin-v-z list-unstyled">
      {value.map(({ timingId, priceCategoryIndex, quantity }, index) => (
        <li key={`${timingId}-${priceCategoryIndex}`}>
          {editedItemIndex === index ? (
            <DateForm
              value={editValue}
              onChange={v => setEditValue(v)}
              isValid={isDateValid({
                value: editValue,
                timings,
                index,
              })}
              submitLabel="Modifier"
              timings={timings}
              priceCategories={priceCategories ?? []}
              onCancel={() => {
                setEditedItemIndex(-1);
                onToggleEditing(false);
                setEditValue(false);
              }}
              onSubmit={() => {
                onChange(editedItemIndex, editValue);
                setEditedItemIndex(-1);
                onToggleEditing(false);
                setEditValue(false);
              }}
            />
          ) : (
            <>
              <ListItemPart>{findTimingLabel(timings, timingId)}</ListItemPart>
              <ListItemPart>{priceCategories[priceCategoryIndex].label}</ListItemPart>
              <ListItemPart>{quantity} places</ListItemPart>
              <Button
                type="button"
                disabled={disabled || editedItemIndex !== -1}
                shape="link"
                onClick={() => {
                  setEditedItemIndex(index);
                  setEditValue({ timingId, priceCategoryIndex, quantity });
                  onToggleEditing(true);
                }}
                label="Modifier"
              />
              <Button
                type="button"
                disabled={disabled || editValue}
                label="Supprimer"
                shape="danger-link"
                onClick={() => onRemove({ timingId, priceCategoryIndex, quantity })}
              />
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
