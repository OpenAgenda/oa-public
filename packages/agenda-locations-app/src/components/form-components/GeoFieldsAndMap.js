import React, { useState, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';

import { Spinner } from '@openagenda/react-shared';

import GeoBadges from '../GeoBadges';
import LocationMap from './LocationMap';
import CountryField from './CountryField';
import InputField from './InputField';

const messages = defineMessages({
  disabledGeocode: {
    id: 'AgendaLocations.LocationForm.disabledGeocode',
    defaultMessage: 'The automatic localisation is temporarily unavailable. Drag the marker to the correct location on the map manually.',
  },
});

const GeoFieldsAndMap = ({
  lang,
  location,
  onChange,
  getLabel,
  validate,
  enableGeocode = false,
  agenda,
  res
}) => {
  console.log(location);
  const intl = useIntl();
  const [geocodeNoResults, setGeocodeNoResults] = useState(false);
  const [geocodeEdit, setGeocodeEdit] = useState(undefined);
  const [geocodeEditValue, setGeocodeEditValue] = useState(undefined);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const updateLocationGeocode = value => {
    setGeocodeEdit(false);
    if (value === undefined) return;
    axios.get(res.geocode.replace(':agendaUid', agenda.uid), { params: { address: value, countryCode: location?.countryCode } })
      .then(response => {
        if (!response.data.results[0]) setGeocodeNoResults(true);
        const obj = response.data.results[0];
        onChange({
          ...location,
          adminLevel1: obj.adminLevel1,
          adminLevel2: obj.adminLevel2,
          adminLevel3: obj.adminLevel3,
          adminLevel4: obj.adminLevel4,
          adminLevel5: obj.adminLevel5,
          adminLevel6: obj.adminLevel6,
          country: obj.country,
          countryCode: obj.countryCode.toUpperCase(),
          postalCode: obj.postalCode,
          latitude: obj.latitude,
          longitude: obj.longitude,
          timezone: obj.timezone,
        });
        setGeocodeLoading(false);
        setManualMode(false);
      })
      .catch(err => {
        console.log('error', err);
        setGeocodeError(err);
      });
  };

  const updateLocationReverseGeocode = (lat, long) => {
    setGeocodeEdit(false);
    axios.get(res.reverseGeocode.replace(':agendaUid', agenda.uid), { params: { latitude: lat, longitude: long } })
      .then(response => {
        if (!response.data.results[0]) {
          setGeocodeNoResults(true);
          return;
        }
        const obj = response.data.results[0];
        onChange({
          ...location,
          adminLevel1: obj.adminLevel1,
          adminLevel2: obj.adminLevel2,
          adminLevel3: obj.adminLevel3,
          adminLevel4: obj.adminLevel4,
          adminLevel5: obj.adminLevel5,
          adminLevel6: obj.adminLevel6,
          country: obj.country,
          countryCode: obj.countryCode.toUpperCase(),
          postalCode: obj.postalCode,
          latitude: obj.latitude,
          longitude: obj.longitude,
          timezone: obj.timezone,
        });
        console.log('updated');
        setGeocodeLoading(false);
        setManualMode(true);
      })
      .catch(err => {
        console.log('error', err);
        setGeocodeError(err);
      });
  };

  const debouncedOnChange = useDebouncedCallback(value => {
    const doGeocode = value && value.trim().length >= 2;
    setGeocodeLoading(doGeocode);
    if (doGeocode) updateLocationGeocode(value);
  }, 1500);

  const onAddressChange = useCallback((n, v) => {
    onChange({ ...location, address: v });
    debouncedOnChange(v);
  }, [debouncedOnChange, onChange, location]);

  const onMarkerDragged = pos => {
    console.log('onMarkerDragged', pos);
    if (!enableGeocode) onChange({ ...location, longitude: pos.lng, latitude: pos.lat });
    else updateLocationReverseGeocode(pos.lat, pos.lng);
  };

  const editGeocode = (field, value) => {
    setGeocodeEdit(field);
    setGeocodeEditValue(value);
  };

  const setGeocodeFieldValue = (field, value) => {
    onChange({ ...location, [field]: value });
    setGeocodeEdit(null);
  };

  const renderGeocodeButton = () => (
    <span className="input-group-btn geocode">
      <button
        className="btn btn-default"
        type="button"
        onClick={(n, v) => console.log(n, v)}
      >
        {geocodeLoading ? (
          <i style={{ padding: '0.2em 0.65em' }}>
            <Spinner
              loading={geocodeLoading}
              options={{
                width: 1,
                length: 3,
                radius: 4,
                color: '#666',
              }}
            />
          </i>
        ) : (
          <i className="fa fa-search" />
        )}
      </button>
    </span>
  );

  return (
    <>
      <CountryField
        enabled
        pValue={location?.countryCode}
        lang={lang}
        onChange={v => onChange({ ...location, countryCode: v })}
        getLabel={getLabel}
      />

      <InputField
        name="address"
        enabled
        value={location?.address || ''}
        info="addressInfo"
        placeholder="addressPlaceholder"
        onChange={(n, v) => onAddressChange(n, v)}
        validator={validate.field('address')}
        lang={lang}
        getLabel={getLabel}
        groupClassName="margin-bottom-xs"
        className={enableGeocode ? 'input-group' : 'form-group'}
        errors={geocodeError ? [{ code: 'geocodeError' }] : false}
        renderButton={
            enableGeocode
              ? renderGeocodeButton
              : false
          }
      />

      <GeoBadges
        location={location}
        enableGeocode={enableGeocode}
        geocodeNoResults={geocodeNoResults}
        geocodeEdit={geocodeEdit}
        geocodeEditValue={geocodeEditValue}
        setGeocodeFieldValue={setGeocodeFieldValue}
        cancelEditGeocode={() => setGeocodeEdit(false)}
        editGeocode={editGeocode}
      />

      {!enableGeocode ? (
        <div className="alert alert-warning" role="alert">
          {intl.formatMessage(messages.disabledGeocode)}
        </div>
      ) : null}

      <div className="form-group">
        <LocationMap
          enabled
          draggableMarker
          onMarkerDragged={onMarkerDragged}
          location={location}
          manualMode={manualMode}
        />
      </div>
    </>
  );
};

export default GeoFieldsAndMap;
