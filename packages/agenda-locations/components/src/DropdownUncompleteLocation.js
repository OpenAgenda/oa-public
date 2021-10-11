import React, { PureComponent } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import geoFields from '../../lib/geoFields';
import adminLevels from './adminLevels';

const messages = {
  ...defineMessages({
    uncompletedLocations: {
      id: 'AgendaLocations.DropdownUncompleteLocation.uncompletedLocations',
      defaultMessage: 'See uncompleted Locations',
    }
  }),
  ...adminLevels
};

class DropdownUncompleteLocation extends PureComponent {
  render() {
    const {
      intl, getQuery, onSearchChange, country
    } = this.props;
    const { fields } = geoFields();
    const hasHasNull = ad => !!(getQuery().hasNull || []).find(e => e === ad);
    const removeHasNull = ad => (getQuery().hasNull || []).filter(hs => hs !== ad) || undefined;
    const pushHasNull = ad => (getQuery().hasNull || []).concat([ad]);
    const completedLabel = (ad, countryCode) => {
      if (ad.label === geoFields(countryCode, ad.field)) return intl.formatMessage(messages[ad.label]);
      return `${intl.formatMessage(messages[ad.label])} (${intl.formatMessage(messages[geoFields(countryCode, ad.field)])})`;
    };
    const elem = ad => (
      <li key={ad.field}>
        <div className="checkbox margin-h-sm">
          <label htmlFor="checkbox">
            <input
              type="checkbox"
              id={ad.field}
              onChange={onSearchChange.bind(
                this,
                'hasNull',
                hasHasNull(ad.field) ? removeHasNull(ad.field) : pushHasNull(ad.field)
              )}
              checked={hasHasNull(ad.field)}
            />{' '}
            {completedLabel(ad, country)}
          </label>
        </div>
      </li>
    );
    return (
      <span className="dropdown">
        <button
          className="btn btn-link btn-link-inline dropdown-toggle"
          type="button"
          id="uncompletedDropdownMenu"
          data-toggle="dropdown"
        >
          <FormattedMessage
            {...messages.uncompletedLocations}
          />
          &nbsp;
          <i className="fa fa-lg fa-angle-down" />
        </button>
        <ul className="dropdown-menu" aria-labelledby="uncompletedDropdownMenu">
          {fields.map(element => elem(element))}

        </ul>
      </span>
    );
  }
}

export default injectIntl(DropdownUncompleteLocation);
