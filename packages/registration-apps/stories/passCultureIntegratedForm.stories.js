import { rest } from 'msw';

import BootstrapComponentsProvider from '../src/components/bootstrap/Provider';

import PassForm from '../src/passCulture/Form';

import passSettings from './fixtures/passSettings.json';

import event from './fixtures/event.json';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

const {
  categories,
  related,
  offererVenues,
} = passSettings;

export default {
  title: 'PassCulture/Integrated Form',
  decorators: [Story => (
    <BootstrapComponentsProvider><Story /></BootstrapComponentsProvider>
  )],
  parameters: {
    msw: {
      handlers: [
        rest.get('/settings', (req, res, ctx) => res(
          ctx.json(passSettings),
        )),
      ],
    },
  },
};

export const Empty = () => (
  <PassForm
    timings={event.timings}
    categories={categories}
    related={related}
    offererVenues={offererVenues}
    onSubmit={() => {}}
  />
);

export const WithData = () => (
  <PassForm
    value={{
      venueId: 548,
      category: 'CONCERT',
      musicType: 'ROCK-LO_FI',
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
      description: 'Custom Desc',
    }}
    timings={event.timings}
    categories={categories}
    related={related}
    offererVenues={offererVenues}
    onSubmit={() => {}}
  />
);
