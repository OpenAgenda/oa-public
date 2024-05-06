import { useState, useContext, useMemo } from 'react';
import { validateDate } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../../components/Context';
import { decorateDates } from '../utils';

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
      {decoratedDates.map(({ timingId, priceCategoryId, quantity, timingLabel, hasMatchingTiming, id, passId, deleted }, index) => (
        <ListItem key={`${timingId}-${priceCategoryId}-${id}`}>
          {editedItemIndex === index ? (
            <DateForm
              value={editValue}
              onChange={v => setEditValue(v)}
              isValid={validateDate(editValue, { priceCategories, timings, boolMode: true })}
              submitLabel="Modifier"
              timings={timings}
              priceCategories={priceCategories ?? []}
              onCancel={() => {
                setEditedItemIndex(-1);
                onToggleEditing(false);
                setEditValue(false);
              }}
              onSubmit={() => {
                onChange({ id, ...editValue });
                setEditedItemIndex(-1);
                onToggleEditing(false);
                setEditValue(false);
              }}
            />
          ) : (
            <>
              {deleted ? null : (
                <>
                  <ListItemLine>
                    {hasMatchingTiming ? (
                      <ListItemPart>{timingLabel}</ListItemPart>
                    ) : (
                      <ListItemPart><Badge type="danger">Date invalide</Badge></ListItemPart>
                    )}
                    <ListItemPart>{priceCategories.find(pc => pc.id === priceCategoryId).label}</ListItemPart>
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
                          setEditValue({ timingId, priceCategoryId, quantity });
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
                        onClick={() => onRemove({ id, passId })}
                      />
                    </ListItemPart>
                  </ListItemLine>
                </>
              )}
            </>
          )}
        </ListItem>
      ))}
    </List>
  );
}
