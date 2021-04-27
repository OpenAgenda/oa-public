import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import xhr from 'xhr';

import countries from '@openagenda/countries';
import get from '@openagenda/utils/get';
import labels from '@openagenda/labels/agenda-locations/list';
import { Modal, MoreInfo } from '@openagenda/react-components';
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
import post from './post';

const log = debug('AgendaAdminLocations');

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
    staticTiles: PropTypes.string.isRequired
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
    this.getLabel = this.getLabel.bind(this);
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

  onRemoveLocation(location, index) {
    const { res } = this.props;
    xhr(
      {
        uri: res.remove.replace(':locationUid', location.uid),
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
          this.actions.removedLocation(index); // remove index front list 
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
      this.actions.toggleMergeItem(location);
    } else {
      this.onLocationEdit(location, locationIndex);
    }
  }

  onToggleMergeTarget(location) {
    const { merge } = this.state;

    if (merge) {
      this.actions.toggleMergeTarget(location);
    }
  }

  getLabel(name, values) {
    const label = labels[name];
    const { lang } = this.props;

    let str = _.get(label, lang, label[_.first(_.keys(label))]);

    if (values) {
      let k;
      for (k in values) {
        if (Object.prototype.hasOwnProperty.call(values, k)) {
          str = str.replace(`%${k}%`, values[k]);
        }
      }
    }
    return str;
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

  launchMerge() {
    const { res } = this.props;
    const { merge } = this.state;
    const merged = merge.locationUids.filter(uid => uid !== merge.targetUid);
    const timeOut = 1000;
    if (!merge.targetUid) {
      log('no target for merge!!');
    }
    if (!merge || !merge.targetUid || !merge.locationUids.length) return;

    const body = {
      mergeIn: merge.targetUid,
      merged,
    };

    this.actions.mergeOnGoing();

    post(res.merge, body, (err, result) => {
      if (err) {
        log('error', err);
        this.actions.changeMergeModal(err);
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
    const toggleMergeTarget = this.onToggleMergeTarget.bind(this, item);

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
        getLabel={this.getLabel}
        getCountryLabel={this.getCountryLabel}
        toggleMergeTarget={merge ? toggleMergeTarget : null}
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
            getLabel={this.getLabel}
            onQueryChange={this.actions.queryChange}
            query={this.actions.getQuery()}
          />
        ) : null}
        {total ? (
          <p>{this.getLabel('total', { count: total })}</p>
        ) : null}
        {total === 0 ? <p>{this.getLabel('totalzero')}</p> : null}
      </div>
    );
  }

  renderRemoveLocationModal() {
    const { modal } = this.state;
    const { agenda, res } = this.props;
    const { eventCount, agendaEventCount } = modal.data.location;

    const seeEventsLink = res.seeEvents
      .replace(':agendaSlug', agenda.slug)
      .replace(':locationUid', modal.data.location.uid);

    const { isRemoved } = modal.data;

    let withEventsText = (
      <span>
        <p className="text-center">
          {this.getLabel('cannotRemoveStart', { eventCount })}
          <a href={seeEventsLink}>
            {this.getLabel(agendaEventCount === 1 ? 'cannotRemoveLinkUnique' : 'cannotRemoveLink', { agendaEventCount })}
          </a>
          {this.getLabel(agendaEventCount === 1 ? 'cannotRemoveEndUnique' : 'cannotRemoveEnd')}
        </p>
      </span>
    );

    let modalStates = isRemoved ? 'removed' : null;
    if (!modalStates) {
      modalStates = eventCount ? 'withEvents' : 'noEvents';
    }

    return (
      <Modal
        title={this.getLabel('removeTitle')}
        onClose={this.actions.closeModal}
      >
        {(() => {
          switch (modalStates) {
            case 'removed':
              return (
                <div>
                  <p className="text-center">
                    {this.getLabel('removeComplete')}
                  </p>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={this.actions.closeModal}
                    >
                      {this.getLabel('closeModal')}
                    </button>
                  </div>
                </div>
              );
            case 'noEvents':
              return (
                <div>
                  <p className="text-center">
                    {this.getLabel('confirmRemoveMessage')}
                  </p>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={this.onRemoveLocation.bind(
                        this,
                        modal.data.location,
                        modal.data.index
                      )}
                    >{this.getLabel('confirmRemove')}
                    </button>
                  </div>
                </div>
              );
            case 'withEvents':
              if (eventCount === agendaEventCount) {
                withEventsText = (
                  <span>
                    <p className="text-center">
                      {this.getLabel('cannotRemoveStart=')}
                      <a href={seeEventsLink}>
                        {this.getLabel(eventCount === 1 ? 'cannotRemoveLinkUnique=' : 'cannotRemoveLink=', { eventCount })}
                      </a>
                      {this.getLabel(eventCount === 1 ? 'cannotRemoveEndUnique=' : 'cannotRemoveEnd=')}
                    </p>
                  </span>
                );
              }
              return (
                <div>
                  {withEventsText}
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={this.actions.closeModal}
                    >
                      {this.getLabel('cancel')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary margin-h-sm"
                      onClick={this.onRemoveLocation.bind(
                        this,
                        modal.data.location,
                        modal.data.index
                      )}
                    >
                      {this.getLabel('confirm')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary margin-h-sm"
                      onClick={this.onRemoveLocation.bind(
                        this,
                        modal.data.location,
                        modal.data.index
                      )}
                    >
                      Supprimer avec les évenements associés
                    </button>
                  </div>
                </div>
              );
            default:
          }
        })()}
      </Modal>
    );
  }

  renderMergeModal() {
    const { modal } = this.state;
    return (
      <Modal
        title={this.getLabel('mergedescription')}
        onClose={this.actions.closeMerge}
      >
        <div>
          <p className="text-center">
            {modal.err ? this.getLabel('somethingwentwrong') : this.getLabel('mergeInProgress')}
          </p>
          {modal.err ? (<a href={`/support?origin=${window.location.pathname}`} className="btn btn-primary"> Contact Support</a>) : null}
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
        <button
          type="button"
          onClick={this.actions.closeModal}
          className="btn btn-danger padding-h-xs"
        >
          {this.getLabel('closeModal')}
        </button>
      </Modal>
    );
  }

  renderMergeMenu() {
    const { merge, locations } = this.state;
    log('locations', merge.locationUids);
    return (
      <div className="merge-menu row margin-bottom-md">
        <div className="col-sm-12">
          <div className="btn-link-group">
            <strong>{this.getLabel('mergedescription')}</strong>
            <button
              type="button"
              onClick={this.actions.toggleMerge.bind(null, false)}
              className="btn btn-link text-danger"
            >
              {this.getLabel('cancel')}
            </button>
          </div>
          {merge.targetUid ? (
            <div className="btn-link-group">
              <span>{this.getLabel('reflocation')}</span>
              <strong>{locations.find(l => l.uid === merge.targetUid).name}</strong>
              <button
                type="button"
                onClick={this.onSearchChange.bind(
                  this,
                  'uids',
                  merge.targetUid
                )}
                className="btn btn-link"
              >
                {this.getLabel('seemergelist')}
              </button>
              <button
                type="button"
                onClick={this.onToggleMergeTarget.bind(this, { uid: null })}
                className="btn btn-link text-danger padding-h-xs"
              >
                {this.getLabel('unselect')}
              </button>
              <MoreInfo
                className="margin-left-sm"
                id="target-help"
                content={this.getLabel('reflocationinfo2')}
                placement="top"
              />
            </div>
          ) : (
            <div className="btn-link-group">
              {this.getLabel('reflocation')}{this.getLabel('reflocationinfo')}
            </div>
          )}
          {merge.locationUids.length ? (
            <span>
              {this.getLabel('mergeselection', {
                count: merge.locationUids.length,
              })}
            </span>
          ) : (
            <span>{this.getLabel('mergenoselection')}</span>
          )}
          <div>
            <button
              type="button"
              className={merge.locationUids.length ? 'btn btn-link padding-left-z padding-right-xs' : 'btn btn-link disabled padding-left-z padding-right-xs'}
              onClick={this.onSearchChange.bind(
                this,
                'uids',
                merge.locationUids
              )}
            >
              {this.getLabel('seeselection')}
            </button>
            {false ? (
              <button
                type="button"
                className="btn btn-link disabled padding-h-xs"
              >
                Charger des suggestion de doublons
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className={merge.locationUids.length && merge.targetUid ? 'btn btn-primary margin-top-xs' : 'btn btn-primary disabled margin-top-xs'}
            onClick={this.launchMerge.bind(this)}
          >
            {this.getLabel('launchmerge')}
          </button>
        </div>
      </div>
    );
  }

  renderMergeAction() {
    const { merge } = this.state;
    const { settings } = this.props;
    if (merge) {
      return (
        <button
          type="button"
          className="btn btn-default disabled"
          onClick={this.actions.toggleMerge.bind(null, false)}
        >
          {this.getLabel('merge')}
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
        {this.getLabel('merge')}
      </button>
    );
  }

  render() {
    const {
      set, lang, res, settings
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
            <SetHeader set={set} lang={lang} res={res} />
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
                    className={settings.access.create.authorized ? 'btn btn-primary' : 'btn btn-primary disabled'}
                    onClick={() => {
                      if (!settings.access.create.authorized || settings.access.create.external) {
                        this.displayActionModal('create');
                      } else {
                        this.actions.newLocation.bind(null)();
                      }
                    }}
                  >
                    {this.getLabel('create')}
                  </button>
                </div>
                <div className="form-group">
                  {this.renderMergeAction()}
                </div>
              </div>
            </div>
          </div>
          {merge ? this.renderMergeMenu() : null}
          <div className="row list-filters">
            <div className="col col-sm-12">
              <div className="form-inline">
                <div className="form-group">
                  <SearchField
                    value={this.actions.getQuery().search}
                    label={this.getLabel('search')}
                    placeholder={this.getLabel('search')}
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
                    {this.getLabel('toverify')}
                  </label>
                  <MoreInfo
                    className="margin-left-sm"
                    id="checkbox-help"
                    content={this.getLabel('verifiedInfo')}
                    placement="top"
                  />
                </div>
                {this.renderHead()}
              </div>
            </div>
          </div>
          <div className="row list">
            <div className="col col-sm-12">
              {merge.onGoing ? null : (
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
                      getLabel={this.getLabel}
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

export default AgendaAdminLocations;
