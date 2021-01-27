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
import MergeForm from './MergeForm';
import UpdateForm from './UpdateForm';

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
    this.displayCantDoModal = this.displayCantDoModal.bind(this);

    if (!props.settings.access) {
      props.settings.access = {
        create: true,
        update: true,
        merge: true,
        delete: true
      };
    }
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
          this.actions.removedLocation(index);
        }
      }
    );
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
    if (!merge || !merge.locationUids.length) return;

    get(
      res.index,
      {
        uids: merge.locationUids,
      },
      (err, result) => {
        if (err) {
          debug('error', err);
          return;
        }

        const { items } = result;

        if (items.length !== merge.locationUids.length) {
          debug('error', 'not all locations to be merged could be found');
          return;
        }

        this.actions.launchMerge(items);
      }
    );
  }

  displayCantDoModal(info) {
    log('displayCantDoModal', info);
    const { location } = this.state;
    this.setState({
      modal: {
        type: 'cantDo',
        data: {
          location,
          info
        },
      }
    });
  }

  confirmRemove(location) {
    const { res } = this.props;
    log('confirm remove param location: %j', location);

    get(
      res.get.replace(':locationUid', location.uid),
      { detailed: 1 },
      (err, freshLocation) => {
        log('confirm remove for %j', freshLocation);
        if (err) {
          return log(err);
        }
        this.actions.displayRemoveConfirmModal(freshLocation);
      }
    );
  }

  renderItem(item, itemActions, itemIndex) {
    const { res, agenda, settings } = this.props;
    const { merge } = this.state;
    const toggleMergeItem = this.actions.toggleMergeItem.bind(null, item);
    const editLocation = settings.access.update ? this.actions.editLocation.bind(null, item, itemIndex) : () => null;
    const confirmRemove = settings.access.delete ? this.confirmRemove.bind(this, item, itemIndex) : () => null;
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
        onSelect={merge ? toggleMergeItem : editLocation}
        onEdit={editLocation}
        onRemove={confirmRemove}
        getLabel={this.getLabel}
        getCountryLabel={this.getCountryLabel}
        displayCantDoModal={this.displayCantDoModal}
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

  renderCantDoModal() {
    const { modal } = this.state;
    return (
      <Modal
        title={this.getLabel('info')}
        onClose={this.actions.closeModal}
      >
        <div>
          <p className="text-center">
            {`${this.getLabel('cantDo')} ${this.getLabel(modal.data.info)}`}
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
      </Modal>
    );
  }

  renderRemoveLocationModal() {
    const { modal } = this.state;
    log(modal.data.location);
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
                  </div>
                </div>
              );
            default:
          }
        })()}
      </Modal>
    );
  }

  renderMergeMenu() {
    const { merge } = this.state;
    return (
      <div className="merge-menu">
        <p>
          {this.getLabel('mergedescription')}
          <button
            type="button"
            onClick={this.launchMerge.bind(this)}
            className="btn btn-primary margin-left-sm"
          >
            {this.getLabel('launchmerge')}
          </button>
        </p>

        {merge.locationUids.length ? (
          <span className="info">
            {this.getLabel('mergeselection', {
              count: merge.locationUids.length,
            })}
            <button
              type="button"
              className="btn btn-link"
              onClick={this.onSearchChange.bind(
                this,
                'uids',
                merge.locationUids
              )}
            >
              {this.getLabel('seemergelist')}
            </button>
          </span>
        ) : (
          <span className="info">{this.getLabel('mergenoselection')}</span>
        )}
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
          className="btn btn-danger"
          onClick={this.actions.toggleMerge.bind(null, false)}
        >
          {this.getLabel('cancelmerge')}
        </button>
      );
    } if (!settings.access.merge) {
      return (
        <button
          type="button"
          className="btn btn-default disabled"
          onClick={() => this.displayCantDoModal('merge')}
        >
          {this.getLabel('merge')}
        </button>
      );
    }
    return (
      <button
        type="button"
        className="btn btn-default"
        onClick={this.actions.toggleMerge.bind(null, true)}
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

    let createLocationButton = (
      <button
        type="button"
        className="btn btn-primary disabled"
        onClick={() => this.displayCantDoModal('create')}
      >
        {this.getLabel('create')}
      </button>
    );

    if (settings.access.create) {
      createLocationButton = (
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.actions.newLocation.bind(null)}
        >
          {this.getLabel('create')}
        </button>
      );
    }
    switch (this.getMode()) {
      case 'merge':
        return (
          <div className="agenda-admin-locations">
            <MergeForm {...this.props} actions={this.actions} />
          </div>
        );
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
            <SetHeader set={set} lang={lang} />
          ) : null}
          <div className="row list-actions">
            <div className="col col-sm-12">
              <div className="form-inline">
                <div className="form-group">
                  {createLocationButton}
                </div>
                <div className="form-group">
                  {this.renderMergeAction()}
                  <div className="btn-group margin-left-sm">
                    <a href={res.csv} className="btn btn-default">
                      <span>csv</span>
                    </a>
                    <a href={res.xlsx} className="btn btn-default">
                      <span>xlsx</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              </div>
            </div>
          </div>
          <div className="row list">
            <div className="col col-sm-12">
              {merge ? this.renderMergeMenu() : null}
              <List
                res={res.index}
                query={this.actions.getQuery()}
                renderItem={this.renderItem}
                renderHead={this.renderHead}
                items={locations}
                page={page}
                total={total}
                onItemsUpdate={this.actions.updateLocationList}
              />
            </div>
          </div>
          {modal
            ? (() => {
              switch (modal.type) {
                case 'removeLocation':
                  return this.renderRemoveLocationModal();
                case 'cantDo':
                  return this.renderCantDoModal();
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
