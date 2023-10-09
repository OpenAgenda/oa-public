import { useState } from 'react';

import BootstrapComponentsProvider from '../src/components/bootstrap/Provider';

import PassDates from '../src/passCulture/Dates';

import {
  changeDate,
  removeDate,
} from '../src/passCulture/utils';

import event from './fixtures/event.json';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'PassCulture/Form Dates',
  decorators: [Story => (
    <BootstrapComponentsProvider><Story /></BootstrapComponentsProvider>
  )],
};

export const Empty = () => (
  <>
    <p>User is informed that no dates are defined, add date button is disabled, message indicates that</p>
    <PassDates
      timings={event.timings}
    />
  </>
);

export const EmptyWithPriceCategories = () => (
  <>
    <p>User is informed that no dates are defined, add button is enabled</p>
    <PassDates
      timings={event.timings}
      value={{
        priceCategories: [{
          price: 15,
          label: 'Tarif normal',
        }],
      }}
    />
  </>
);

export const EmptyWithOpenForm = () => {
  const [value, setValue] = useState({
    priceCategories: [{
      price: 15,
      label: 'Tarif normal',
    }],
  });
  return (
    <>
      <p>Technical state to avoid having to open form at every reload</p>
      <PassDates
        timings={event.timings}
        initWithOpenForm
        value={value}
        onAdd={date => setValue({
          ...value,
          dates: (value.dates ?? []).concat(date),
        })}
      />
    </>
  );
};

export const WithDates = () => {
  const [value, setValue] = useState({
    priceCategories: [{
      price: 15,
      label: 'Tarif normal',
    }],
    dates: [{
      timingId: 1696078800000,
      priceCategoryIndex: 0,
      quantity: 15,
    }, {
      timingId: 1697371200000,
      priceCategoryIndex: 0,
      quantity: 20,
    }],
  });
  return (
    <PassDates
      timings={event.timings}
      value={value}
      onAdd={date => setValue({
        ...value,
        dates: (value.dates ?? []).concat(date),
      })}
      onRemove={date => setValue(removeDate(value, date))}
      onChange={(index, date) => setValue(changeDate(value, index, date))}
    />
  );
};
