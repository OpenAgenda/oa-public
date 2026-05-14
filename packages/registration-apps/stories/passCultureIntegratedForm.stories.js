import { http, HttpResponse } from 'msw';

import BootstrapComponentsProvider from '../src/components/bootstrap/Provider.js';

import PassForm from '../src/passCulture/Form.js';

import passSettings from './fixtures/passSettings.json' with { type: 'json' };

import event from './fixtures/event.json' with { type: 'json' };

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

const { categories, related, offererVenues } = passSettings;

export default {
  title: 'PassCulture/Integrated Form',
  decorators: [
    (Story) => (
      <BootstrapComponentsProvider>
        <Story />
      </BootstrapComponentsProvider>
    ),
  ],
  parameters: {
    msw: {
      handlers: [http.get('/settings', () => HttpResponse.json(passSettings))],
    },
  },
};

export const Empty = () => (
  <PassForm
    value={[]}
    timings={event.timings}
    categories={categories}
    related={related}
    offererVenues={offererVenues}
    onSubmit={() => {}}
  />
);

export const WithData = () => (
  <PassForm
    value={[
      {
        venueId: 548,
        category: 'CONCERT',
        musicType: 'ROCK-LO_FI',
        priceCategories: [
          {
            id: 0,
            label: 'Tarif normal',
            price: '20',
          },
          {
            id: 1,
            label: 'Tarif réduit',
            price: '10',
          },
        ],
        dates: [
          {
            id: 2,
            priceCategoryId: 1,
            timingId: 1696078800000,
            quantity: 2,
          },
        ],
        description: 'Custom Desc',
      },
    ]}
    timings={event.timings}
    categories={categories}
    related={related}
    offererVenues={offererVenues}
    onSubmit={() => {}}
  />
);

export const WithWarnings = () => (
  <PassForm
    value={[]}
    timings={event.timings}
    categories={categories}
    related={related}
    offererVenues={offererVenues}
    onSubmit={() => {}}
    title="a long ass title for testing purpose that should proc the wraning cause it is suppose to be more than 90 char long which is problem"
    longDesc="a way longer description that should also proc a warning cause to big for the pass culture thing that only accept 1000 characters for the description kjhdfkljshfdkqghsjkfjhgqsfhjgsqjkfgddqsjkgsdfdsfsfsfsfsfdfkjsqgdhfksqjgfkjsqqqgfhkjsqgdfkjkjhdkjhfgjdhgqsjhgfjshhggfdgfghsfkjhdfkljshfdkqghsjkfjhgqsfhjgsqjkfgddqsjkgdfkjsqgdhfksqjgfkjsqqqgfhkjsqgdfkjkjhdkjhfgjdhgqsjhgfjshhggfdgfghsfdhjggsjhfgjhsgfdhjsdhgfjhsdgfjhsgdfjhsdgfjhhgsjhfgsjhgfjhsgfjhsfgjshgfjhsfqqdhgqfsdghfjksghdfkjdsgfqkjsgdfkjdsgfhkqsfgdjgfgfgfgfgsqqghdfjskhqgkfgsdh__________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________some randdom stuff athe end that will be partly trucated before creatin a pass culture Offer"
  />
);

export const WithUpdatedData = () => (
  <PassForm
    value={[
      {
        duo: true,
        venueId: 548,
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        priceCategories: [
          {
            id: 0,
            price: '123',
            label: 'trezterztrez',
          },
          {
            id: 1,
            price: '724',
            label: 'static',
          },
        ],
        dates: [
          {
            id: 2,
            timingId: 1696078800000,
            priceCategoryId: 0,
            quantity: '456',
          },
        ],
        bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
        appliedAt: '2024-04-15T10:39:00+0200',
        response: {
          passId: 797878989,
          priceCategories: [
            {
              id: 0,
              passId: 78979789798,
            },
            {
              id: 1,
              passId: 9845798,
            },
          ],
          dates: [
            {
              id: 2,
              passId: 89564654,
            },
          ],
        },
      },
      {
        editing: true,
        priceCategories: [
          {
            id: 0,
            price: '456',
            label: 'updated',
            passId: 78979789798,
          },
        ],
      },
    ]}
    timings={event.timings}
    categories={categories}
    related={related}
    offererVenues={offererVenues}
    onSubmit={() => {}}
  />
);
