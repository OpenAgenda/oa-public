/* {
  timingId: 1699801200000,
  priceCategoryIndex: 0,
  quantity: 3,
} */

import { useContext } from 'react';

import ComponentsContext from '../../components/Context';

import { getTimingLabel } from '../utils';

export default function DateForm({
  value,
  onChange,
  isValid,
  onSubmit,
  onCancel,
  priceCategories,
  timings,
  submitLabel = 'Ajouter',
}) {
  const {
    Select,
    Input,
    Form,
    Button,
  } = useContext(ComponentsContext);

  return (
    <Form type="inline">
      <Select
        id="date-timing"
        label="Plage horaire"
        value={value.timingId}
        options={timings.map(t => ({
          value: new Date(t.begin).getTime(),
          label: `${getTimingLabel(t)} `,
        }))}
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
    </Form>
  );
}
