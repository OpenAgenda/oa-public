import { useContext, useState, useMemo, useEffect } from 'react';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../components/Context';
import PriceCategories from './PriceCategories';
import Dates from './Dates';
import Description from './Description';
import BookingEmail from './BookingEmail';
import {
  addPriceCategory,
  removePriceCategory,
  changePriceCategory,
  removeDate,
  changeDate,
  getRelatedFieldName,
  getRelatedFieldOptions,
} from './utils';

const hasPriceCategories = value => !!(value?.priceCategories ?? []).length;

export default function Form({
  value: initialValue,
  timings,
  onSubmit,
  onClear,
  categories,
  related,
  offererVenues,
  bookingEmail,
}) {
  const [value, setValue] = useState(initialValue ?? {});
  const [openSubForm, setOpenSubForm] = useState();

  const {
    Section,
    Select,
    Button,
    Input,
  } = useContext(ComponentsContext);

  const relatedCategoryFieldName = useMemo(() => getRelatedFieldName(categories, value.category), [categories, value.category]);
  const relatedCategoryOptions = useMemo(() => (relatedCategoryFieldName ? getRelatedFieldOptions(related, relatedCategoryFieldName) : undefined), [relatedCategoryFieldName, related]);
  const venuesOptions = offererVenues.reduce((carry, item) => carry.concat(item.venues), []).map(v => ({
    value: v.id,
    label: `${v.publicName} - ${v.location.address}, ${v.location.postalCode} ${v.location.city}`,
  }));

  useEffect(() => {
    const defaultsAtInit = {};
    if (venuesOptions.length === 1 && !value.venueId) {
      defaultsAtInit.venueId = venuesOptions[0].value;
    }

    if (!hasPriceCategories(value)) {
      defaultsAtInit.priceCategories = [{
        label: 'Tarif unique',
        price: 0,
      }];
    }

    if (!Object.keys(defaultsAtInit).length) {
      return;
    }

    setValue({ ...value, ...defaultsAtInit });
  }, []);

  return (
    <form>
      <Section>
        <Select
          disabled={openSubForm}
          label="Lieu"
          value={value?.venueId}
          placeholder="Sélectionner un lieu"
          options={venuesOptions}
          onChange={option => setValue({
            ...value,
            venueId: option.value,
          })}
        />
      </Section>
      <Section>
        <Select
          disabled={openSubForm}
          label="Catégorie"
          value={value?.category}
          placeholder="Choix requis"
          options={categories}
          onChange={option => setValue({
            ...value,
            category: option.value,
          })}
        />
        {relatedCategoryFieldName ? (
          <Select
            disabled={openSubForm}
            label={relatedCategoryFieldName === 'musicType' ? 'Type de musique' : 'Type de spectacle'}
            value={value[relatedCategoryFieldName]}
            placeholder="Choix requis"
            options={relatedCategoryOptions}
            onChange={option => setValue({
              ...value,
              [relatedCategoryFieldName]: option.value,
            })}
          />
        ) : null}
      </Section>
      <Section>
        <PriceCategories
          disabled={openSubForm && openSubForm !== 'priceCategories'}
          value={value}
          onAdd={pc => {
            setValue(addPriceCategory(value, pc));
            setOpenSubForm(false);
          }}
          onRemove={pc => setValue(removePriceCategory(value, pc))}
          onSubFormToggle={open => setOpenSubForm(open ? 'priceCategories' : false)}
          onChange={(index, pc) => {
            setValue(changePriceCategory(value, index, pc));
            setOpenSubForm(false);
          }}
        />
      </Section>
      <Section>
        <Dates
          disabled={openSubForm && openSubForm !== 'dates'}
          value={value}
          onAdd={d => {
            setValue({
              ...value,
              dates: (value.dates ?? []).concat(d),
            });
            setOpenSubForm(false);
          }}
          onRemove={d => setValue(removeDate(value, d))}
          onChange={(i, d) => {
            setValue(changeDate(value, i, d));
            setOpenSubForm(false);
          }}
          onSubFormToggle={open => setOpenSubForm(open ? 'dates' : false)}
          timings={timings}
        />
      </Section>
      <Section>
        <Description value={value} onChange={v => setValue({ ...value, description: v })} />
      </Section>
      <Section>
        <Input
          id="booking-contact"
          value={value.bookingContact}
          label="Email de contact"
          type="email"
          onChange={e => setValue({ ...value, bookingContact: e.target.value })}
          sub="Cette adresse email sera communiquée aux bénéficiaires ayant réservé votre offre."
        />
      </Section>
      <Section>
        <BookingEmail value={value} onChange={v => setValue({ ...value, bookingEmail: v })} settingsBookingEmail={bookingEmail} />
      </Section>
      <Section>
        <Button
          disabled={!validateLocalData(value, { timings }, { boolMode: true, categories, related }) || openSubForm}
          shape="primary"
          label="Enregistrer"
          onClick={() => onSubmit(value)}
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
