import { useState } from 'react';

import BootstrapComponentsProvider from '../src/components/bootstrap/Provider';

import PassPriceCategories from '../src/passCulture/PriceCategories';
import {
  addPriceCategory,
  removePriceCategory,
  changePriceCategory,
} from '../src/passCulture/utils';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'PassCulture/Form PriceCategories',
  decorators: [Story => (
    <BootstrapComponentsProvider><Story /></BootstrapComponentsProvider>
  )],
};

export const Empty = () => {
  const [value, setValue] = useState({});
  return (
    <PassPriceCategories
      value={value ?? []}
      onAdd={pc => setValue(addPriceCategory(value, pc))}
      onRemove={pc => setValue(removePriceCategory(value, pc))}
      onChange={(index, pc) => setValue(changePriceCategory(value, index, pc))}
    />
  );
};

export const EmptyEditMode = () => {
  const [value, setValue] = useState({});
  return (
    <PassPriceCategories
      initWithOpenForm
      value={value ?? []}
      onAdd={pc => setValue(addPriceCategory(value, pc))}
      onRemove={pc => setValue(removePriceCategory(value, pc))}
      onChange={(index, pc) => setValue(changePriceCategory(value, index, pc))}
    />
  );
};

export const WithPriceCategoryItems = () => {
  const [value, setValue] = useState({
    priceCategories: [{
      label: 'Tarif normal',
      price: '12',
    }, {
      label: 'Tarif réduit',
      price: '5',
    }],
  });

  return (
    <PassPriceCategories
      value={value}
      onAdd={pc => setValue(addPriceCategory(value, pc))}
      onRemove={pc => setValue(removePriceCategory(value, pc))}
      onChange={(index, pc) => setValue(changePriceCategory(value, index, pc))}
    />
  );
};
