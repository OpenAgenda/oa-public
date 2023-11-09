import { useState, useContext, useMemo } from 'react';

import ComponentsContext from '../../components/Context';
import { findTimingLabel, isDateValid, decorateDates } from '../utils';
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
    Badge,
    Button,
    List,
    ListItem,
    ListItemPart,
    ListItemLine,
    MoreInfo,
  } = useContext(ComponentsContext);

  const decoratedDates = useMemo(() => decorateDates(value, timings), [value, timings]);

  if (!value.length) {
    return <div>Aucune date n&apos;est encore définie. {priceCategories.length ? 'Ajoutez une date en cliquant sur le lien ci-dessous' : 'Commencez par définir des catégories de prix'}</div>;
  }

  return (
    <List>
      {decoratedDates.map(({ timingId, priceCategoryIndex, quantity, timingLabel, hasMatchingTiming }, index) => (
        <ListItem key={`${timingId}-${priceCategoryIndex}`}>
          {editedItemIndex === index ? (
            <DateForm
              value={editValue}
              onChange={v => setEditValue(v)}
              isValid={isDateValid(editValue, priceCategories, timings)}
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
              <ListItemLine>
                {hasMatchingTiming ? (
                  <ListItemPart>{timingLabel}</ListItemPart>
                ) : (
                  <ListItemPart><Badge type="danger">Date invalide</Badge></ListItemPart>
                )}
                <ListItemPart>{priceCategories[priceCategoryIndex].label}</ListItemPart>
                <ListItemPart>{quantity} places</ListItemPart>
                {hasMatchingTiming ? null : (
                  <ListItemPart>
                    <MoreInfo
                      id="dateMismatch"
                      title="Date non valide"
                      content="L'horaire associé à cette date a été déplacé ou supprimé. Toute date doit correspondre à un horaire saisi sur le champ horaire du formulaire."
                    />
                  </ListItemPart>
                )}
              </ListItemLine>
              <ListItemLine>
                <ListItemPart>
                  <Button
                    unmargined
                    unpadded
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
                </ListItemPart>
                <ListItemPart>
                  <Button
                    unmargined
                    unpadded
                    type="button"
                    disabled={disabled || editValue}
                    label="Supprimer"
                    shape="danger-link"
                    onClick={() => onRemove({ timingId, priceCategoryIndex, quantity })}
                  />
                </ListItemPart>
              </ListItemLine>
            </>
          )}
        </ListItem>
      ))}
    </List>
  );
}
