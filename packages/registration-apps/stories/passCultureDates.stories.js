import { useState, useMemo } from 'react';

import BootstrapComponentsProvider from '../src/components/bootstrap/Provider.js';

import PassDates from '../src/passCulture/Dates/index.js';

import { changeDate, removeDate, getNextId } from '../src/passCulture/utils.js';

import event from './fixtures/event.json' with { type: 'json' };

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'PassCulture/Form Dates',
  decorators: [
    (Story) => (
      <BootstrapComponentsProvider>
        <Story />
      </BootstrapComponentsProvider>
    ),
  ],
};

export const Empty = () => (
  <>
    <p>
      User is informed that no dates are defined, add date button is disabled,
      message indicates that
    </p>
    <PassDates timings={event.timings} />
  </>
);

export const EmptyWithOnePriceCategoriesAndOneTiming = () => (
  <>
    <p>Date and price are preselected</p>
    <PassDates
      onSubFormToggle={(s) => console.log(s)}
      timings={event.timings.slice(0, 1)}
      value={{
        priceCategories: [
          {
            id: 0,
            price: 15,
            label: 'Tarif normal',
          },
        ],
      }}
    />
  </>
);

export const EmptyWithPriceCategories = () => (
  <>
    <p>User is informed that no dates are defined, add button is enabled</p>
    <PassDates
      onSubFormToggle={(s) => console.log(s)}
      timings={event.timings}
      value={{
        priceCategories: [
          {
            id: 0,
            price: 15,
            label: 'Tarif normal',
          },
        ],
      }}
    />
  </>
);

export const EmptyWithOpenForm = () => {
  const [value, setValue] = useState({
    priceCategories: [
      {
        id: 0,
        price: 15,
        label: 'Tarif normal',
      },
    ],
  });
  const nextId = useMemo(() => getNextId(value), [value]);

  return (
    <>
      <p>Technical state to avoid having to open form at every reload</p>
      <PassDates
        onSubFormToggle={(s) => console.log(s)}
        timings={event.timings}
        initWithOpenForm
        value={value}
        onAdd={(date) =>
          setValue({
            ...value,
            dates: (value.dates ?? []).concat({ id: nextId, ...date }),
          })}
      />
    </>
  );
};

export const WithDates = () => {
  const [value, setValue] = useState({
    priceCategories: [
      {
        id: 0,
        price: 15,
        label: 'Tarif normal',
      },
    ],
    dates: [
      {
        id: 1,
        timingId: 1696078800000,
        priceCategoryId: 0,
        quantity: 15,
        passId: 345554,
      },
      {
        id: 2,
        timingId: 1696078800000,
        priceCategoryId: 0,
        quantity: 20,
      },
    ],
  });
  const nextId = useMemo(() => getNextId(value), [value]);
  console.log('value', value);
  console.log('nextId', nextId);
  return (
    <PassDates
      onSubFormToggle={(s) => console.log(s)}
      timings={event.timings}
      value={value}
      onAdd={(date) =>
        setValue({
          ...value,
          dates: (value.dates ?? []).concat({ id: nextId, ...date }),
        })}
      onRemove={(date) => setValue(removeDate(value, date))}
      onChange={(date) => {
        console.log('Here', changeDate(value, date));
        setValue(changeDate(value, date));
      }}
    />
  );
};

export const WithInvalidDates = () => {
  const [value, setValue] = useState({
    priceCategories: [
      {
        id: 0,
        price: 15,
        label: 'Tarif normal',
      },
    ],
    dates: [
      {
        id: 1,
        timingId: 1696078800000,
        priceCategoryId: 0,
        quantity: 15,
      },
      {
        id: 2,
        timingId: 1697381200000,
        priceCategoryId: 0,
        quantity: 20,
      },
    ],
  });

  return (
    <PassDates
      onSubFormToggle={(s) => console.log(s)}
      timings={event.timings}
      value={value}
      onAdd={(date) =>
        setValue({
          ...value,
          dates: (value.dates ?? []).concat(date),
        })}
      onRemove={(date) => setValue(removeDate(value, date))}
      onChange={(index, date) => setValue(changeDate(value, index, date))}
    />
  );
};
