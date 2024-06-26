import { useContext, useState, useMemo, useEffect } from 'react';
import { distance } from 'fastest-levenshtein';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';
import { getCurrentValue } from '@openagenda/registrations/passCulture/iso/utils';

import ComponentsContext from '../components/Context';
import PriceCategories from './PriceCategories';
import Dates from './Dates';
import Description from './Description';
import Name from './Name';
import Duration from './Duration';
import BookingEmail from './BookingEmail';
import {
  addPriceCategory,
  removePriceCategory,
  changePriceCategory,
  removeDate,
  changeDate,
  getRelatedFieldName,
  getRelatedFieldOptions,
  getNextId,
} from './utils';

const hasPriceCategories = value => !!(value?.priceCategories ?? []).length;

const checkForLocationMatch = (oaLocation, venues) => {
  const resp = venues.reduce((carry, item) => {
    const levenshteinPercent = (distance(oaLocation.name, item.publicName) * 100) / Math.max(oaLocation.name.length, item.publicName.length);
    if (levenshteinPercent < 0.8) {
      if (!carry || carry.levenshteinPercent < levenshteinPercent) {
        return {
          id: item.id,
          levenshteinPercent,
        };
      }
    }
    return carry;
  }, null);
  return resp?.id || null;
};

export default function Form({
  value: initialValue,
  timings,
  onSubmit,
  onClear,
  categories,
  related,
  offererVenues,
  bookingEmail,
  oaLocation = null,
  title = null,
  longDesc = null,
  patchMode = false,
}) {
  const [patch, setPatch] = useState(initialValue[initialValue.length - 1]?.editing ? initialValue[initialValue.length - 1] : { editing: true });

  const [openSubForm, setOpenSubForm] = useState();
  const titleWarning = title ? title.length > 90 : false;
  const longDescWarning = longDesc ? longDesc.length > 1000 : false;

  const {
    Section,
    Select,
    Button,
    Input,
    Checkbox,
  } = useContext(ComponentsContext);
  const storedValue = useMemo(() => getCurrentValue(initialValue), [initialValue]);
  const currentValue = useMemo(() => getCurrentValue(initialValue.filter(v => !v.editing).concat(patch)), [initialValue, patch]);
  const nextId = useMemo(() => getNextId(currentValue), [currentValue]);
  const relatedCategoryFieldName = useMemo(() => getRelatedFieldName(categories, currentValue.category), [categories, currentValue.category]);
  const relatedCategoryOptions = useMemo(() => (relatedCategoryFieldName ? getRelatedFieldOptions(related, relatedCategoryFieldName) : undefined), [relatedCategoryFieldName, related]);
  const venuesOptions = offererVenues.reduce((carry, item) => carry.concat(item.venues), []).map(v => ({
    value: v.id,
    label: `${v.publicName} - ${v.location.address}, ${v.location.postalCode} ${v.location.city}`,
  }));

  useEffect(() => {
    const defaultsAtInit = {};
    if (venuesOptions.length === 1 && !initialValue.venueId) {
      defaultsAtInit.venueId = venuesOptions[0].value;
    }

    if (venuesOptions.length > 1 && oaLocation?.name) {
      const match = checkForLocationMatch(oaLocation, offererVenues.reduce((carry, item) => carry.concat(item.venues), []));
      if (match) defaultsAtInit.venueId = match;
    }

    if (!hasPriceCategories(storedValue)) {
      defaultsAtInit.priceCategories = [{
        label: 'Tarif unique',
        price: 0,
        id: nextId,
      }];
    }

    if (storedValue.duo === undefined) {
      defaultsAtInit.duo = true;
    }

    setPatch({ ...patch, ...defaultsAtInit });
  }, []);

  // add eventDuration
  return (
    <form>
      <Section>
        <Select
          disabled={openSubForm || patchMode}
          label="Lieu"
          value={currentValue?.venueId}
          placeholder="Sélectionner un lieu"
          options={venuesOptions}
          onChange={option => setPatch({
            ...patch,
            venueId: option.value,
          })}
        />
      </Section>
      <Section>
        <Select
          disabled={openSubForm}
          label="Catégorie"
          value={currentValue?.category}
          placeholder="Choix requis"
          options={categories}
          onChange={option => setPatch({
            ...patch,
            category: option.value,
          })}
          patchMode={patchMode}
        />
        {relatedCategoryFieldName ? (
          <Select
            disabled={openSubForm}
            label={relatedCategoryFieldName === 'musicType' ? 'Type de musique' : 'Type de spectacle'}
            value={currentValue[relatedCategoryFieldName]}
            placeholder="Choix requis"
            options={relatedCategoryOptions}
            onChange={option => setPatch({
              ...patch,
              [relatedCategoryFieldName]: option.value,
            })}
          />
        ) : null}
      </Section>
      <Section>
        <PriceCategories
          disabled={openSubForm && openSubForm !== 'priceCategories'}
          value={currentValue}
          onAdd={pc => {
            setPatch(addPriceCategory(patch, nextId, pc));
            setOpenSubForm(false);
          }}
          onRemove={pc => setPatch(removePriceCategory(patch, pc))}
          onSubFormToggle={open => setOpenSubForm(open ? 'priceCategories' : false)}
          onChange={pc => {
            setPatch(changePriceCategory(patch, pc, currentValue));
            setOpenSubForm(false);
          }}
        />
      </Section>
      <Section>
        <Dates
          disabled={openSubForm && openSubForm !== 'dates'}
          value={currentValue}
          onAdd={d => {
            setPatch({
              ...patch,
              dates: (patch.dates ?? []).concat({ id: nextId, ...d }),
            });
            setOpenSubForm(false);
          }}
          onRemove={d => setPatch(removeDate(patch, d, currentValue))}
          onChange={d => {
            setPatch(changeDate(patch, d));
            setOpenSubForm(false);
          }}
          onSubFormToggle={open => setOpenSubForm(open ? 'dates' : false)}
          timings={timings}
        />
      </Section>
      <Section>
        <Duration value={currentValue} onChange={v => setPatch({ ...patch, eventDuration: v })} timings={timings} />
      </Section>
      {titleWarning ? (
        <Section>
          <Name value={currentValue} onChange={v => setPatch({ ...patch, name: v })} title={title} />
        </Section>
      ) : null}
      <Section>
        <Description value={currentValue} onChange={v => setPatch({ ...patch, description: v })} longDesc={longDesc} longDescWarning={longDescWarning} />
      </Section>
      <Section>
        <Input
          id="booking-contact"
          value={currentValue.bookingContact}
          label="Email de contact"
          type="email"
          onChange={e => setPatch({ ...patch, bookingContact: e.target.value })}
          sub="Cette adresse email sera communiquée aux bénéficiaires ayant réservé votre offre."
        />
      </Section>
      <Section>
        <BookingEmail value={currentValue} onChange={v => setPatch({ ...patch, bookingEmail: v })} settingsBookingEmail={bookingEmail} />
      </Section>
      <Section>
        <Checkbox
          info="Cette option permet au bénéficiaire de venir accompagné. La seconde place sera délivrée au même tarif que la première, quel que soit l’accompagnateur."
          value={currentValue.duo}
          onChange={() => setPatch({ ...patch, duo: !currentValue.duo })}
          label="Réservations “Duo”"
        />
      </Section>
      <Section>
        <Button
          disabled={!validateLocalData(currentValue, { timings }, { boolMode: true, categories, related }) || openSubForm}
          shape="primary"
          label="Enregistrer"
          onClick={() => onSubmit(initialValue[initialValue.length - 1]?.editing ? initialValue.slice(0, -1).concat(patch) : initialValue.concat(patch))}
        />
        <Button
          shape="link-danger"
          label="Annuler"
          onClick={onClear}
        />
      </Section>
    </form>
  );
}
