import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';

const messages = defineMessages({
  state: {
    id: 'AgendaLocations.Filters.verify',
    defaultMessage: 'To verify',
  },
  hasNull: {
    id: 'AgendaLocations.Filters.uncompletedLocations',
    defaultMessage: 'Uncomplete locations',
  },
});

const ActiveFilters = ({
  // betterQsParse,
  search,
  removeFilter,
}) => {
/*   const location = useLocation();
  const search = betterQsParse(location.search);
  if (search.page) delete search.page; */
  const intl = useIntl();
  const getFilterList = () => Object.keys(search).reduce((acc, key) => {
    acc.push({ [key]: search[key] });
    return acc;
  }, []);
  console.log(' activeFilters search', search);
  console.log('filter list for activeFitlers', getFilterList());
  const getLabel = f => {
    const key = Object.keys(f)[0];
    if (key === 'search') return f[key];
    return intl.formatMessage(messages[key]);
  };

  const renderItem = f => {
    const key = Object.keys(f)[0];
    return (
      <div className="badge badge-info margin-right-sm" key={key}>
        {getLabel(f)}
        <button
          className="btn btn-link btn-link-inline margin-left-xs"
          type="button"
          onClick={() => removeFilter(key)}
        >
          <i className="fa fa-times" aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <div className="margin-v-sm">
      {getFilterList().map(f => renderItem(f))}
    </div>
  );
};

export default ActiveFilters;
