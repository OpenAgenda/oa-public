import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import geoFields from '@openagenda/agenda-locations/utils/geoFields';
import { Dropdown } from 'react-bootstrap';
import adminLevels from '../adminLevels';

const messages = {
  ...defineMessages({
    incompleteLocations: {
      id: 'AgendaLocations.DropdownIncompleteLocation.incompleteLocations',
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
  const hasNullSearch = search.hasNull;
  const intl = useIntl();
  const { fields } = geoFields();
  const hasHasNull = ad => !!(hasNullSearch || []).find(e => e === ad);

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
