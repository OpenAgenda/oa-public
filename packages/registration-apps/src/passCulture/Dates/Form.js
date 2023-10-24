import { useContext } from 'react';

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
    Form,
    Button,
    EmbeddedForm,
  } = useContext(ComponentsContext);

  const timingOptions = timings.map(t => ({
    value: getTime(t.begin),
    label: `${getTimingLabel(t)} `,
  }));

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
        value={value?.priceCategoryIndex}
        options={priceCategories.map(({ label }, index) => ({
          value: index,
          label,
        }))}
        onChange={o => onChange({ ...value, priceCategoryIndex: o.value })}
      />
      <Input
        id="date-quantity"
        value={value.quantity}
        label="Quantité"
        type="number"
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
