import { useContext } from 'react';

import ComponentsContext from '../../components/Context.js';

export default function PriceCategoryForm({
  userRole,
  value,
  onChange,
  isValid,
  onSubmit,
  onCancel,
  mode = 'add',
  submitLabel = 'Ajouter',
}) {
  const { Input, Button, EmbeddedForm } = useContext(ComponentsContext);

  return (
    <EmbeddedForm
      title={mode === 'edit' ? 'Modification de tarif' : 'Nouveau tarif'}
    >
      <Input
        id="price-category-label"
        value={value.label ?? ''}
        type="text"
        label="Label"
        placeholder="Ex: carré or, tarif adulte..."
        max="50"
        onChange={(e) => onChange({ ...value, label: e.target.value })}
      />
      <Input
        id="price-category-price"
        value={value.price ?? '0'}
        type="number"
        label="Prix"
        placeholder="Ex: 12.5"
        step="0.01"
        max="30"
        min="0"
        onChange={(e) => onChange({ ...value, price: e.target.value })}
        disabled={userRole === 'contributor'}
      />
      <Button
        type="submit"
        disabled={!isValid}
        shape="primary"
        onClick={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        label={submitLabel}
      />
      <Button type="button" onClick={onCancel} label="Annuler" />
    </EmbeddedForm>
  );
}
