import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';

import debug from 'debug';
import extraGeoFields from './extraGeoFields';
import adminLevels from './adminLevels';

const log = debug('GeoBadges');

const messages = {
  ...defineMessages({
    postalCode: {
      id: 'AgendaLocations.GeoBadges.postalCode',
      defaultMessage: 'Postal code',
    },
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

class GeoBadges extends Component {
  static propTypes = {
    enableGeocode: PropTypes.bool,
    geocodeNoResults: PropTypes.bool,
    geocodeEdit: PropTypes.string,
    geocodeEditValue: PropTypes.string,
    setGeocodeFieldValue: PropTypes.func.isRequired,
    cancelEditGeocode: PropTypes.func.isRequired,
    editGeocode: PropTypes.func.isRequired,
    location: PropTypes.object,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    enableGeocode: true,
    geocodeNoResults: false,
    geocodeEdit: null,
    geocodeEditValue: null,
    location: null
  };

  getAdminLabel(field) {
    const { location, intl } = this.props;
    const countryCode = location.countryCode.toUpperCase();
    if (messages[`${field}_${countryCode}`]) {
      return intl.formatMessage(messages[`${field}_${countryCode}`]);
    }
    return (intl.formatMessage(messages[field]));
  }

  render() {
    const {
      location, enableGeocode, geocodeNoResults, editGeocode, geocodeEdit, geocodeEditValue, setGeocodeFieldValue, cancelEditGeocode
    } = this.props;
    log(messages);
    const geo = {};
    ['adminLevel1', 'adminLevel2', 'adminLevel4', 'adminLevel6', 'postalCode', 'insee'].forEach(field => {
      if (enableGeocode && !location?.[field]) {
        return;
      }
      geo[field] = location?.[field];
    });
    extraGeoFields(location.countryCode).forEach(field => {
      geo[field] = location?.[field];
    });

    if (geocodeEdit) {
      return (
        <div className="form-inline margin-v-xs">
          <div className="form-group">
            <input
              className="form-control margin-right-xs"
              placeholder={this.getAdminLabel(geocodeEdit)}
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
          {Object.keys(geo).map(field => (
            <li key={`geo-${field}`}>
              <button
                type="button"
                className={
                  `badge badge-default margin-bottom-xs ${
                    (geo[field] && geo[field].length
                      ? 'badge-outline-primary'
                      : 'badge-outline-warn')
                  }`
                }
                onClick={() => editGeocode(
                  field,
                  location[field]
                )}
              >
                <span>
                  {this.getAdminLabel(field)}: {geo[field]}&nbsp;
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
