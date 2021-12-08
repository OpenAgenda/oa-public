import React from 'react';
import { useSelector } from 'react-redux';
import qs from 'query-string';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Spinner, Pager, MoreInfo } from '@openagenda/react-shared';
import LocationItem from '../components/LocationItem';
import useLocations from '../hooks/useLocations';
import SearchInput from '../components/SearchInput';
import ActiveFilters from '../components/ActiveFilters';
import IncompleteLocationsFilterDropdown from '../components/IncompleteLocationsFilterDropdown';

const completedPrefix = (agenda, prefix) => prefix.replace(':agendaSlug', agenda.slug);

const messages = defineMessages({
  postalCode: {
    id: 'AgendaLocations.AgendaAdminLocation.postalCode',
    defaultMessage: 'postalCode',
  },
  toVerify: {
    id: 'AgendaLocations.AgendaAdminLocation.toVerify',
    defaultMessage: 'See locations to verify',
  },
  verifiedInfo: {
    id: 'AgendaLocations.AgendaAdminLocation.verifiedInfo',
    defaultMessage: 'Locations that were created on the fly on the event form get a "to be verified" status to allow agenda administrators to control them'
  },
  create: {
    id: 'AgendaLocations.AgendaAdminLocation.create',
    defaultMessage: 'Add a location',
  },
  merge: {
    id: 'AgendaLocations.AgendaAdminLocation.merge',
    defaultMessage: 'Merge locations',
  },
  cancelMerge: {
    id: 'AgendaLocations.AgendaAdminLocation.cancelMerge',
    defaultMessage: 'Cancel Merge',
  },
  closeModal: {
    id: 'AgendaLocations.AgendaAdminLocation.closeModal',
    defaultMessage: 'Close',
  },
  somethingWentWrong: {
    id: 'AgendaLocations.AgendaAdminLocation.somethingWentWrong',
    defaultMessage: 'An error has occurred, please contact support if it happens again',
  },
  mergeInProgress: {
    id: 'AgendaLocations.AgendaAdminLocation.mergeInProgress',
    defaultMessage: 'Merge is in progress',
  },
  total: {
    id: 'AgendaLocations.AgendaAdminLocation.total',
    defaultMessage: '{itemCount, plural, =0 {No location matches this search} one {Total: one location} other {Total: # locations}}',
  },
  contactSupport: {
    id: 'AgendaLocations.AgendaAdminLocation.contactSupport',
    defaultMessage: 'Contact support',
  },
  mergeDescription: {
    id: 'AgendaLocations.AgendaAdminLocation.mergeDescription',
    defaultMessage: 'Locations merge',
  },
  search: {
    id: 'AgendaLocations.AgendaAdminLocation.search',
    defaultMessage: 'Filter list',
  },
});

function Dashboard({
  agenda,
  history
}) {
  const intl = useIntl();
  const { pathname, search } = history.location;
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));
  const {
    isLoading,
    error,
    locations,
    total,
    size,
    page
  } = useLocations(agenda, qs.parse(search));
  console.log(history.location, pathname, search);
  console.log('locations:', locations);
  console.log('state', qs.parse(search).state === '0');

  const betterQsParseSearch = () => {
    const searchObj = qs.parse(search);
    const res = Object.keys(searchObj).reduce((acc, key) => {
      if (key.substr(0, 7) === 'hasNull') {
        if (acc.hasNull) acc.hasNull.push(searchObj[key]);
        else acc.hasNull = [searchObj[key]];
      } else acc[key] = searchObj[key];
      return acc;
    }, {});
    return res;
  };

  const betterQsStringifySearch = searchObj => {
    const res = Object.keys(searchObj).reduce((acc, key) => {
      if (key.substr(0, 7) === 'hasNull') {
        searchObj[key].forEach((e, index) => { acc[`hasNull[${index}]`] = e; });
      } else acc[key] = searchObj[key];
      return acc;
    }, {});
    return qs.stringify(res);
  };

  const nextPage = () => {
    history.push({
      pathname: `${prefix}/p/${page + 1}`,
      search
    });
  };

  const previousPage = () => {
    if (page >= 2) {
      history.push({
        pathname: `${prefix}/p/${page - 1}`,
        search
      });
    }
  };

  const removeFilter = key => {
    const searchObj = qs.parse(search);
    delete searchObj[key];
    if (key === 'hasNull') {
      for (const objKey in searchObj) {
        if (objKey.substr(0, 7) === 'hasNull') delete searchObj[objKey];
      }
    }
    history.push({ pathname: `${prefix}/p/1`, search: qs.stringify(searchObj) });
  };

  const removeHasNull = field => {
    const searchObj = betterQsParseSearch();
    searchObj.hasNull = searchObj.hasNull.filter(e => e !== field);
    history.push({ pathname: `${prefix}/p/1`, search: betterQsStringifySearch(searchObj) });
  };

  const addHasNull = field => {
    const searchObj = betterQsParseSearch();
    if (searchObj.hasNull) searchObj.hasNull.push(field);
    else searchObj.hasNull = [field];
    history.push({ pathname: `${prefix}/p/1`, search: betterQsStringifySearch(searchObj) });
  };

  return (
    <div className="agenda-admin-locations">
      <div className="row list-filters">
        <div className="col col-sm-12">
          <div className="form-inline">
            <div className="form-group">
              <SearchInput
                onChange={value => {
                  if (value !== '') {
                    return history.push({
                      pathname: `${prefix}/p/1`,
                      search: qs.stringify({ ...qs.parse(search), search: value })
                    });
                  }
                }}
                placeholder="Search..."
              />
              <div className="checkbox">
                <label htmlFor="checkbox">
                  <input
                    type="checkbox"
                    onChange={() => {
                      if (qs.parse(search).state) removeFilter('state');
                      else {
                        history.push({
                          pathname: `${prefix}/p/1`,
                          search: qs.stringify({ ...qs.parse(search), state: 0 })
                        });
                      }
                    }}
                    checked={!!qs.parse(search).state}
                  />{' '}
                  <FormattedMessage
                    {...messages.toVerify}
                  />
                </label>
                <MoreInfo
                  className="margin-h-sm"
                  id="checkbox-help"
                  content={intl.formatMessage(messages.verifiedInfo)}
                  placement="top"
                />
              </div>
              <IncompleteLocationsFilterDropdown
                country={locations?.[0]?.countryCode || 'FR'}
                search={qs.parse(search)}
                removeHasNull={removeHasNull}
                addHasNull={addHasNull}
              />
              <ActiveFilters
                removeFilter={removeFilter}
                searchObj={betterQsParseSearch()}
              />
            </div>
          </div>
        </div>
      </div>
      <p><FormattedMessage values={{ itemCount: total }} {...messages.total} /></p>
      {total > 20 ? (
        <Pager
          page={page}
          pageSize={size}
          total={total}
          previousPage={previousPage}
          nextPage={nextPage}
          previousMessage="Previous"
          nextMessage="Next"
        />
      ) : null}

      {isLoading ? (
        <i style={{ padding: '0.2em 0.65em' }}>
          <Spinner
            mode="inline"
            options={{
              width: 2,
              length: 3,
              radius: 4,
              color: '#666',
            }}
          />
        </i>
      ) : null}
      <ul className="list-unstyled">
        {locations ? locations.map(location => (
          <li key={location.uid}>
            <LocationItem
              getCountryLabel={() => 'test'}
              location={location}
              onSelect={() => null}
              settings={agenda.settings}
            />
          </li>
        )) : null}
      </ul>
      {total > 20 ? (
        <Pager
          page={page}
          pageSize={size}
          total={total}
          previousPage={previousPage}
          nextPage={nextPage}
          previousMessage="Previous"
          nextMessage="Next"
        />
      ) : null}
    </div>
  );
}

export default Dashboard;
