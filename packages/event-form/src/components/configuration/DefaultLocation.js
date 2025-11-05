import Select from 'react-select';
import { useState, useEffect } from 'react';
import countries from '@openagenda/countries/labels.js';
import defaultLocationLabels from '@openagenda/labels/event/defaultLocation.js';
import flattenLabels from '@openagenda/labels/flatten.js';
import LocationSelector from '@openagenda/agenda-locations-app/dist/components/LocationSelector.js';
import Provider from '@openagenda/agenda-locations-app/dist/decorators/Providers.js';

const DefaultLocation = ({
  lang = 'fr',
  value = null,
  field,
  onChange,
  enabled = true,
}) => {
  const labels = flattenLabels(defaultLocationLabels, lang);
  const extractCountryNames = () =>
    countries.map((c) => ({
      value: c.code,
      label: c[lang],
    }));

  const options = extractCountryNames();
  const selectValue = options.find(
    (option) => option.value === value?.countryCode,
  );
  const [mode, setMode] = useState(value?.uid ? 'show' : 'search');
  const [loc, setLoc] = useState(null);

  useEffect(() => {
    if (value?.uid) {
      fetch(field.res.getLocationDetails.replace(':locationUid', value.uid))
        .then((r) => r.json())
        .then((data) => setLoc(data));
    }
  }, []);

  const locationSelectorOnChange = (m, l) => {
    setMode(m);
    setLoc(l);
    if (l.uid) onChange({ ...value, uid: l.uid });
  };

  return (
    <>
      <div className="margin-bottom-md">
        <label htmlFor="DefaultLocation">{labels.chooseDefaultLocation}</label>
        <Provider lang={lang}>
          <LocationSelector
            enableDetails={false}
            allowCreate={false}
            confirmRequired={false}
            tiles={null}
            mode={mode}
            disableChange={false}
            detailedInfo={null}
            classNames={{
              input: '',
            }}
            allowRemove
            onRemove={() => {
              setLoc(null);
              setMode('search');
              onChange((({ uid, ...o }) => o)(value));
            }}
            location={loc}
            lang={lang}
            settings={null}
            res={{
              get: field.res.getLocationDetails,
              index: field.res.listLocations,
              staticTiles: field.res.staticTiles,
            }}
            onChange={(m, l) => locationSelectorOnChange(m, l)}
          />
        </Provider>
      </div>
      <div
        className={
          enabled ? 'form-group country' : 'form-group country disabled'
        }
      >
        <label htmlFor="Country">{labels.chooseDefaultCountry}</label>

        <Select
          disabled={!enabled}
          options={options}
          value={selectValue}
          onChange={(val) => {
            onChange({ ...value, countryCode: val.value });
          }}
          clearable={false}
        />
      </div>
    </>
  );
};
export default DefaultLocation;
