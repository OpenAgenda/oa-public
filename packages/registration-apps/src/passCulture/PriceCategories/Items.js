import { useState, useContext } from 'react';
import slug from 'slugify';
import { validatePriceCategory } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../../components/Context';
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
    ListItem,
    ListItemPart,
    List,
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
    <List>
      {value.map(({ label, price }, index) => (
        <ListItem key={slug(`${label} ${price}`, { lower: true, strict: true })}>
          {editedItemIndex === index ? (
            <PriceCategoryForm
              mode="edit"
              value={editValue}
              onChange={v => setEditValue(v)}
              isValid={validatePriceCategory(editValue, { boolMode: true })}
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
              <ListItemPart>
                <Button
                  unmargined
                  unpadded
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
              </ListItemPart>
              <ListItemPart>
                <Button
                  unmargined
                  unpadded
                  disabled={disabled || editValue}
                  shape="danger-link"
                  onClick={() => onRemove({ label, price })}
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
