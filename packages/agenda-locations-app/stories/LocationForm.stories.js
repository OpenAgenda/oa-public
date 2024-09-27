import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import { produce } from 'immer';

import LocationForm from '../src/components/form-components/LocationForm';
import LocationMap from '../src/components/form-components/LocationMap';
import GeoFieldsAndMap from '../src/components/form-components/GeoFieldsAndMap';
import validate from '../src/validate';
import Providers from './decorators/Providers';
import ComponentCanvas from './decorators/ComponentCanvas';

import location from './fixtures/location.json';
import agendaSettings from './fixtures/agendaTestSettings.json';

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
