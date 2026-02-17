import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import { produce } from 'immer';

import LocationForm from '../src/components/form-components/LocationForm.js';
import LocationMap from '../src/components/form-components/LocationMap.js';
import GeoFieldsAndMap from '../src/components/form-components/GeoFieldsAndMap.js';
import validate from '../src/validate.js';
import Providers from './decorators/Providers.js';
import ComponentCanvas from './decorators/ComponentCanvas.js';

import location from './fixtures/location.json';
import locationWithEmotes from './fixtures/locationWithEmotes.json';
import agendaSettings from './fixtures/agendaTestSettings.json';
import agendaSettingsNotMultilingual from './fixtures/agendaSettingsNotMultilingual.json';

export default {
  title: 'LocationFormComponents',
  decorators: [ComponentCanvas, Providers],
};

const res = {
  geocode: 'http://localhost:3000/api/agendas/:agendaUid/locations/geocode',
  reverseGeocode:
    'http://localhost:3000/api/agendas/:agendaUid/locations/geocode/reverse',
};

export const BasicForm = () => (
  <LocationForm
    locationProp={location}
    settings={agendaSettings}
    mode="update"
    res={res}
  />
);

export const BasicFormNotMultiling = () => (
  <LocationForm
    locationProp={location}
    settings={agendaSettingsNotMultilingual}
    mode="update"
    res={res}
  />
);

export const BasicFormWithEmotes = () => (
  <LocationForm
    locationProp={locationWithEmotes}
    settings={agendaSettings}
    mode="update"
    res={res}
  />
);

export const FormWithImageRightsCheckbox = () => (
  <LocationForm
    locationProp={location}
    settings={produce(agendaSettings, (draft) => {
      draft.displayImageRightsConfirmCheckbox = true;
    })}
    mode="update"
    res={res}
  />
);

export const FormWithSIRETInput = () => (
  <LocationForm
    locationProp={location}
    settings={produce(agendaSettings, (draft) => {
      draft.displaySIRETInput = true;
    })}
    mode="update"
    res={res}
    onSubmit={(data) => {
      console.log(data);
    }}
  />
);

export const FormWithAllCapsWarning = () => (
  <LocationForm
    locationProp={produce(location, (draft) => {
      draft.name = 'MOULIN ROUGE';
    })}
    settings={produce(agendaSettings, (draft) => {
      draft.nameWarnAllCaps = true;
    })}
    mode="update"
    res={res}
    onSubmit={(data) => {
      console.log(data);
    }}
  />
);

export const BasicGeoFieldsAndMap = () => {
  const [locationGeo, setLocation] = useState(null);
  return (
    <GeoFieldsAndMap
      lang="fr"
      location={locationGeo}
      validate={validate}
      onChange={setLocation}
      enableGeocode
      res={res}
      agenda={{
        uid: 1,
      }}
    />
  );
};

export const BasicMap = () => (
  <LocationMap location={location} draggableMarker />
);
