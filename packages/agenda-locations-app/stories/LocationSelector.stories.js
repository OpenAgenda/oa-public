import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { Modal } from '@openagenda/react-shared';

import LocationSelector from '../src/components/LocationSelector.js';

import agendaSettings from './fixtures/slslf-2022.json';
import propLocation from './fixtures/location.json';
import Providers from './decorators/Providers.js';
import ComponentCanvas from './decorators/ComponentCanvas.js';

const res = {
  index: '/api/agendas/1/locations?detailed=1',
  getSettings: '/api/agendas/1/locations/settings',
  get: '/api/agendas/1/locations/:locationUid?detailed=1',
  create: '/api/agendas/1/locations',
  update: '/api/agendas/1/locations/:locationUid',
  merge: '/api/agendas/1/locations/merge',
  remove: '/api/agendas/1/locations/:locationUid',
  geocode: '/api/agendas/1/locations/geocode',
  reverseGeocode: '/api/agendas/1/locations/geocode/reverse',
  insee: '/api/agendas/1/locations/insee',
  csv: '#csv',
  xlsx: '#xlsx',
  disqualifyDuplicates: '/api/agendas/1/locations/disqualify',
  agendaSearch: '/api/agendas/1/locations/agendas',
  seeEvents:
    '/api/agendas/1/locations/:agendaSlug/admin?locationUid=:locationUid&q.locationUid=:locationUid',
  suggestChange:
    'https://openagenda.com/mail-repair-cafe/locations/:locationUid/suggest-change/conversation/create',
};

export default {
  title: 'LocationSelector',
  decorators: [ComponentCanvas, Providers],
};

export const SelectMode = () => {
  const [mode, setMode] = useState('show');
  const [location, setLocation] = useState(propLocation);
  return (
    <LocationSelector
      agenda={{ uid: 1 }}
      mode={mode}
      lang="fr"
      settings={agendaSettings}
      res={res}
      location={location}
      onChange={(t, l) => {
        setMode(t);
        setLocation(l);
      }}
      disableChange={false}
    />
  );
};

export const CreateMode = () => {
  const [mode, setMode] = useState('create');
  const [location, setLocation] = useState(null);
  return (
    <div className="from-group has-error">
      <Modal classNames={{ overlay: 'popup-overlay big' }}>
        <LocationSelector
          agenda={{ uid: 1 }}
          mode={mode}
          lang="fr"
          settings={agendaSettings}
          res={res}
          location={location}
          onChange={(t, l) => {
            setMode(t);
            setLocation(l);
          }}
          detailedInfo
        />
      </Modal>
    </div>
  );
};

export const SearchMode = () => {
  const [mode, setMode] = useState('search');
  const [location, setLocation] = useState(null);
  return (
    <LocationSelector
      agenda={{ uid: 1 }}
      mode={mode}
      lang="fr"
      settings={agendaSettings}
      res={res}
      location={location}
      onChange={(t, l) => {
        setMode(t);
        setLocation(l);
      }}
    />
  );
};

export const SearchModeWithExternalActions = () => {
  const [mode, setMode] = useState('search');
  const [location, setLocation] = useState(null);
  return (
    <LocationSelector
      agenda={{ uid: 1 }}
      mode={mode}
      lang="fr"
      settings={{
        ...agendaSettings,
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
      }}
      res={res}
      location={location}
      onChange={(t, l) => {
        setMode(t);
        setLocation(l);
      }}
    />
  );
};

export const ConfirmMode = () => {
  const [mode, setMode] = useState('confirm');
  const [location, setLocation] = useState(propLocation);
  return (
    <Modal title={location.name} classNames={{ overlay: 'popup-overlay big' }}>
      <LocationSelector
        mode={mode}
        lang="fr"
        settings={agendaSettings}
        res={{
          get: '/locations/:locationUid.json',
          suggestChange:
            '/:agendaSlug/locations/:agendaUid.:locationUid/suggest-change/conversation/create',
          staticTiles:
            'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%231d77ce;size:small&apiKey=9f8da49724b645f486f281abbe690750',
        }}
        confirmRequired
        location={location}
        onChange={(t, l) => {
          setMode(t);
          setLocation(l);
        }}
      />
    </Modal>
  );
};

export const ConfirmModeExternalActions = () => {
  const [mode, setMode] = useState('confirm');
  const [location, setLocation] = useState({
    ...propLocation,
    extIds: [{ key: 'default', value: '123AAC' }],
  });
  return (
    <Modal title={location.name} classNames={{ overlay: 'popup-overlay big' }}>
      <LocationSelector
        mode={mode}
        lang="fr"
        settings={{
          ...agendaSettings,

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
        }}
        res={{
          get: '/locations/:locationUid.json',
          suggestChange:
            '/:agendaSlug/locations/:agendaUid.:locationUid/suggest-change/conversation/create',
          staticTiles:
            'https://maps.geoapify.com/v1/staticmap?style=klokantech-basic&width={w}&height={h}&center=lonlat:{lon},{lat}&zoom=14&marker=lonlat:{lon},{lat};color:%231d77ce;size:small&apiKey=9f8da49724b645f486f281abbe690750',
        }}
        confirmRequired
        location={location}
        onChange={(t, l) => {
          setMode(t);
          setLocation(l);
        }}
      />
    </Modal>
  );
};
