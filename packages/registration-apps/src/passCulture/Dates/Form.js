import { useContext, useEffect } from 'react';

import ComponentsContext from '../../components/Context';

import { getTimingLabel, getTime } from '../utils';

export default function DateForm({
  value,
  onChange,
  isValid,
  onSubmit,
  onCancel,
  priceCategories,
  timings,
  submitLabel = 'Ajouter',
  mode = 'add',
}) {
  const {
    Select,
    Input,
    Button,
    EmbeddedForm,
  } = useContext(ComponentsContext);

  const timingOptions = timings.map(t => ({
    value: getTime(t.begin),
    label: `${getTimingLabel(t)} `,
  }));

  const priceCategoriesOptions = priceCategories.map(({ label, id }) => ({
    value: id,
    label,
  }));

  useEffect(() => {
    const initialValue = {};
    if (timingOptions.length === 1) {
      initialValue.timingId = timingOptions[0].value;
    }
    if (priceCategoriesOptions.length === 1) {
      initialValue.priceCategoryId = priceCategoriesOptions[0].value;
    }
    if (Object.keys(initialValue).length) {
      onChange({ ...value, ...initialValue });
    }
  }, []);

  return (
    <EmbeddedForm title={mode === 'edit' ? 'Modification de date' : 'Nouvelle date'}>
      <Select
        id="date-timing"
        label="Plage horaire"
        value={value.timingId}
        options={timingOptions}
        onChange={o => onChange({ ...value, timingId: o.value })}
      />
      <Select
        id="date-price-category"
        label="Catégorie de prix"
        value={value?.priceCategoryId}
        options={priceCategoriesOptions}
        onChange={o => onChange({ ...value, priceCategoryId: o.value })}
      />
      <Input
        id="date-quantity"
        value={value.quantity}
        label="Quantité"
        type="number"
        min="0"
        onChange={e => onChange({ ...value, quantity: e.target.value })}
      />
      <Button
        type="submit"
        disabled={!isValid}
        shape="primary"
        onClick={e => {
          e.preventDefault();
          onSubmit();
        }}
        label={submitLabel}
      />
      <Button
        onClick={onCancel}
        label="Annuler"
      />
    </EmbeddedForm>
  );
}
