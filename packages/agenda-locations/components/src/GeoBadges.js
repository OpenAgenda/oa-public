import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import debug from 'debug';
import geoFields from './geoFields';
import adminLevels from './adminLevels';

const log = debug('GeoBadges');

const messages = {
  ...defineMessages({
    insee: {
      id: 'AgendaLocations.GeoBadges.insee',
      defaultMessage: 'INSEE code',
    },
    geocodeNoResults: {
      id: 'AgendaLocations.GeoBadges.geocodeNoResults',
      defaultMessage: 'We could not locate this address. Start over by typing the name of the town or city only, position the marker on the map in the right location and then specify the complete address once the marker is correctly placed.',
    },
    geocodeFieldSave: {
      id: 'AgendaLocations.GeoBadges.geocodeFieldSave',
      defaultMessage: 'Ok',
    },
    geocodeFieldCancel: {
      id: 'AgendaLocations.GeoBadges.geocodeFieldCancel',
      defaultMessage: 'Cancel',
    },
  }),
  ...adminLevels
};

class GeoBadges extends PureComponent {
  static propTypes = {
    enableGeocode: PropTypes.bool,
    geocodeNoResults: PropTypes.bool,
    geocodeEdit: PropTypes.string,
    geocodeEditValue: PropTypes.string,
    setGeocodeFieldValue: PropTypes.func.isRequired,
    cancelEditGeocode: PropTypes.func.isRequired,
    editGeocode: PropTypes.func.isRequired,
    location: PropTypes.object, // eslint-disable-line
    intl: PropTypes.object.isRequired, // eslint-disable-line
  };

  static defaultProps = {
    enableGeocode: true,
    geocodeNoResults: false,
    geocodeEdit: null,
    geocodeEditValue: null,
    location: null
  };

  render() {
    const {
      location, geocodeNoResults, editGeocode, geocodeEdit, geocodeEditValue, setGeocodeFieldValue, cancelEditGeocode, intl
    } = this.props;
    log(location);
    const geo = geoFields(location.countryCode).fields.map(e => ({ ...e, value: location?.[e.field] }));

    if (geocodeEdit) {
      return (
        <div className="form-inline margin-v-xs">
          <div className="form-group">
            <input
              className="form-control margin-right-xs"
              placeholder={intl.formatMessage(messages[geo.find(e => e.field === geocodeEdit).label])}
              type="text"
              onChange={e => editGeocode(geocodeEdit, e.target.value)}
              value={geocodeEditValue}
            />
            <button
              type="button"
              className="btn btn-primary margin-right-xs"
              onClick={() => setGeocodeFieldValue(
                geocodeEdit,
                geocodeEditValue
              )}
            >
              <FormattedMessage {...messages.geocodeFieldSave} />
            </button>
            <button
              type="button"
              className="btn btn-default"
              onClick={() => cancelEditGeocode()}
            >
              <FormattedMessage {...messages.geocodeFieldCancel} />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div>
        {geocodeNoResults ? (
          <div className="alert alert-warning" role="alert">
            <a href="#" className="alert-link">
              <FormattedMessage {...messages.geocodeNoResults} />
            </a>
          </div>
        ) : null}
        <ul className="list-inline">
          {geo.map(field => (
            <li key={`geo-${field.field}`}>
              <button
                type="button"
                className={
                  `badge badge-default margin-bottom-xs ${
                    (field.value
                      ? 'badge-outline-primary'
                      : 'badge-outline-warn')
                  }`
                }
                onClick={() => editGeocode(
                  field.field,
                  location[field.field]
                )}
              >
                <span>
                  <FormattedMessage {...messages?.[field.label]} />: {field.value}&nbsp;
                </span>
                <i className="fa fa-pencil" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default injectIntl(GeoBadges);
