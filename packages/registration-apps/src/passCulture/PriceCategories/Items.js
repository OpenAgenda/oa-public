import { useState, useContext } from 'react';
import slug from 'slugify';

import ComponentsContext from '../../components/Context';
import { isPriceCategoryValid } from '../utils';
import PriceCategoryForm from './Form';

export default function PriceCategoryItems({
  value = [],
  onRemove,
  onChange,
  onToggleEditing,
  disabled = false,
}) {
  const {
    Button,
    ListItemPart,
  } = useContext(ComponentsContext);

  const [editValue, setEditValue] = useState(false);
  const [editedItemIndex, setEditedItemIndex] = useState(-1);

  if (!value.length) {
    return (
      <div>
        Aucun tarif n&apos;a encore été enregistré
      </div>
    );
  }
  return (
    <ul className="margin-v-z list-unstyled">
      {value.map(({ label, price }, index) => (
        <li key={slug(`${label} ${price}`, { lower: true, strict: true })}>
          {editedItemIndex === index ? (
            <PriceCategoryForm
              value={editValue}
              onChange={v => setEditValue(v)}
              isValid={isPriceCategoryValid(editValue)}
              onCancel={() => {
                setEditedItemIndex(-1);
                onToggleEditing(false);
              }}
              onSubmit={() => {
                onChange(editedItemIndex, editValue);
                setEditedItemIndex(-1);
                onToggleEditing(false);
              }}
              submitLabel="Modifier"
            />
          ) : (
            <>
              <ListItemPart>{label}</ListItemPart>
              <ListItemPart>{price} €</ListItemPart>
              <Button
                type="submit"
                disabled={disabled || editedItemIndex !== -1}
                shape="link"
                onClick={() => {
                  setEditedItemIndex(index);
                  setEditValue({ label, price });
                  onToggleEditing(true);
                }}
                label="Modifier"
              />
              <Button
                disabled={disabled || editValue}
                shape="danger-link"
                onClick={() => onRemove({ label, price })}
                label="Supprimer"
              />
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
