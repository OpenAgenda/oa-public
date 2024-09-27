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
  const [editedItemId, setEditedItemId] = useState(-1);

  const {
    Badge,
    Button,
    List,
    ListItem,
    ListItemPart,
    ListItemLine,
    MoreInfo,
  } = useContext(ComponentsContext);

  const decoratedDates = useMemo(
    () => decorateDates(value, timings),
    [value, timings],
  );

  if (!value.length) {
    return (
      <div>
        Aucune date n&apos;est encore définie.{' '}
        {priceCategories.length
          ? 'Ajoutez une date en cliquant sur le lien ci-dessous'
          : 'Commencez par définir des catégories de prix'}
      </div>
    );
  }

  return (
    <List>
      {decoratedDates.map(
        ({
          timingId,
          priceCategoryId,
          quantity,
          timingLabel,
          hasMatchingTiming,
          id,
          passId,
          deleted,
        }) => (
          <ListItem key={`${timingId}-${priceCategoryId}-${id}`}>
            {editedItemId === id ? (
              <DateForm
                value={editValue}
                onChange={(v) => setEditValue({ ...v, id })}
                isValid={validateDate(editValue, {
                  priceCategories,
                  timings,
                  boolMode: true,
                })}
                submitLabel="Modifier"
                timings={timings}
                priceCategories={priceCategories ?? []}
                onCancel={() => {
                  setEditedItemId(-1);
                  onToggleEditing(false);
                  setEditValue(false);
                }}
                onSubmit={() => {
                  onChange({ id, ...editValue });
                  setEditedItemId(-1);
                  onToggleEditing(false);
                  setEditValue(false);
                }}
                mode="edit"
              />
            ) : (
              <>
                {deleted ? null : (
                  <>
                    <ListItemLine>
                      {hasMatchingTiming ? (
                        <ListItemPart>{timingLabel}</ListItemPart>
                      ) : (
                        <ListItemPart>
                          <Badge type="danger">Date invalide</Badge>
                        </ListItemPart>
                      )}
                      <ListItemPart>
                        {
                          priceCategories.find(
                            (pc) => pc.id === priceCategoryId,
                          ).label
                        }
                      </ListItemPart>
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
                          disabled={disabled || editedItemId !== -1}
                          shape="link"
                          onClick={() => {
                            setEditedItemId(id);
                            setEditValue({
                              timingId,
                              priceCategoryId,
                              quantity,
                              passId,
                            });
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
        ),
      )}
    </List>
  );
}
