import { useContext, useState, useEffect } from 'react';

import ComponentsContext from '../components/Context';
import PriceCategories from './PriceCategories';
import Dates from './Dates';
import {
  loadData,
  addPriceCategory,
  removePriceCategory,
  changePriceCategory,
  removeDate,
  changeDate,
  isValid,
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

  const {
    Spinner,
    Select,
    Button,
  } = useContext(ComponentsContext);

  useEffect(() => {
    loadData(settings).then(data => {
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
  } = passData;

  const relatedCategory = (
    categories.find(c => c.value === value.category)?.related ?? []
  )[0];
  const relatedCategoryOptions = relatedCategory ? related.find(r => r.schema === relatedCategory).options : [];

  return (
    <form>
      <Select
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
      <PriceCategories
        value={value}
        onAdd={pc => setValue(addPriceCategory(value, pc))}
        onRemove={pc => setValue(removePriceCategory(value, pc))}
        onChange={(index, pc) => {
          setValue(changePriceCategory(value, index, pc));
        }}
      />
      <Dates
        value={value}
        onAdd={d => setValue({
          ...value,
          dates: (value.dates ?? []).concat(d),
        })}
        onRemove={d => setValue(removeDate(value, d))}
        onChange={(i, d) => setValue(changeDate(value, i, d))}
        timings={timings}
      />
      <Button
        disabled={!isValid(value)}
        shape="primary"
        label="Enregistrer"
        onClick={() => onSubmit(value)}
      />

      <Button
        shape="link-danger"
        label="Tout supprimer"
        onClick={onClear}
      />
    </form>
  );
}
