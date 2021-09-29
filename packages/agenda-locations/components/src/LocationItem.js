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
  select: {
    id: 'AgendaLocations.LocationItem.select',
    defaultMessage: 'Select',
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
  verifyDuplicates: {
    id: 'AgendaLocations.LocationItem.verifyDuplicates',
    defaultMessage: '{count, plural, =0 {nothing} one {1 duplicate to verify} other {# duplicates to verify}}',
  },
  verifyAndMerge: {
    id: 'AgendaLocations.LocationItem.verifyAndMerge',
    defaultMessage: 'Verify and Merge',
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
    //toggleMergeTarget: PropTypes.func,
    goToMergeStep3: PropTypes.func,
    goToMergeStep1FromDuplicates: PropTypes.func,
    seeRef: PropTypes.func
  };

  constructor(props) {
    super(props);
    // Binding
    this.onRemove = this.onRemove.bind(this);
    this.seeEvents = this.seeEvents.bind(this);
    this.selectMergeTarget = this.selectMergeTarget.bind(this);
    this.goToMergeStep1FromDP = this.goToMergeStep1FromDP.bind(this);
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

  isMergeEntry() {
    const { merge, location } = this.props;
    if (!merge) return false;
    return (
      merge?.entryPoint === location.uid
    );
  }

  isMergeTarget() {
    const { merge, location } = this.props;
    if (!merge) return false;
    return (
      merge?.target?.uid === location.uid
    );
  }

  selectMergeTarget(e) {
    e.stopPropagation();
    const { goToMergeStep3 } = this.props;
    goToMergeStep3();
  }

  goToMergeStep1FromDP(e) {
    e.stopPropagation();
    const { goToMergeStep1FromDuplicates } = this.props;
    goToMergeStep1FromDuplicates();
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
    const selectMergeTargetButton = (
      <button
        type="button"
        className="btn btn-primary"
        onClick={this.selectMergeTarget}
      >
        <FormattedMessage {...messages.select} />
      </button>
    );

    if (merge && this.isMergeEntry()) className.push('merge-entry');
    className.push('padding-v-sm');

    return (
      <div
        className={className.join(' ')}
        key={location.uid}
        onClick={onSelect.bind(this)}
      >
        <div className="col col-xs-10 col-md-auto item-body">
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
                <FormattedMessage values={{ count: location.agendaEventCount }} {...messages.seeEvents} />
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
          </div>
          {location.duplicateCandidates && location.duplicateCandidates.length > 0 ? (
            <div>
              <span className="badge badge-warning">
                <FormattedMessage values={{ count: location.duplicateCandidates.length }} {...messages.verifyDuplicates} />
              </span>
              {!merge ? (
                <button
                  type="button"
                  className={settings.access.merge.authorized ? 'btn btn-link  action' : 'btn btn-link  action disabled'}
                  onClick={this.goToMergeStep1FromDP}
                >
                  <FormattedMessage {...messages.verifyAndMerge} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        {merge?.step === 1 ? <div className="col col-xs-2 col-md-1 text-center"> {this.renderMergeCheckbox()} </div> : null}
        {merge?.step === 2 && !this.isMergeTarget() ? <div className="col col-xs-2 col-md-2 padding-v-md text-center"> {selectMergeTargetButton} </div> : null}
      </div>
    );
  }
}

export default LocationItem;
