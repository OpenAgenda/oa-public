import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LocationItem extends Component {
  static propTypes = {
    merge: PropTypes.object,
    location: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    getLabel: PropTypes.func.isRequired,
    getCountryLabel: PropTypes.func,
    onSelect: PropTypes.func,
    onEdit: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    seeEventsRes: PropTypes.string,
    displayCantDoModal: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    // Binding
    this.onRemove = this.onRemove.bind(this);
    this.seeEvents = this.seeEvents.bind(this);
  }

  onRemove(e) {
    const { onRemove } = this.props;
    e.stopPropagation();
    onRemove();
  }

  isInMergeSelection() {
    const { merge, location } = this.props;
    return (
      merge.locationUids.indexOf(location.uid) !== -1
    );
  }

  seeEvents(e) {
    const { location, seeEventsRes } = this.props;
    e.stopPropagation();
    window.location.href = seeEventsRes.replace(
      ':locationUid',
      location.uid
    );
  }

  renderMergeCheckbox() {
    return (
      <div className="checkbox">
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
      location, merge, getCountryLabel, getLabel, onSelect, onEdit, settings, displayCantDoModal
    } = this.props;
    const className = ['item'];
    const country = getCountryLabel(location.countryCode);
    let editButton = (
      <button
        type="button"
        className="btn btn-default disabled"
        aria-label={getLabel('edit')}
        onClick={() => displayCantDoModal('edit')}
      >
        <i className="fa fa-edit" />
      </button>
    );
    let removeButton = (
      <button
        type="button"
        className="btn btn-default disabled"
        aria-label={getLabel('remove')}
        onClick={() => displayCantDoModal('remove')}
      >
        <i className="fa fa-trash" />
      </button>
    );

    if (merge) {
      className.push('merge');
    }
    if (settings.access.update) {
      editButton = (
        <button
          type="button"
          className="btn btn-default"
          aria-label={getLabel('edit')}
          onClick={onEdit.bind(this)}
        >
          <i className="fa fa-edit" />
        </button>
      );
    }
    if (settings.access.delete) {
      removeButton = (
        <button
          type="button"
          className="btn btn-default"
          aria-label={getLabel('remove')}
          onClick={this.onRemove}
        >
          <i className="fa fa-trash" />
        </button>
      );
    }

    return (
      <div
        className={className.join(' ')}
        key={location.uid}
        onClick={onSelect.bind(this)}
      >
        {merge ? this.renderMergeCheckbox() : null}
        {!merge ? (
          <div className="actions btn-group">
            {removeButton}
            {editButton}
          </div>
        ) : null}
        <div className="item-body">
          <div className="title">{location.name}</div>
          <div>{location.address}</div>
          <div className="text-muted">
            {location.department ? location.department : null}
            {location.region ? (location.department ? ', ' : '') + location.region : null}
            {country ? (location.department || location.region ? ', ' : '') + country : null}
          </div>
          <div className="indicators">
            <i
              className={
                location.image ? 'fa fa-picture-o' : 'fa fa-picture-o disabled'
              }
            />
            <i
              className={
                location.description
                  ? 'fa fa-file-text-o '
                  : 'fa fa-file-text-o disabled'
              }
            />
            {location.state === 0 ? (
              <span className="badge badge-warning">
                {getLabel('verify')}
              </span>
            ) : null}
            {location.agendaEventCount ? (
              <button
                type="button"
                className="btn btn-link"
                onClick={this.seeEvents}
              >
                {getLabel(
                  location.agendaEventCount === 1 ? 'seeEvent' : 'seeEvents',
                  { count: location.agendaEventCount }
                )}
              </button>
            ) : (
              <span className="text-muted">
                {getLabel('noEvent')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default LocationItem;
