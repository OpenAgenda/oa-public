import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Dropdown } from 'react-bootstrap';
import adminLevels from '../adminLevels';
import geoFields from '../geoFields';

const messages = {
  ...defineMessages({
    incompleteLocations: {
      id: 'AgendaLocations.DropdownUncompleteLocation.incompleteLocations',
      defaultMessage: 'See incomplete Locations',
    }
  }),
  ...adminLevels
};

const IncompleteLocationsFilterDropdown = ({
  country,
  search,
  removeHasNull,
  addHasNull,
}) => {
  const queryObj = () => {
    const res = {};
    for (const key in search) {
      if (key.substr(0, 7) === 'hasNull') {
        res.hasNull ? res.hasNull.push(search[key]) : res.hasNull = [search[key]];
      }
    }
    return res;
  };
  const hasNullSearch = queryObj();
  //console.log('drop search', search, search.hasNull, hasNullSearch);
  const intl = useIntl();
  const { fields } = geoFields();
  const hasHasNull = ad => !!(hasNullSearch.hasNull || []).find(e => e === ad);
  // console.log('hashasNull', hasHasNull('adminLevel1'));
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
            onChange={() => {
              // console.log('change', ad.field);
              if (hasHasNull(ad.field)) removeHasNull(ad.field);
              else addHasNull(ad.field);
            }}
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
};

export default IncompleteLocationsFilterDropdown;
