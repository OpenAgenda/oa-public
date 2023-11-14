import { useContext, useState, useEffect } from 'react';
import { validateLocalData } from '@openagenda/registrations/passCulture/iso/validate';

import ComponentsContext from '../components/Context';
import PriceCategories from './PriceCategories';
import Dates from './Dates';
import {
  addPriceCategory,
  removePriceCategory,
  changePriceCategory,
  removeDate,
  changeDate,
} from './utils';

export default function Form({
  value: initialValue,
  settings,
  timings,
  onSubmit,
  onClear,
}) {
  const [isLoadingPassData, setIsLoadingPassData] = useState(true);
  const [passData, setPassData] = useState(null);
  const [value, setValue] = useState(initialValue ?? {});
  const [openSubForm, setOpenSubForm] = useState();

  const {
    Section,
    Spinner,
    Select,
    Button,
  } = useContext(ComponentsContext);

  useEffect(() => {
    fetch(settings.res.settings)
      .then(r => r.json())
      .then(data => {
        setPassData(data);
        setIsLoadingPassData(false);
      });
  }, []);

  if (isLoadingPassData) {
    return (
      <Spinner />
    );
  }

  const {
    categories,
    related,
    offererVenues,
  } = passData;

  const relatedCategory = (
    categories.find(c => c.value === value.category)?.related ?? []
  )[0];
  const relatedCategoryOptions = relatedCategory ? related.find(r => r.schema === relatedCategory).options : [];

  return (
    <form>
      <Section>
        <Select
          disabled={openSubForm}
          label="Lieu"
          value={value?.venueId}
          placeholder="Sélectionner un lieu"
          options={offererVenues.reduce((carry, item) => carry.concat(item.venues), []).map(v => ({
            value: v.id,
            label: `${v.publicName} - ${v.location.address}, ${v.location.postalCode} ${v.location.city}`,
          }))}
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
          placeholder="Sélectionner une catégorie"
          options={categories}
          onChange={option => setValue({
            ...value,
            category: option.value,
          })}
        />
        {relatedCategoryOptions.length ? (
          <Select
            disabled={openSubForm}
            label="Sous-catégorie"
            value={value.subCategory}
            placeholder="Sous-catégorie"
            options={relatedCategoryOptions}
            onChange={option => setValue({
              ...value,
              subCategory: option.value,
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
