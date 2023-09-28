import { useContext } from 'react';

import ComponentsContext from '../../components/Context';

export default function PriceCategoryForm({
  value,
  onChange,
  isValid,
  onSubmit,
  onCancel,
  submitLabel = 'Ajouter',
}) {
  const {
    Input,
    Button,
  } = useContext(ComponentsContext);

  return (
    <form className="form-inline">
      <Input
        id="price-category-label"
        value={value.label ?? ''}
        type="text"
        label="Label"
        placeholder="Ex: carré or, tarif adulte..."
        onChange={e => onChange({ ...value, label: e.target.value })}
      />
      <Input
        id="price-category-price"
        value={value.price ?? ''}
        type="number"
        label="Prix"
        placeholder="Ex: 12"
        onChange={e => onChange({ ...value, price: e.target.value })}
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
        type="button"
        onClick={onCancel}
        label="Annuler"
      />
    </form>
  );
}
