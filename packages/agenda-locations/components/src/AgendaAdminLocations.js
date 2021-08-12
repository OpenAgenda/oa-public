import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import xhr from 'xhr';

import countries from '@openagenda/countries';
import get from '@openagenda/utils/get';
import Modal from '@openagenda/react-shared/src/components/Modal';
import MoreInfo from '@openagenda/react-shared/src/components/MoreInfo';
import SearchField from '@openagenda/react-form-components/build/SearchField';
import debug from 'debug';

import actions from './actions';
import CreateForm from './CreateForm';
import Filters from './Filters';
import List from './List/List';
import LocationItem from './LocationItem';
import SetHeader from './SetHeader';
import UpdateForm from './UpdateForm';
import AdminActionModal from './AdminActionModal';
import LocationDetails from './LocationDetails';
import RemoveModal from './RemoveModal';
import MergeStepper from './MergeStepper';
import post from './post';

const log = debug('AgendaAdminLocations');

const messages = defineMessages({
  toVerify: {
    id: 'AgendaLocations.AgendaAdminLocation.toVerify',
    defaultMessage: 'See locations to verify',
  },
  verifiedInfo: {
    id: 'AgendaLocations.AgendaAdminLocation.verifiedInfo',
    defaultMessage: 'Locations that were created on the fly on the event form get a \"to be verified\" status to allow agenda administrators to control them'
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

const loaded = {};

class AgendaAdminLocations extends Component {
  static defaultProps = {
    lang: 'fr',
    enableGeocode: true,
    set: null,
    settings: {
      access: {
        create: true,
        update: true,
        merge: true,
        delete: true
      }
    },
  };

  static propTypes = {
    lang: PropTypes.string,
    enableGeocode: PropTypes.bool,
    // set details
    set: PropTypes.object,
    // optional settings of agenda (such as tags requirements)
    settings: PropTypes.object,
    // server endpoints
    res: PropTypes.object.isRequired,
    // general agenda info (title, slug,)
    agenda: PropTypes.object.isRequired,
    tiles: PropTypes.string.isRequired,
    staticTiles: PropTypes.string.isRequired,
    intl: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    const state = {
      merge: false,
      loading: false,
      form: false,
      query: {},
      locations: [],
      page: 1,
      total: null,
      modal: false,
    };

    this.actions = actions({
      getState: () => this.state,
      setState: newState => this.setState(newState),
    });

    this.state = state;
    // Binding
    this.onSearchChange = this.onSearchChange.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderHead = this.renderHead.bind(this);
    this.getCountryLabel = this.getCountryLabel.bind(this);
    this.displayActionModal = this.displayActionModal.bind(this);
  }

  onSearchChange(field, newSearchValue) {
    if (arguments.length === 1) {
      this.onSearchChange('search', field);
    }

    this.actions.queryChange(
      actions.updateSearchQuery(this.actions.getQuery(), field, newSearchValue)
    );
  }

  onRemoveLocation(location, index, withEvents) {
    const { res } = this.props;
    log('withEvents option:', withEvents);
    xhr(
      {
        uri: withEvents
          ? res.remove.replace(':locationUid', location.uid).concat('?removeEvents=true')
          : res.remove.replace(':locationUid', location.uid),
        method: 'delete',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
      },
      (err, result) => {
        if (err || result.statusCode !== 200) {
          debug('error', err || result.statusCode);
        } else if (JSON.parse(result.body).location) {
          this.actions.removedLocation(index); // remove index from list
        }
      }
    );
  }

  onLocationEdit(location, locationIndex) {
    const { settings } = this.props;

    if (settings.access.update.authorized && !settings.access.update.external) {
      this.actions.editLocation(location, locationIndex);
    } else {
      this.displayActionModal('edit', location);
    }
  }

  onLocationSelect(location, locationIndex) {
    const { merge } = this.state;

    if (merge) {
      if (merge?.step !== 1) return;
      this.actions.toggleMergeItem(location);
    } else {
      this.onLocationEdit(location, locationIndex);
    }
  }

  getCountryLabel(code) {
    const { lang } = this.props;
    if (loaded[code] === undefined) {
      loaded[code] = countries.getLabel(code);
    }

    return loaded[code] !== null ? loaded[code][lang] : null;
  }

  getMode() {
    const { form, merge } = this.state;
    if (!form) {
      return 'list';
    }
    if (form.alternatives && merge) {
      return 'merge';
    }
    if (form.location) {
      return 'update';
    }
    return 'create';
  }

  goToMergeStep3(location) {
    const { merge } = this.state;

    if (merge) {
      this.actions.goToMergeStep3(location);
    }
  }

  goToMergeStep1FromDuplicates(location) {
    const { merge } = this.state;

    if (!merge) {
      this.actions.goToMergeStep1FromDuplicates(location);
      log(merge);
      this.onSearchChange('uids', location?.duplicateCandidates.concat(location.uid));
    }
  }

  launchMerge() {
    const { res } = this.props;
    const { merge } = this.state;
    const merged = merge.locationUids.filter(uid => uid !== merge.target.uid);
    const timeOut = 1000;
    if (!merge.target) {
      log('no target for merge!!');
    }
    if (!merge || !merge.target.uid || !merge.locationUids.length) return;

    const body = {
      mergeIn: merge.target.uid,
      merged,
    };

    this.actions.mergeOnGoing();

    post(res.merge, body, (err, result) => {
      if (err) {
        log('error', err);
        this.actions.changeMergeModal(err);
        return;
      }
      if (!result.success) {
        log('no success');
        this.actions.changeMergeModal(result);
      }
      if (result.success) {
        setTimeout(() => { this.actions.closeMerge(); }, timeOut);
      }
      log('state:', this.state);
    });
  }

  disqualifyMergeCandidates() {
    const { res } = this.props;
    const { merge } = this.state;
    const data = merge.locationUids;
    log('disqualified', data);

    post(res.disqualifyDuplicates, { uids: data }, (err, result) => {
      if (err) {
        log('error', err);
        return;
      }
      if (!result.success) {
        log('no success');
      } if (result.success) {
        this.actions.closeMerge();
      }
    });
    this.actions.closeMerge();
  }

  displayActionModal(accessType, location) {
    this.setState({
      modal: {
        type: 'actions',
        data: {
          accessType,
          location
        },
      }
    });
  }

  confirmRemove(location) {
    const { res, settings } = this.props;
    if (settings.access.delete.authorized && !settings.access.delete.external) {
      get(
        res.get.replace(':locationUid', location.uid),
        { detailed: 1 },
        (err, freshLocation) => {
          if (err) {
            return log(err);
          }
          this.actions.displayRemoveConfirmModal(freshLocation);
        }
      );
    } else {
      this.displayActionModal('remove', location);
    }
  }

  renderItem(item, itemActions, itemIndex) {
    const { res, agenda, settings } = this.props;
    const { merge } = this.state;

    const editLocation = this.onLocationEdit.bind(this, item, itemIndex);
    const confirmRemove = this.confirmRemove.bind(this, item, itemIndex);
    const onSelect = this.onLocationSelect.bind(this, item, itemIndex);
    const goToMergeStep3 = this.goToMergeStep3.bind(this, item);
    const goToMergeStep1FromDuplicates = this.goToMergeStep1FromDuplicates.bind(this, item);

    return (
      <LocationItem
        merge={merge ? merge : undefined}
        key={item.uid}
        location={item}
        settings={settings}
        seeEventsRes={res.seeEvents.replace(
          ':agendaSlug',
          agenda.slug
        )}
        onSelect={onSelect}
        onEdit={editLocation}
        onRemove={confirmRemove}
        getCountryLabel={this.getCountryLabel}
        goToMergeStep3={merge ? goToMergeStep3 : null}
        goToMergeStep1FromDuplicates={goToMergeStep1FromDuplicates}
        seeDetails={this.actions.openDetailModal.bind(this, item)}
      />
    );
  }

  renderHead() {
    const { locations, total } = this.state;
    return (
      <div className="head">
        {Object.keys(this.actions.getQuery()).length ? (
          <Filters
            locations={locations}
            onQueryChange={this.actions.queryChange}
            query={this.actions.getQuery()}
          />
        ) : null}
        <p><FormattedMessage values={{ itemCount: total }} {...messages.total} /></p>
      </div>
    );
  }

  renderRemoveLocationModal() {
    const { modal } = this.state;
    const { agenda, res, lang } = this.props;
    const seeEventsLink = res.seeEvents
      .replace(':agendaSlug', agenda.slug)
      .replace(':locationUid', modal.data.location.uid);
    const remove = a => {
      this.onRemoveLocation.bind(
        this,
        modal.data.location,
        modal.data.index
      )(a);
    };
    return (
      <RemoveModal
        modal={modal}
        lang={lang}
        seeEventsLink={seeEventsLink}
        onClose={this.actions.closeModal}
        onRemove={remove}
      />
    );
  }

  renderMergeModal() {
    const { modal } = this.state;
    const { intl } = this.props;
    return (
      <Modal
        title={intl.formatMessage(messages.mergeDescription)}
        onClose={this.actions.closeMerge}
      >
        <div>
          <p className="text-center">
            {modal.err ? <FormattedMessage {...messages.somethingWentWrong} /> : <FormattedMessage {...messages.mergeInProgress} />}
          </p>
          {modal.err ? (
            <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}`} className="btn btn-primary">
              <FormattedMessage {...messages.contactSupport} />
            </a>
          ) : null}
        </div>
      </Modal>
    );
  }

  renderDetailModal() {
    const { modal } = this.state;
    const {
      lang, settings, staticTiles, res, agenda
    } = this.props;

    return (
      <Modal
        title={modal.location.name}
        classNames={{ overlay: 'popup-overlay big' }}
        onClose={this.actions.closeModal}
      >
        <LocationDetails
          res={res}
          location={modal.location}
          lang={lang}
          settings={settings}
          hover={false}
          staticTiles={staticTiles}
          agenda={agenda}
        />
      </Modal>
    );
  }

  renderMergeStepper() {
    const { merge } = this.state;
    const goToMergeStep2 = this.actions.goToMergeStep2.bind(this);
    const goToMergeStep3 = this.actions.goToMergeStep3.bind(this);
    const backToMergeStep1 = this.actions.backToMergeStep1.bind(this);
    const backToMergeStep2 = this.actions.backToMergeStep2.bind(this);
    const seeDetails = this.actions.openDetailModal.bind(this);
    const launchMerge = this.launchMerge.bind(this);
    const disqualifyDuplicates = this.disqualifyMergeCandidates.bind(this);
    const seeSelection = this.onSearchChange.bind(
      this,
      'uids',
      merge.locationUids
    );
    log('merge:', merge);
    return (
      <MergeStepper
        merge={merge}
        seeSelection={seeSelection}
        goToMergeStep2={goToMergeStep2}
        goToMergeStep3={goToMergeStep3}
        backToMergeStep1={backToMergeStep1}
        backToMergeStep2={backToMergeStep2}
        launchMerge={launchMerge}
        seeDetails={seeDetails}
        closeMerge={this.actions.toggleMerge.bind(null, false)}
        disqualifyDuplicates={disqualifyDuplicates}
      />
    );
  }

  renderMergeAction() {
    const { merge } = this.state;
    const { settings } = this.props;
    if (merge) {
      return (
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            this.actions.toggleMerge.bind(null, false)();
          }}
        >
          <FormattedMessage {...messages.cancelMerge} />
        </button>
      );
    }
    return (
      <button
        type="button"
        className={settings.access.merge.authorized ? 'btn btn-default' : 'btn btn-default disabled'}
        onClick={() => {
          if (!settings.access.merge.authorized || settings.access.merge.external) {
            this.displayActionModal('merge');
          } else {
            this.actions.toggleMerge.bind(null, true)();
          }
        }}
      >
        <FormattedMessage {...messages.merge} />
      </button>
    );
  }

  render() {
    const {
      set, res, settings, intl
    } = this.props;
    const {
      merge, locations, page, total, modal
    } = this.state;

    switch (this.getMode()) {
      case 'create':
        return (
          <div className="agenda-admin-locations">
            <CreateForm {...this.props} actions={this.actions} />
          </div>
        );
      case 'update':
        return (
          <div className="agenda-admin-locations">
            <UpdateForm {...this.props} actions={this.actions} />
          </div>
        );
      default:
    }

    return (
      <div className="agenda-admin-locations">
        <div>
          {set ? (
            <SetHeader set={set} res={res} />
          ) : null}
          {!merge ? (
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
                      className={settings.access.create.authorized ? 'btn btn-primary' : 'btn btn-primary disabled'}
                      onClick={() => {
                        if (!settings.access.create.authorized || settings.access.create.external) {
                          this.displayActionModal('create');
                        } else {
                          this.actions.newLocation.bind(null)();
                        }
                      }}
                    >
                      <FormattedMessage {...messages.create} />
                    </button>
                  </div>
                  <div className="form-group">
                    {this.renderMergeAction()}
                  </div>
                </div>
              </div>
            </div>
          ) : null }
          {merge ? this.renderMergeStepper() : null}
          {merge.step === 2 || merge.step === 3 ? null : (
            <div className="row list-filters">
              <div className="col col-sm-12">
                <div className="form-inline">
                  <div className="form-group">
                    <SearchField
                      value={this.actions.getQuery().search}
                      label={intl.formatMessage(messages.search)}
                      placeholder={intl.formatMessage(messages.search)}
                      onChange={this.onSearchChange}
                    />
                  </div>
                  <div className="checkbox">
                    <label htmlFor="checkbox">
                      <input
                        type="checkbox"
                        onChange={this.onSearchChange.bind(
                          this,
                          'state',
                          parseInt(this.actions.getQuery().state, 10) === 0
                            ? undefined
                            : 0
                        )}
                        checked={parseInt(this.actions.getQuery().state, 10) === 0}
                      />{' '}
                      <FormattedMessage
                        {...messages.toVerify}
                      />
                    </label>
                    <MoreInfo
                      className="margin-left-sm"
                      id="checkbox-help"
                      content={intl.formatMessage(messages.verifiedInfo)}
                      placement="top"
                    />
                  </div>
                  {this.renderHead()}
                </div>
              </div>
            </div>
          ) }

          <div className="row list">
            <div className="col col-sm-12">
              {merge.onGoing || merge.step === 3 ? null : (
                <List
                  res={res.index}
                  query={this.actions.getQuery()}
                  renderItem={this.renderItem}
                  renderHead={null}
                  items={locations}
                  page={page}
                  total={total}
                  onItemsUpdate={this.actions.updateLocationList}
                />
              )}
            </div>
          </div>
          {modal
            ? (() => {
              switch (modal.type) {
                case 'removeLocation':
                  return this.renderRemoveLocationModal();
                case 'merge':
                  return this.renderMergeModal();
                case 'detail':
                  return this.renderDetailModal();
                case 'actions':
                  return (
                    <AdminActionModal
                      data={modal.data}
                      settings={settings}
                      close={this.actions.closeModal}
                    />
                  );
                default:
              }
            })()
            : null}
        </div>
      </div>
    );
  }
}

export default injectIntl(AgendaAdminLocations);
