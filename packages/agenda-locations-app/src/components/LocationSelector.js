import { useState, useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Modal } from '@openagenda/react-shared';
import validate from '../validate.js';
import LocationForm from './form-components/LocationForm.js';
import LocationSearch from './LocationSearch.js';
import LocationConfirmation from './LocationConfirmation.js';
import LocationDetail from './LocationDetailsConfirm.js';

const messages = defineMessages({
  change: {
    id: 'AgendaLocations.LocationSelector.change',
    defaultMessage: 'change',
  },
  find: {
    id: 'AgendaLocations.LocationSelector.find',
    defaultMessage: 'Find',
  },
  remove: {
    id: 'AgendaLocations.LocationSelector.remove',
    defaultMessage: 'Remove',
  },
  noLocation: {
    id: 'AgendaLocations.LocationSelector.noLocation',
    defaultMessage: 'Select a location',
  },
  title: {
    id: 'AgendaLocations.LocationSelector.title',
    defaultMessage: 'Create a location',
  },
  info: {
    id: 'AgendaLocations.LocationSelector.info',
    defaultMessage: 'Define the name, address and exact location of the place',
  },
  see: {
    id: 'AgendaLocations.LocationSelector.see',
    defaultMessage: 'See',
  },
  invalidSIRET: {
    id: 'AgendaLocations.LocationSelector.invalidSIRET',
    defaultMessage: 'SIRET must be a 14 characters-long number',
  },
});

const LocationSelector = ({
  res,
  lang,
  location,
  onChange,
  onRemove,
  mode = 'create',
  enableGeocode = true,
  disableChange = false,
  allowCreate = true,
  confirmRequired = false,
  detailedInfo = false,
  settings = {
    eventForm: {
      detailed: false,
    },
  },
  allowRemove = false,
  tiles,
  staticMapTiles,
  enableDetails = true,
  placeholder = null,
}) => {
  const [errors, setErrors] = useState(false);
  const [seeDetails, setSeeDetails] = useState(false);
  const intl = useIntl();

  const [detailedLocation, setDetailedLocation] = useState();

  useEffect(() => {
    if (seeDetails && location?.uid) {
      fetch(res.get.replace(':locationUid', location.uid))
        .then((response) => {
          if (!response.ok) return;
          return response.json();
        })
        .then((data) => {
          setDetailedLocation(data);
        });
    }
  }, [res.get, location?.uid, seeDetails]);

  const onSelect = (l) => {
    onChange(confirmRequired ? 'confirm' : 'show', l);
  };

  const onConfirm = () => {
    onChange('show', location);
  };

  const onCreateRequest = (value) => {
    onChange('create', { name: value });
  };

  const switchToSearch = (l) => {
    onChange('search', l);
  };

  const onSubmit = (loc) => {
    let clean;
    try {
      clean = validate(loc, settings, {
        optional: false,
        isEnabled: settings?.displayImageRightsConfirmCheckbox,
        displaySIRETInput: settings?.displaySIRETInput,
        invalidSIRET: intl.formatMessage(messages.invalidSIRET),
      });
    } catch (err) {
      setErrors(err);
      return;
    }
    const form = new FormData();
    if (clean.image instanceof File) form.append('image', clean.image);
    delete clean.image;
    form.append('data', JSON.stringify(clean));

    return fetch(res.create, {
      method: 'POST',
      body: form,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((result) => {
        onSelect(result.location);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const renderSelected = () => (
    <div className="selected-location">
      {!disableChange ? (
        <div className="actions">
          {allowRemove && location ? (
            <button
              type="button"
              onClick={onRemove}
              className="btn btn-link text-danger action"
            >
              <FormattedMessage {...messages.remove} />
            </button>
          ) : null}
          {enableDetails ? (
            <button
              type="button"
              className="btn btn-link"
              onClick={() => setSeeDetails(true)}
            >
              <FormattedMessage {...messages.see} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => switchToSearch()}
            className="btn btn-default"
          >
            {location ? (
              <FormattedMessage {...messages.change} />
            ) : (
              <FormattedMessage {...messages.find} />
            )}
          </button>
        </div>
      ) : null}
      {seeDetails && detailedLocation ? (
        <Modal
          classNames={{ overlay: 'popup-overlay big' }}
          onClose={() => setSeeDetails(false)}
        >
          <LocationDetail
            res={res}
            location={detailedLocation}
            settings={settings}
            lang={lang}
            staticTiles={res.staticTiles}
          />
        </Modal>
      ) : null}
      {location ? (
        <div>
          <div className="name">{location.name}</div>
          <div className="address">{location.address}</div>
        </div>
      ) : (
        <div>
          <p className="nolocation">
            <FormattedMessage {...messages.noLocation} />
          </p>
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <LocationSearch
      init={location ? location.name : ''}
      res={res}
      allowCreate={allowCreate}
      onCreateRequest={onCreateRequest}
      onSelect={(e) => onSelect(e)}
      placeholder={placeholder}
      settings={settings}
    />
  );

  const renderHeader = () => (
    <div className="head">
      <h2>
        <FormattedMessage {...messages.title} />
      </h2>
      <span className="info">
        <FormattedMessage {...messages.info} />
      </span>
    </div>
  );

  const renderCreateForm = () => (
    <LocationForm
      Header={renderHeader()}
      res={res}
      lang={lang}
      locationProp={location}
      detailedInfo={
        (settings.eventForm && settings.eventForm.detailed) || detailedInfo
      }
      settings={settings}
      onCancel={switchToSearch}
      onSubmit={onSubmit}
      enableGeocode={enableGeocode}
      postRes={res.create}
      tiles={tiles}
      mode="create"
      errors={errors}
    />
  );

  const renderConfirmation = () => (
    <LocationConfirmation
      res={res}
      lang={lang}
      location={location}
      tiles={tiles}
      staticMapTiles={staticMapTiles}
      settings={settings}
      onConfirm={onConfirm}
      onCancel={switchToSearch}
    />
  );

  const renderComponent = () => {
    if (mode === 'search') {
      return renderSearch();
    }
    if (mode === 'create') {
      return renderCreateForm();
    }
    if (mode === 'confirm') {
      return renderConfirmation();
    }
    return renderSelected();
  };

  return <div className="location-selector">{renderComponent()}</div>;
};

export default LocationSelector;
