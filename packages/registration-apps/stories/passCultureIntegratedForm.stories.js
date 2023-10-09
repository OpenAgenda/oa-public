import { rest } from 'msw';

import BootstrapComponentsProvider from '../src/components/bootstrap/Provider';

import PassForm from '../src/passCulture/Form';

import passCategories from './fixtures/passCategories.json';

import event from './fixtures/event.json';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'PassCulture/Integrated Form',
  decorators: [Story => (
    <BootstrapComponentsProvider><Story /></BootstrapComponentsProvider>
  )],
  parameters: {
    msw: {
      handlers: [
        rest.get('/categories', (req, res, ctx) => res(
          ctx.json(passCategories),
        )),
      ],
    },
  },
};

export const Empty = () => (
  <PassForm
    timings={event.timings}
    settings={{
      res: {
        categories: '/categories',
      },
    }}
    onSubmit={() => {}}
  />
);

export const WithData = () => (
  <PassForm
    value={{
      priceCategories: [{
        label: 'Tarif normal',
        price: '20',
      }, {
        label: 'Tarif réduit',
        price: '10',
      }],
      dates: [{
        priceCategoryIndex: 1,
        timingId: 1696078800000,
        quantity: 2,
      }],
    }}
    timings={event.timings}
    settings={{
      res: {
        categories: '/categories',
      },
    }}
    onSubmit={() => {}}
  />
);
