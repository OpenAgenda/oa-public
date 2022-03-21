import React, { useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import axios from 'axios';
import validate from '../validate';
import LocationForm from './form-components/LocationForm';
import LocationSearch from './LocationSearch';

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
  }
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
  tiles
}) => {
  const [errors, setErrors] = useState(false);

  const onSelect = l => {
    onChange(confirmRequired ? 'confirm' : 'show', l);
  };

  const onConfirm = () => {
    onChange('show', location);
  };

  const onCreateRequest = value => {
    onChange('create', { name: value });
  };

  const switchToSearch = l => {
    onChange('search', l);
  };

  const onSubmit = loc => {
    let clean;
    const options = {
      optional: false,
      isEnabled: settings?.displayImageRightsConfirmCheckbox
    };
    try {
      clean = validate(loc, settings, options);
    } catch (err) {
      setErrors(err);
      return;
    }
    const form = new FormData();
    if (clean.image instanceof File) form.append('image', clean.image);
    delete clean.image;
    form.append('data', JSON.stringify(clean));
    axios.post(res.create, form)
      .then(result => {
        onSelect(result.data.location);
      }).catch(err => {
        console.log(err);
      });
  };

  const renderConfirmation = () => (
/*     <LocationConfirmation
      res={res}
      lang={lang}
      location={location}
      tiles={tiles}
      staticMapTiles={staticTiles}
      settings={settings}
      onConfirm={onConfirm}
      onCancel={switchToSearch}
    /> */
    <div>CONFIRMATION</div>
  );

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
          <button
            type="button"
            onClick={() => switchToSearch(location)}
            className="btn btn-default"
          >
            {location ? <FormattedMessage {...messages.change} /> : <FormattedMessage {...messages.find} />}
          </button>
        </div>
      ) : null}
      {location ? (
        <div>
          <div className="name">{location.name}</div>
          <div className="address">{location.address}</div>
        </div>
      ) : (
        <div>
          <p className="nolocation"><FormattedMessage {...messages.noLocation} /></p>
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
      onSelect={e => onSelect(e)}
    />
  );

  const renderHeader = () => (
    <div className="head">
      <h2><FormattedMessage {...messages.title} /></h2>
      <span className="info"><FormattedMessage {...messages.info} /></span>
    </div>
  );

  const renderCreateForm = () => (
    <LocationForm
      Header={renderHeader()}
      res={res}
      lang={lang}
      locationProp={location}
      detailedInfo={
        (settings.eventForm
          && settings.eventForm.detailed)
        || detailedInfo
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

  const renderComponent = () => {
    if (mode === 'search') {
      return renderSearch();
    } if (mode === 'create') {
      return renderCreateForm();
    } if (mode === 'confirm') {
      return renderConfirmation();
    }
    return renderSelected();
  };

  return (
    <div className="location-selector">
      {renderComponent()}
    </div>
  );
};

export default LocationSelector;
