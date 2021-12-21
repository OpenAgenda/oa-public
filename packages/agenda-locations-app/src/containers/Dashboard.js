import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import qs from 'query-string';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import axios from 'axios';

import { Spinner, Pager, MoreInfo, Modal } from '@openagenda/react-shared';
import LocationItem from '../components/LocationItem';
import LocationDetailModal from '../components/LocationDetailModal';
import useLocations from '../hooks/useLocations';
import useRes from '../hooks/useRes';
import useSettings from '../hooks/useSettings';
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
}) {
  const intl = useIntl();
  const res = useRes(agenda);
  const { locationUid: detailLocationUid } = useParams();
  const { settings } = useSettings(agenda);
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));

  const history = useHistory();
  const pathname = useMemo(() => history.location.pathname, [history.location.pathname]);

  const betterQsParse = search => {
    const searchObj = qs.parse(search);
    const resp = Object.keys(searchObj).reduce((acc, key) => {
      if (key.substring(0, 7) === 'hasNull') {
        if (acc.hasNull) acc.hasNull.push(searchObj[key]);
        else acc.hasNull = [searchObj[key]];
      } else acc[key] = searchObj[key];
      return acc;
    }, {});
    return resp;
  };

  const betterQsStringify = searchObj => {
    const resp = Object.keys(searchObj).reduce((acc, key) => {
      if (key.substring(0, 7) === 'hasNull') {
        searchObj[key].forEach((e, index) => { acc[`hasNull[${index}]`] = e; });
      } else acc[key] = searchObj[key];
      return acc;
    }, {});
    return qs.stringify(resp);
  };

  const { search, page } = useMemo(() => {
    const searchObj = betterQsParse(history.location.search);
    const { page: retrivedPage } = searchObj;
    delete searchObj.page;
    return {
      search: searchObj,
      page: parseInt(retrivedPage || '1', 10)
    };
  }, [history.location.search]);

  console.log(history, pathname, search, page);

  const {
    isLoading,
    error,
    locations,
    total,
    size,
  } = useLocations(agenda, page);

  const nextPage = () => {
    history.push({
      search: betterQsStringify({ ...search, page: page + 1 })
    });
  };

  const previousPage = () => {
    if (page >= 2) {
      history.push({
        search: betterQsStringify({ ...search, page: page - 1 })
      });
    }
  };

  const removeFilter = key => {
    delete search[key];
    history.push({ search: betterQsStringify({ ...search, page }) });
  };

  const removeHasNull = field => {
    search.hasNull = search.hasNull.filter(e => e !== field);
    history.push({ search: betterQsStringify({ ...search, page }) });
  };

  const addHasNull = field => {
    if (search.hasNull) search.hasNull.push(field);
    else search.hasNull = [field];
    history.push({ search: betterQsStringify({ ...search, page }) });
  };

  const onLocationItemEdit = location => {
    if (settings.access.update.authorized && !settings.access.update.external) {
      const nq = `${pathname}?${betterQsStringify({ ...search, page })}`;
      history.push({
        pathname: `${prefix}/${location.uid}/edit`,
        state: nq
      });
    } else {
      // display action Modal
      return false;
    }
  };

  const onLocationItemSelect = location => {
    // handle merge behavior
    // basic beahavior
    onLocationItemEdit(location);
  };

  return (
    <div className="agenda-admin-locations">
      {/* setHeader */}
      <div className="row list-actions">
        <div className="col col-sm-12">
          <div className="form-inline">
            <div className="form-group">
              <div className="btn-group margin-left-sm">
                <a href={res.csv} className="btn btn-default">
                  <span>csv</span>
                </a>
                <a href={res.xlsx} className="btn btn-default">
                  <span>xlsx</span>
                </a>
              </div>
            </div>
            <div className="form-group">
              <button
                type="button"
                className={settings?.access?.create?.authorized ? 'btn btn-primary' : 'btn btn-primary disabled'}
                onClick={() => {
                  if (!settings?.access.create.authorized || settings?.access.create.external) {
                    // this.displayActionModal('create');
                    console.log('click');
                  } else {
                    const nq = `${pathname}?${betterQsStringify({ ...search, page })}`;
                    history.push({
                      pathname: `${prefix}/create`,
                      state: nq
                    });
                  }
                }}
              >
                <FormattedMessage {...messages.create} />
              </button>
            </div>
            <div className="form-group">
              {/* this.renderMergeAction() */}
            </div>
          </div>
        </div>
      </div>
      <div className="row list-filters">
        <div className="col col-sm-12">
          <div className="form-inline">
            <div className="form-group">
              <SearchInput
                onChange={value => {
                  if (value !== '') {
                    return history.push({
                      search: betterQsStringify({ ...search, page, search: value })
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
                      if (search.state) removeFilter('state');
                      else {
                        history.push({
                          search: betterQsStringify({ ...search, page, state: 0 })
                        });
                      }
                    }}
                    checked={!!search.state}
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
                search={search}
                removeHasNull={removeHasNull}
                addHasNull={addHasNull}
              />
              <ActiveFilters
                removeFilter={removeFilter}
                search={search}
              // betterQsParse={betterQsParse}
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
              onSelect={onLocationItemSelect}
              onEdit={onLocationItemEdit}
              settings={agenda.settings}
              seeDetails={() => {
                history.push({ pathname: `${prefix}/${location.uid}`, search: betterQsStringify({ ...search, page }) });
              }}
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
      {detailLocationUid ? (
        <LocationDetailModal
          locationUid={detailLocationUid}
          res={res}
          settings={settings}
          agenda={agenda}
          search={betterQsStringify({ ...search, page })}
          prefix={prefix}
        />
      ) : null}
    </div>
  );
}

export default Dashboard;
