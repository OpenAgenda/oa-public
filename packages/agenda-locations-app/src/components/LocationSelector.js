import { useState, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import axios from 'axios';
import { Modal } from '@openagenda/react-shared';
import validate from '../validate';
import LocationForm from './form-components/LocationForm';
import LocationSearch from './LocationSearch';
import LocationConfirmation from './LocationConfirmation';
import LocationDetail from './LocationDetailsConfirm';

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
}) => {
  const [errors, setErrors] = useState(false);
  const [seeDetails, setSeeDetails] = useState(false);
  const [awaitPost, setAwaitPost] = useState(false);

  const [detailedLocation, setDetailedLocation] = useState();

  useEffect(() => {
    if (seeDetails && location?.uid) {
      axios.get(res.get.replace(':locationUid', location.uid), {}).then(response => {
        const { data } = response;
        setDetailedLocation(data);
      });
    }
  }, [res.get, location?.uid, seeDetails]);

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
      isEnabled: settings?.displayImageRightsConfirmCheckbox,
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
    setAwaitPost(true);
    axios.post(res.create, form)
      .then(result => {
        onSelect(result.data.location);
        setAwaitPost(false);
      }).catch(err => {
        console.log(err);
        setAwaitPost(true);
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
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setSeeDetails(true)}
          >
            <FormattedMessage {...messages.see} />
          </button>
          <button
            type="button"
            onClick={() => switchToSearch()}
            className="btn btn-default"
          >
            {location ? <FormattedMessage {...messages.change} /> : <FormattedMessage {...messages.find} />}
          </button>
        </div>
      ) : null}
      {seeDetails && detailedLocation ? (
        <Modal
          classNames={{ overlay: 'popup-overlay big' }}
          onClose={() => setSeeDetails(false)}
        >
          <LocationDetail
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
      awaitPost={awaitPost}
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
