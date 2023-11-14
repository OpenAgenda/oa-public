import { rest } from 'msw';
import { useState } from 'react';

import Registration from '../src/bootstrap';
import passSettings from './fixtures/passSettings.json';

import event from './fixtures/event.json';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'integrated/with Pass Culture',
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

export function EmptyAtLoad() {
  const [value, setValue] = useState();

  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <Registration
        value={value}
        lang="fr"
        onChange={setValue}
        relatedValues={{
          other: {
            timings: event.timings,
          },
        }}
        field={{
          placeholder: 'Truc bidule',
          settings: {
            passCulture: {
              siren: [809346158],
              res: {
                settings: '/settings',
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
        relatedValues={{
          other: {
            timings: event.timings,
          },
        }}
        field={{
          placeholder: 'Truc bidule',
          settings: {
            passCulture: {
              siren: [809346158],
              res: {
                settings: '/settings',
              },
            },
          },
        }}
      />
    </div>
  );
}

export function WithDataWithoutTimings() {
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
    <>
      <div className="col-lg-offset-3 col-lg-6 margin-v-lg">
        When there is data a warning message indicates that timings must be defined and it is possible to edit the data. An additional message shows that the data is invalid.
      </div>
      <div className="oa-form col-lg-offset-3 col-lg-6">
        <Registration
          value={value}
          lang="fr"
          onChange={setValue}
          relatedValues={{
            other: {
              timings: [],
            },
          }}
          field={{
            placeholder: 'Truc bidule',
            settings: {
              passCulture: {
                siren: [809346158],
                res: {
                  settings: '/settings',
                },
              },
            },
          }}
        />
      </div>
    </>
  );
}

export function WithoutDataWithoutTimings() {
  const [value, setValue] = useState();

  return (
    <>
      <div className="col-lg-offset-3 col-lg-6 margin-v-lg">
        When there is no data nor any timings a warning message indicates that timings must be defined and the checkbox is disabled.
      </div>
      <div className="oa-form col-lg-offset-3 col-lg-6">
        <Registration
          value={value}
          lang="fr"
          onChange={setValue}
          relatedValues={{
            other: {
              timings: [],
            },
          }}
          field={{
            placeholder: 'Truc bidule',
            settings: {
              passCulture: {
                siren: [809346158],
                res: {
                  settings: '/settings',
                },
              },
            },
          }}
        />
      </div>
    </>
  );
}

export function WithoutDataWithPassedTimings() {
  const [value, setValue] = useState();

  return (
    <>
      <div className="col-lg-offset-3 col-lg-6 margin-v-lg">
        When there are only timings beginning in the past, a message is displayed and the PassCulture checkbox is disabled
      </div>
      <div className="oa-form col-lg-offset-3 col-lg-6">
        <Registration
          value={value}
          lang="fr"
          onChange={setValue}
          relatedValues={{
            other: {
              timings: [],
            },
          }}
          field={{
            placeholder: 'Truc bidule',
            settings: {
              passCulture: {
                siren: [809346158],
                res: {
                  settings: '/settings',
                },
              },
            },
          }}
        />
      </div>
    </>
  );
}