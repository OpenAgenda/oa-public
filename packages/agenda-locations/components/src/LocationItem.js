import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debug from 'debug';
import { defineMessages, FormattedMessage } from 'react-intl';

const log = debug('LocationItem');

const messages = defineMessages({
  edit: {
    id: 'AgendaLocations.LocationItem.edit',
    defaultMessage: 'Edit',
  },
  remove: {
    id: 'AgendaLocations.LocationItem.remove',
    defaultMessage: 'Delete',
  },
  defineMergeTarget: {
    id: 'AgendaLocations.LocationItem.defineMergeTarget',
    defaultMessage: 'Define as merge target',
  },
  refLocationMerge: {
    id: 'AgendaLocations.LocationItem.refLocationMerge',
    defaultMessage: 'Reference location for merge',
  },
  unselect: {
    id: 'AgendaLocations.LocationItem.unselect',
    defaultMessage: 'Unselect',
  },
  verify: {
    id: 'AgendaLocations.LocationItem.verify',
    defaultMessage: 'To verify',
  },
  noEvent: {
    id: 'AgendaLocations.LocationItem.noEvent',
    defaultMessage: 'No associated event',
  },
  detailsButton: {
    id: 'AgendaLocations.LocationItem.detailsButton',
    defaultMessage: 'Details',
  },
  seeEvents: {
    id: 'AgendaLocations.LocationItem.seeEvents',
    defaultMessage: '{count, plural, =0 {nothing} one {1 associated event} other {# associated events}}',
  },
});

class LocationItem extends Component {
  static propTypes = {
    merge: PropTypes.object,
    location: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    getCountryLabel: PropTypes.func,
    onSelect: PropTypes.func,
    onEdit: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    seeEventsRes: PropTypes.string,
    toggleMergeTarget :PropTypes.func,
    seeRef : PropTypes.func
  };

  constructor(props) {
    super(props);
    // Binding
    this.onRemove = this.onRemove.bind(this);
    this.seeEvents = this.seeEvents.bind(this);
    this.toggleMergeTarget = this.toggleMergeTarget.bind(this);
  }

  onRemove(e) {
    e.stopPropagation();
    const { onRemove } = this.props;
    onRemove();
  }

  onEdit(e) {
    e.stopPropagation();
    const { onEdit } = this.props;
    onEdit();
  }

  isInMergeSelection() {
    const { merge, location } = this.props;
    return (
      merge.locationUids.indexOf(location.uid) !== -1
    );
  }

  isMergeTarget() {
    const { merge, location } = this.props;
    return (
      merge.targetUid === location.uid
    );
  }

  toggleMergeTarget(e) {
    e.stopPropagation();
    const { toggleMergeTarget } = this.props;
    toggleMergeTarget();
  }

  seeEvents(e) {
    const { location, seeEventsRes } = this.props;
    e.stopPropagation();
    window.location.href = seeEventsRes.replace(
      /\:locationUid/g,
      location.uid
    );
  }

  seeDetails(e) {
    const { seeDetails } = this.props;
    e.stopPropagation();
    seeDetails();
  }

  renderMergeCheckbox() {
    return (
      <div className="checkbox margin-v-md">
        <label htmlFor="merge-checkbox">
          <input
            ref={r => (this.checkbox = r)}
            type="checkbox"
            checked={this.isInMergeSelection()}
          />
        </label>
      </div>
    );
  }

  render() {
    const {
      location, merge, getCountryLabel, onSelect, settings
    } = this.props;
    const className = ['row item'];
    const country = getCountryLabel(location.countryCode);
    const editButton = (
      <button
        type="button"
        className={!settings.access.update.authorized ? 'btn btn-link disabled action' : 'btn btn-link action'}
        onClick={this.onEdit.bind(this)}
      >
        <FormattedMessage {...messages.edit} />
      </button>
    );
    const removeButton = (
      <button
        type="button"
        className={!settings.access.delete.authorized ? 'btn btn-link text-danger disabled action' : 'btn btn-link text-danger action'}
        onClick={this.onRemove}
      >
        <FormattedMessage {...messages.remove} />
      </button>
    );
    const toggleMergeTargetButton = (
      <button
        type="button"
        className="btn btn-link action"
        onClick={this.toggleMergeTarget}
      >
        <FormattedMessage {...messages.defineMergeTarget} />
      </button>
    );

    const mergeTarget = (
      <span>
        <strong><FormattedMessage {...messages.refLocationMerge} /></strong>
        <button
          type="button"
          className="btn btn-link text-danger action"
          onClick={this.toggleMergeTarget}
        >
          <FormattedMessage {...messages.unselect} />
        </button>
      </span>
    );

    if (merge) {
      className.push('merge');
    }
    className.push('padding-v-sm');

    return (
      <div
        className={className.join(' ')}
        key={location.uid}
        onClick={onSelect.bind(this)}
      >
        <div className="col col-xs-10 col-md-11 item-body">
          <div className="title">{location.name}</div>
          <div>{location.address}</div>
          <div className="text-muted">
            {location.department ? location.department : null}
            {location.region ? (location.department ? ', ' : '') + location.region : null}
            {country ? (location.department || location.region ? ', ' : '') + country : null}
          </div>
          <div className="btn-link-group">
            <i
              className={'indicator'.concat(' ', location.image ? 'fa fa-picture-o margin-right-xs' : 'fa fa-picture-o disabled margin-right-xs')}
            />
            <i
              className={'indicator'.concat(' ',
                location.description
                  ? 'fa fa-file-text-o margin-right-xs'
                  : 'fa fa-file-text-o disabled margin-right-xs')}
            />
            {location.state === 0 ? (
              <span className="badge badge-warning">
                <FormattedMessage {...messages.verify} />
              </span>
            ) : null}
            {location.agendaEventCount ? (
              <button
                type="button"
                className="action btn btn-link"
                onClick={this.seeEvents}
              >
                <FormattedMessage values={{ count: location.agendaEventCount}} {...messages.seeEvents} />
              </button>
            ) : (
              <span className="action text-muted">
                <FormattedMessage {...messages.noEvent} />
              </span>
            )}
            <button
              type="button"
              className="btn btn-link  action"
              onClick={this.seeDetails.bind(this)}
            >
              <FormattedMessage {...messages.detailsButton} />
            </button>
            {!merge ? editButton : null}
            {!merge ? removeButton : null}
            {merge && this.isMergeTarget() ? mergeTarget : null}
            {merge && !this.isMergeTarget() ? toggleMergeTargetButton : null}
          </div>
        </div>
        <div className="col col-xs-2 col-md-1 text-center">{merge ? this.renderMergeCheckbox() : null}</div>
      </div>
    );
  }
}

export default LocationItem;
