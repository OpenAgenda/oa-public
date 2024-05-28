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
        rest.get('/contextForAdminMod', (req, res, ctx) => res(
          ctx.json({ me: { member: { role: 'administrator' } } }),
        )),
        rest.get('/contextForContribOrNonMember', (req, res, ctx) => res(
          ctx.status(404),
        )),
      ],
    },
  },
};

export function EmptyAtLoad() {
  const [value, setValue] = useState();

  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <p>Form will be preloaded with one pricing `Tarif unique` with price at 0.</p>
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
                context: '/contextForAdminMod',
              },
            },
          },
        }}
      />
    </div>
  );
}

export function EmptyAtLoadWithOneTiming() {
  const [value, setValue] = useState();
  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <p>Form will be preloaded with only timing available.</p>
      <Registration
        value={value}
        lang="fr"
        onChange={setValue}
        relatedValues={{
          other: {
            timings: event.timings,
            location: null,
          },
        }}
        field={{
          placeholder: 'Truc bidule',
          settings: {
            passCulture: {
              siren: [809346158],
              res: {
                settings: '/settings',
                context: '/contextForAdminMod',
              },
            },
          },
        }}
      />
    </div>
  );
}

export function EmptyAtLoadWithPreslectedLocation() {
  const [value, setValue] = useState();
  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <p>Form will be preloaded if venue name is close to location name.</p>
      <Registration
        value={value}
        lang="fr"
        onChange={setValue}
        relatedValues={{
          other: {
            timings: [{
              begin: { date: '2024-09-30', hours: 15, minutes: 0 },
              end: { date: '2024-09-30', hours: 17, minutes: 0 },
            }],
            location: { name: 'Lieu Oa 2' },
          },
        }}
        field={{
          placeholder: 'Truc bidule',
          settings: {
            passCulture: {
              siren: [809346158],
              res: {
                settings: '/settings',
                context: '/contextForAdminMod',
              },
            },
          },
        }}
      />
    </div>
  );
}

export function EmptyAtLoadSeenByContributor() {
  const [value, setValue] = useState();

  return (
    <div className="oa-form col-lg-offset-3 col-lg-6">
      <p>Contributor (or not member at all) does not have access to pass checkbox</p>
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
                context: '/contextForContribOrNonMember',
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
      data: [{
        editing: true,
        venueId: 548,
        category: 'CINE_PLEIN_AIR',
        priceCategories: [{
          id: 0,
          label: 'Tarif normal',
          price: '12000',
        }],
        dates: [{
          id: 1,
          timingId: 1696078800000,
          priceCategoryId: 0,
          quantity: 15,
        }, {
          id: 2,
          timingId: 2012990400000,
          priceCategoryId: 0,
          quantity: 20,
        }],
      }],
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
                context: '/contextForAdminMod',
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
      data: [{
        venueId: 548,
        editing: true,
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        priceCategories: [{
          id: 0,
          label: 'Tarif normal',
          price: '12000',
        }],
        dates: [{
          id: 1,
          timingId: 1696078800000,
          priceCategoryId: 0,
          quantity: 15,
        }, {
          id: 2,
          timingId: 1697371200000,
          priceCategoryId: 0,
          quantity: 20,
        }],
      }],
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
                  context: '/contextForAdminMod',
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
                  context: '/contextForAdminMod',
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
              timings: event.timings.filter(t => new Date(t.date) < new Date()),
            },
          }}
          field={{
            placeholder: 'Truc bidule',
            settings: {
              passCulture: {
                siren: [809346158],
                res: {
                  settings: '/settings',
                  context: '/contextForAdminMod',
                },
              },
            },
          }}
        />
      </div>
    </>
  );
}

export function WithAlreadyCreatedPassOffer() {
  const [value, setValue] = useState([{
    type: 'link',
    value: 'https://integration.passculture.app/offre/49397',
    service: 'passCulture',
    data: [{
      venueId: 548,
      category: 'CONFERENCE',
      priceCategories: [{
        id: 0,
        price: 89,
        label: 'Tarfi narlmo',
      }],
      dates: [{
        id: 1,
        timingId: 1696078800000,
        priceCategoryId: 0,
        quantity: 879,
      }],
      passId: 49397,
    }],
  }]);

  return (
    <>
      <div className="col-lg-offset-3 col-lg-6 margin-v-lg">
        Checkbox is disabled with relevent message when offer is already created
      </div>
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
                  offerLink: '/#/:id/show',
                  offerEditLink: '/#/:id/edit',
                  context: '/contextForAdminMod',
                },
              },
            },
          }}
        />
      </div>
    </>
  );
}
