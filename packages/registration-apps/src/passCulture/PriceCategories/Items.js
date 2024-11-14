import { useState, useContext } from 'react';
import slug from 'slugify';
import { validatePriceCategory } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../../components/Context.js';
import PriceCategoryForm from './Form.js';

export default function PriceCategoryItems({
  value = [],
  onRemove,
  onChange,
  onToggleEditing,
  disabled = false,
}) {
  const { Button, ListItem, ListItemPart, List } = useContext(ComponentsContext);

  const [editValue, setEditValue] = useState(false);
  const [editedItemId, setEditedItemId] = useState(-1);

  if (!value.length) {
    return <div>Aucun tarif n&apos;a encore été enregistré</div>;
  }
  return (
    <List>
      {value.map(({ label, price, id, passId }) => (
        <ListItem
          key={slug(`${label} ${price}`, { lower: true, strict: true })}
        >
          {editedItemId === id ? (
            <PriceCategoryForm
              mode="edit"
              value={editValue}
              onChange={(v) => setEditValue({ passId, ...v })}
              isValid={validatePriceCategory(
                { ...editValue, price: editValue.price * 100 },
                { boolMode: true },
              )}
              onCancel={() => {
                setEditedItemId(-1);
                setEditValue(false);
                onToggleEditing(false);
              }}
              onSubmit={() => {
                onChange(editValue);
                setEditedItemId(-1);
                setEditValue(false);
                onToggleEditing(false);
              }}
              submitLabel="Modifier"
            />
          ) : (
            <>
              <ListItemPart>{label}</ListItemPart>
              <ListItemPart>{price / 100} €</ListItemPart>
              <ListItemPart>
                <Button
                  unmargined
                  unpadded
                  type="submit"
                  disabled={disabled || editedItemId !== -1}
                  shape="link"
                  onClick={() => {
                    setEditedItemId(id);
                    setEditValue({ label, price: price / 100, id });
                    onToggleEditing(true);
                  }}
                  label="Modifier"
                />
              </ListItemPart>
              <ListItemPart>
                <Button
                  unmargined
                  unpadded
                  disabled={passId !== undefined ? true : disabled || editValue}
                  shape="danger-link"
                  onClick={() => onRemove({ label, price, id })}
                  label="Supprimer"
                />
              </ListItemPart>
            </>
          )}
        </ListItem>
      ))}
    </List>
  );
}
