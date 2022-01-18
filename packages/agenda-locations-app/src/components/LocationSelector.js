import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
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
  agenda,
  res,
  lang,
  location,
  tiles,
  staticMapTiles,
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
}) => {
  console.log(location);
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

  const renderConfirmation = () => (
/*     <LocationConfirmation
      res={res}
      lang={lang}
      location={location}
      tiles={tiles}
      staticMapTiles={staticMapTiles}
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
      agenda={agenda}
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
      location={location}
      detailedInfo={
        (settings.eventForm
          && settings.eventForm.detailed)
        || detailedInfo
      }
      settings={settings}
      onCancel={switchToSearch}
      onSuccess={e => onSelect(false, e)}
      enableGeocode={enableGeocode}
      postRes={res.create}
      tiles={tiles}
      mode="create"
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

  return <div className="location-selector">{renderComponent()}</div>;
};

export default LocationSelector;
