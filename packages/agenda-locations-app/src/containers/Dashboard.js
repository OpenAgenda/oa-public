import React, {
  useMemo,
  useCallback,
  useState,
  useEffect
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router';
import qs from 'qs';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import axios from 'axios';
import { useQueryClient } from 'react-query';

import {
  Spinner,
  Pager,
  MoreInfo,
  Modal
} from '@openagenda/react-shared';
import MergeStepper from '../components/MergeStepper';
import LocationItem from '../components/LocationItem';
import LocationDetailModal from '../components/LocationDetailModal';
import useLocations from '../hooks/useLocations';
import useRes from '../hooks/useRes';
import useSettings from '../hooks/useSettings';
import SearchInput from '../components/SearchInput';
import ActiveFilters from '../components/ActiveFilters';
import IncompleteLocationsFilterDropdown from '../components/IncompleteLocationsFilterDropdown';
import AccessModal from '../components/AccessModal';
import RemoveModal from '../components/RemoveModal';
import SetHeader from '../components/SetHeader';
import * as mergeActions from '../reducers/merge';
import * as onGoinActions from '../reducers/onGoinModal';

const completedPrefix = (agenda, prefix) => prefix.replace(':agendaSlug', agenda.slug);

const betterQsParse = search => qs.parse(search, { ignoreQueryPrefix: true });

const betterQsStringify = searchObj => qs.stringify(searchObj, {
  addQueryPrefix: true,
  arrayFormat: 'brackets',
  skipNulls: true,
});

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
  information: {
    id: 'AgendaLocations.AgendaAdminLocation.information',
    defaultMessage: 'Information',
  },
  onGoing: {
    id: 'AgendaLocations.AgendaAdminLocation.onGoing',
    defaultMessage: 'is ongoing',
  },
});

function Dashboard({
  agenda,
  lang = 'fr',
}) {
  console.log('agendaUID', agenda.uid);
  const set = useSelector(state => state.set);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const merge = useSelector(state => state.merge);
  const onGoin = useSelector(state => state.onGoin);
  const [accessModal, setAccessModal] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const intl = useIntl();
  const res = useRes(agenda);
  const { locationUid: detailLocationUid } = useParams();
  const { settings } = useSettings(agenda);
  const prefix = completedPrefix(agenda, useSelector(state => state.settings.prefix));

  const history = useHistory();
  const historyLocation = useLocation();
  const { pathname } = historyLocation;
  const { mergeMode } = useMemo(() => {
    if (pathname.includes('merge') && settings?.access.merge.authorized) {
      dispatch(mergeActions.initiate());
      return { mergeMode: true };
    }
    return { mergeMode: false };
  }, [pathname, dispatch, settings?.access.merge.authorized]);

  useEffect(() => {
    if (!mergeMode && detailLocationUid) setOpenDetails(detailLocationUid);
  }, [mergeMode, detailLocationUid]);

  const { search, page } = useMemo(() => {
    const parsed = betterQsParse(historyLocation.search);
    const { page: retrivedPage, ...searchObj } = parsed;
    return {
      search: searchObj,
      page: parseInt(retrivedPage || '1', 10)
    };
  }, [historyLocation.search]);

  const {
    isLoading,
    error,
    locations,
    total,
    size,
  } = useLocations(agenda, page, search);

  const nextPage = useCallback(() => {
    history.push({
      search: betterQsStringify({ ...search, page: page + 1 })
    });
  }, [history, page, search]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      history.push({
        search: betterQsStringify({ ...search, page: page - 1 })
      });
    }
  }, [history, page, search]);

  const removeFilter = useCallback(key => {
    history.push({ search: betterQsStringify({ ...search, page: 1, [key]: undefined }) });
  }, [history, search]);

  const removeHasNull = useCallback(field => {
    history.push({
      search: betterQsStringify({
        ...search,
        page: 1,
        hasNull: search.hasNull.filter(e => e !== field)
      })
    });
  }, [history, search]);

  const addHasNull = useCallback(field => {
    history.push({
      search: betterQsStringify({
        ...search,
        page: 1,
        hasNull: [...search.hasNull || [], field]
      })
    });
  }, [history, search]);

  const onRemoveLocation = async (location, withEvents) => {
    console.log('onRemoveLocation', location, withEvents, res.remove);
    try {
      await axios.delete(res.remove.replace(':locationUid', location.uid), { data: { withEvents } });
    } catch (err) {
      console.log(err);
      return;
    }
    setRemoveModal(false);
    dispatch(onGoinActions.initiate('delete'));
    queryClient.resetQueries('locations');
  };

  const confirmRemove = useCallback(l => {
    console.log('confirmRemove', l);
    if (!settings.access.delete.authorized && settings.access.delete.external) setAccessModal({ action: 'remove' });
    else setRemoveModal({ data: { location: l } });
  }, [settings]);

  const onLocationItemEdit = useCallback(location => {
    if (settings?.access?.update?.authorized && !settings.access.update.external) {
      const nq = `${pathname}${betterQsStringify({ ...search, page })}`;
      history.push({
        pathname: `${prefix}/${location.uid}/edit`,
        state: nq
      });
    } else {
      setAccessModal({ action: 'edit', location });
      return false;
    }
  }, [history, page, pathname, prefix, search, settings]);

  const onLocationItemSelect = useCallback(location => {
    // handle merge behavior
    if (mergeMode) {
      if (merge?.step !== 1) return;
      const newLocationsUids = merge?.locationUids || [];
      if (!newLocationsUids.find(e => e === location.uid)) newLocationsUids.push(location.uid);
      dispatch(mergeActions.selectLocations(newLocationsUids));
      return;
    }
    // basic beahavior
    onLocationItemEdit(location);
  }, [onLocationItemEdit, dispatch, merge, mergeMode]);

  const renderMergeAction = useCallback(() => {
    if (mergeMode) {
      return (
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            history.push({ pathname: `${prefix}`, search: betterQsStringify({ ...search, page }) });
          }}
        >
          <FormattedMessage {...messages.cancelMerge} />
        </button>
      );
    }
    return (
      <button
        type="button"
        className={settings?.access.merge.authorized ? 'btn btn-default' : 'btn btn-default disabled'}
        onClick={() => {
          if (!settings?.access.merge.authorized || settings?.access.merge.external) {
            setAccessModal({ action: 'merge' });
          } else {
            history.push({ pathname: `${prefix}/merge`, search: betterQsStringify({ ...search, page }) });
          }
        }}
      >
        <FormattedMessage {...messages.merge} />
      </button>
    );
  }, [mergeMode, settings, search, page, prefix, history]);

  const launchMerge = () => {
    dispatch(mergeActions.launchMerge(merge, res, { pathname: prefix, search: betterQsStringify({ ...search, page, uids: null }) }));
    //QueryClient.resetQueries('locations');
  };

  const disqualifyMergeCandidates = () => {
    const data = merge.locationUids;
    console.log('disqualified', data);
    dispatch(mergeActions.disqualifyDuplicates(data, res, { pathname: prefix, search: betterQsStringify({ ...search, page }) }));
  };

  return (
    <div className="agenda-admin-locations">
      {set ? (
        <SetHeader set={set} res={res} />
      ) : null}
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
                    setAccessModal({ action: 'create' });
                  } else {
                    const nq = `${pathname}${betterQsStringify({ ...search, page })}`;
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
              {renderMergeAction()}
            </div>
          </div>
        </div>
      </div>
      {mergeMode ? (
        <MergeStepper
          merge={merge}
          dispatch={dispatch}
          mergeActions={mergeActions}
          seeDetails={setOpenDetails}
          seeSelection={() => history.push({ search: betterQsStringify({ ...search, page, uids: merge.locationUids }) })}
          closeMerge={() => {
            dispatch(mergeActions.closeMerge());
            history.push({ pathname: prefix, search: betterQsStringify({ ...search, page }) });
          }}
          disqualifyDuplicates={disqualifyMergeCandidates}
          launchMerge={launchMerge}
        />
      ) : null}
      {merge?.step === 2 || merge?.step === 3 ? null : (
        <>
          <div className="row list-filters">
            <div className="col col-sm-12">
              <div className="form-inline">
                <div className="form-group">
                  <SearchInput
                    onChange={value => {
                      if (value !== '') {
                        return history.push({
                          search: betterQsStringify({ ...search, page: 1, search: value })
                        });
                      } return history.push({
                        search: betterQsStringify({ ...search, page: 1, search: null })
                      });
                    }}
                    placeholder="Search..."
                  />
                </div>
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
                />
              </div>
            </div>
          </div>
          <p><FormattedMessage values={{ itemCount: total }} {...messages.total} /></p>
        </>
      )}

      {total > 20 && !!(merge?.step !== 3) ? (
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
        {locations && merge?.step !== 3 ? locations.map(location => (
          <li key={location.uid}>
            <LocationItem
              merge={merge}
              lang={lang}
              location={location}
              onSelect={onLocationItemSelect}
              onEdit={onLocationItemEdit}
              settings={settings}
              seeEventsRes={res.seeEvents}
              onRemove={confirmRemove}
              seeDetails={() => {
                if (!mergeMode) history.push({ pathname: `${prefix}/${location.uid}`, search: betterQsStringify({ ...search, page }) });
                else setOpenDetails(location.uid);
              }}
              goToMergeStep3={() => { dispatch(mergeActions.selectTarget(location)); }}
              goToMergeStep1FromDuplicates={() => {
                if (!settings?.access.merge.authorized || settings?.access.merge.external) {
                  setAccessModal({ action: 'merge' });
                } else {
                  const locationUids = location.duplicateCandidates.concat(location.uid);
                  dispatch(mergeActions.initiateFromDuplicates(locationUids, location.uid));
                  history.push({ pathname: `${prefix}/merge`, search: betterQsStringify({ ...search, page, uids: locationUids }) });
                }
              }}
            />
          </li>
        )) : null}
      </ul>
      {total > 20 && !!(merge.step !== 3) ? (
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
      {openDetails ? (
        <LocationDetailModal
          locationUid={openDetails}
          res={res}
          settings={settings}
          agenda={agenda}
          search={betterQsStringify({ ...search, page })}
          prefix={prefix}
          closeDetail={() => {
            if (!mergeMode) history.push({ pathname: `${prefix}`, search: betterQsStringify({ ...search, page }) });
            else setOpenDetails(false);
          }}
        />
      ) : null}
      {accessModal ? (
        <AccessModal
          action={accessModal.action}
          location={accessModal.location || null}
          settings={settings}
          close={() => setAccessModal(false)}
        />
      ) : null}
      {removeModal ? (
        <RemoveModal
          modal={removeModal}
          lang={lang}
          seeEventsLink={res.seeEvents}
          onClose={() => setRemoveModal(false)}
          onRemove={withEvents => onRemoveLocation(removeModal.data.location, withEvents)}
        />
      ) : null}
      {onGoin ? (
        <Modal
          title={intl.formatMessage(messages.information)}
          onClose={() => dispatch(onGoinActions.close())}
        >
          {`${onGoin.name} ${intl.formatMessage(messages.onGoing)}`}
        </Modal>
      ) : null}
    </div>
  );
}

export default Dashboard;
