import '@openagenda/bs-templates/compiled/main.css';

import LocationItem from '../src/components/LocationItem.js';
import ComponentCanvas from './decorators/ComponentCanvas.js';
import Providers from './decorators/Providers.js';

import agendaTestSettings from './fixtures/agendaTestSettings.json';
import location from './fixtures/location.json';

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null,
};

export default {
  title: 'LocationItem',
  decorators: [Providers, ComponentCanvas],
};

export const test = () => (
  <LocationItem
    getCountryLabel={() => 'test'}
    location={location}
    onSelect={() => null}
    settings={{
      ...agendaTestSettings,
      access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess,
      },
    }}
  />
);

export const BDLtest = () => (
  <LocationItem
    getCountryLabel={() => 'testBDL'}
    location={{
      ...location,
      extIds: [
        { key: 'default', value: '1221HHH34' },
        { key: 'test', value: '12' },
      ],
    }}
    onSelect={() => null}
    settings={{
      ...agendaTestSettings,
      access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess,
      },
      locations: {
        extIds: [
          {
            key: 'default',
            label: 'BDL',
            actions: {
              edit: {
                link: 'https://basedeslieux.culture.gouv.fr/lieux/{value}',
              },
              show: {
                link: 'https://basedeslieux.culture.gouv.fr/carte#/pinpoints/{value}',
                label: { fr: 'Voir sur la BDL' },
              },
            },
          },
          {
            key: 'test',
            actions: {
              remove: {
                link: 'ret/{value}',
              },
            },
          },
        ],
      },
    }}
  />
);

export const BDLtestBug = () => (
  <LocationItem
    getCountryLabel={() => 'testBDL'}
    location={{
      ...location,
      extIds: [
        { key: 'default', value: null },
        { key: 'test', value: '12' },
      ],
    }}
    onSelect={() => null}
    settings={{
      ...agendaTestSettings,
      access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess,
      },
      locations: {
        extIds: [
          {
            key: 'default',
            label: 'BDL',
            actions: {
              edit: {
                link: 'https://basedeslieux.culture.gouv.fr/lieux/{value}',
              },
              show: {
                link: 'https://basedeslieux.culture.gouv.fr/carte#/pinpoints/{value}',
                label: { fr: 'Voir sur la BDL' },
              },
            },
          },
          {
            key: 'test',
            actions: {
              remove: {
                link: 'ret/{value}',
              },
            },
          },
        ],
      },
    }}
  />
);
