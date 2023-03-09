import { useState, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDebouncedCallback } from 'use-debounce';
import axios from 'axios';

import { Spinner } from '@openagenda/react-shared';

import GeoBadges from '../GeoBadges';
import LocationMap from './LoadableLocationMap';
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
  res,
  tiles,
  errors
}) => {
  const intl = useIntl();
  const [geocodeNoResults, setGeocodeNoResults] = useState(false);
  const [geocodeEdit, setGeocodeEdit] = useState(undefined);
  const [geocodeEditValue, setGeocodeEditValue] = useState(undefined);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const fetchINSEE = useCallback(loc => {
    axios.get(res.insee, {
      params: {
        latitude: loc.latitude || '',
        longitude: loc.longitude || '',
        city: loc.adminLevel4 || '',
        department: loc.adminLevel2 || '',
      }
    }).then(response => {
      onChange({
        ...location,
        adminLevel1: loc.adminLevel1,
        adminLevel2: loc.adminLevel2,
        adminLevel3: loc.adminLevel3,
        adminLevel4: loc.adminLevel4,
        adminLevel5: loc.adminLevel5,
        adminLevel6: loc.adminLevel6,
        country: loc.country,
        countryCode: loc.countryCode.toUpperCase(),
        postalCode: loc.postalCode,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
        insee: response.data.code,
      });
      return response.data.code;
    });
  }, [location, res.insee, onChange]);

  const updateLocationGeocode = useCallback(value => {
    setGeocodeEdit(false);
    if (value === undefined) return;
    axios.get(res.geocode, { params: { address: value, countryCode: location?.countryCode } })
      .then(response => {
        if (!response.data.results[0]) setGeocodeNoResults(true);
        const obj = response.data.results[0];
        if (obj.countryCode === 'fr') {
          fetchINSEE(obj);
        } else {
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
        }
        setGeocodeNoResults(false);
        setGeocodeLoading(false);
      })
      .catch(err => {
        setGeocodeError(err);
      });
  }, [location, onChange, res.geocode, fetchINSEE]);

  const updateLocationReverseGeocode = (lat, long) => {
    setGeocodeEdit(false);
    axios.get(res.reverseGeocode, { params: { latitude: lat, longitude: long } })
      .then(response => {
        if (!response.data.results[0]) {
          setGeocodeNoResults(true);
          return;
        }
        const obj = response.data.results[0];
        if (obj.countryCode === 'fr') {
          fetchINSEE(obj);
        } else {
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
        }
        setGeocodeNoResults(false);
        setGeocodeLoading(false);
      })
      .catch(err => {
        setGeocodeError(err);
      });
  };

  const debouncedOnChange = useDebouncedCallback(value => {
    const doGeocode = value && value.trim().length > 2;
    setGeocodeLoading(doGeocode);
    if (doGeocode) updateLocationGeocode(value);
  }, 1500);

  const onAddressChange = useCallback((v, disableManualMode) => {
    onChange({ ...location, address: v });
    if (disableManualMode) {
      const doGeocode = v && v.trim().length > 2;
      setGeocodeLoading(doGeocode);
      if (doGeocode) updateLocationGeocode(v);
      setManualMode(false);
      return;
    }
    if (!manualMode) {
      debouncedOnChange(v);
    }
  }, [debouncedOnChange, onChange, location, manualMode, updateLocationGeocode]);

  const onMarkerDragged = pos => {
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
        onClick={() => { onAddressChange(location.address, true); }}
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
        onChange={(n, v) => onAddressChange(v)}
        validator={validate.field('address')}
        lang={lang}
        getLabel={getLabel}
        groupClassName={errors && errors.find(e => e.field === 'name') ? 'has-error margin-bottom-xs' : 'margin-bottom-xs'}
        className={enableGeocode ? 'input-group' : 'form-group'}
        errors={geocodeError ? [{ code: 'geocodeError' }] : false}
        renderButton={
            enableGeocode
              ? renderGeocodeButton
              : false
          }
        onKeyDown={e => {
          if (e.key === 'Enter') onAddressChange(e.target.value, true);
        }}
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
          setManualMode={setManualMode}
          tiles={tiles}
        />
      </div>
    </>
  );
};

export default GeoFieldsAndMap;
