import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Dropdown } from 'react-bootstrap';
import geoFields from './geoFields';
import adminLevels from './adminLevels';

const messages = {
  ...defineMessages({
    incompleteLocations: {
      id: 'AgendaLocations.DropdownIncompleteLocation.incompleteLocations',
      defaultMessage: 'See incomplete Locations',
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
        <div className="checkbox padding-all-xs padding-h-sm">
          <label htmlFor={ad.field}>
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
      <Dropdown
        id="incomplete-location-filters-dropdown"
        className="btn-link-dropdown margin-left-sm incomplete-dropdown"
      >
        <Dropdown.Toggle className="btn-link" bsRole="toggle">
          {intl.formatMessage(messages.incompleteLocations)}
        </Dropdown.Toggle>
        <Dropdown.Menu bsRole="menu">
          {fields.map(element => elem(element))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default injectIntl(DropdownUncompleteLocation);
