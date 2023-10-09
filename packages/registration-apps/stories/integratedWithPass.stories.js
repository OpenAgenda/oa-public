import { rest } from 'msw';
import { useState } from 'react';

import Registration from '../src/bootstrap';
import passCategories from './fixtures/passCategories.json';

import event from './fixtures/event.json';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'integrated/with Pass Culture',
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

export function EmptyAtLoad() {
  const [value, setValue] = useState();

  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <Registration
        value={value}
        lang="fr"
        onChange={setValue}
        field={{
          placeholder: 'Truc bidule',
          relatedValues: { timings: event.timings },
          settings: {
            passCulture: {
              res: {
                categories: '/categories',
              },
            },
          },
        }}
      />
    </div>
  );
}

export function WithData() {
  const [value, setValue] = useState([
    'https://openagenda.com', // this should be cleaned
    { type: 'email', value: 'email@domain.com' },
    {
      type: 'link',
      value: 'https://passCulture.com/offers/2199832',
      service: 'passCulture',
      data: {
        category: 'CONCERT',
        subCategory: 'JAZZ-BEBOP',
        priceCategories: [{
          label: 'Tarif normal',
          price: '12000',
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
      },
    },
  ]);

  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <Registration
        value={value}
        lang="fr"
        onChange={setValue}
        field={{
          placeholder: 'Truc bidule',
          relatedValues: { timings: event.timings },
          settings: {
            passCulture: {
              res: {
                categories: '/categories',
              },
            },
          },
        }}
      />
    </div>
  );
}
