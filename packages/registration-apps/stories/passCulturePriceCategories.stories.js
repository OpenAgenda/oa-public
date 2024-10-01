import { useState, useMemo } from 'react';

import BootstrapComponentsProvider from '../src/components/bootstrap/Provider';

import PassPriceCategories from '../src/passCulture/PriceCategories';
import {
  addPriceCategory,
  removePriceCategory,
  changePriceCategory,
  getNextId,
} from '../src/passCulture/utils';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'PassCulture/Form PriceCategories',
  decorators: [
    (Story) => (
      <BootstrapComponentsProvider>
        <Story />
      </BootstrapComponentsProvider>
    ),
  ],
};

export const Empty = () => {
  const [value, setValue] = useState({});
  const nextId = useMemo(() => getNextId(value), [value]);
  return (
    <>
      <p>
        First price category is labelled directly `Tarif unique` and priced at
        0.
      </p>
      <PassPriceCategories
        value={value ?? []}
        onAdd={(pc) => setValue(addPriceCategory(value, nextId, pc))}
        onRemove={(pc) => setValue(removePriceCategory(value, pc))}
        onChange={(pc) => setValue(changePriceCategory(value, pc))}
        onSubFormToggle={() => {}}
      />
    </>
  );
};

export const EmptyEditMode = () => {
  const [value, setValue] = useState({});
  const nextId = useMemo(() => getNextId(value), [value]);
  return (
    <PassPriceCategories
      initWithOpenForm
      value={value ?? []}
      onAdd={(pc) => setValue(addPriceCategory(value, nextId, pc))}
      onRemove={(pc) => setValue(removePriceCategory(value, pc))}
      onChange={(pc) => setValue(changePriceCategory(value, pc))}
      onSubFormToggle={() => {}}
    />
  );
};

export const WithPriceCategoryItems = () => {
  const [value, setValue] = useState({
    priceCategories: [
      {
        id: 0,
        label: 'Tarif normal',
        price: '12',
      },
      {
        id: 1,
        label: 'Tarif réduit',
        price: '5',
      },
    ],
  });
  const nextId = useMemo(() => getNextId(value), [value]);
  return (
    <PassPriceCategories
      value={value}
      onAdd={(pc) => setValue(addPriceCategory(value, nextId, pc))}
      onRemove={(pc) => setValue(removePriceCategory(value, pc))}
      onChange={(pc) => setValue(changePriceCategory(value, pc))}
      onSubFormToggle={() => {}}
    />
  );
};

export const WithPriceCategoryItemsSaved = () => {
  const [value, setValue] = useState({
    priceCategories: [
      {
        id: 0,
        label: 'Tarif normal',
        price: '12',
        passId: 193847834,
      },
      {
        id: 1,
        label: 'Tarif réduit',
        price: '5',
        passId: 193847835,
      },
    ],
  });
  const nextId = useMemo(() => getNextId(value), [value]);
  return (
    <PassPriceCategories
      value={value}
      onAdd={(pc) => setValue(addPriceCategory(value, nextId, pc))}
      onRemove={(pc) => setValue(removePriceCategory(value, pc))}
      onChange={(pc) => setValue(changePriceCategory(value, pc))}
      onSubFormToggle={() => {}}
    />
  );
};
