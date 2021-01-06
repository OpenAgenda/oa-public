import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LocationItem extends Component {
  onRemove(e) {
    e.stopPropagation();
    this.props.onRemove();
  }

  isInMergeSelection() {
    const { merge, location } = this.props;
    return (
      merge.locationUids.indexOf(location.uid) !== -1
    );
  }

  seeEvents(e) {
    e.stopPropagation();
    window.location.href = this.props.seeEventsRes.replace(
      ':locationUid',
      this.props.location.uid
    );
  }

  renderMergeCheckbox() {
    return (
      <div className="checkbox">
        <label>
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
    const l = this.props.location;
    const className = ['item'];
    const country = this.props.getCountryLabel(l.countryCode);

    if (this.props.merge) {
      className.push('merge');
    }

    return (
      <div
        className={className.join(' ')}
        key={l.uid}
        onClick={this.props.onSelect.bind(this)}
      >
        {this.props.merge ? this.renderMergeCheckbox() : null}
        {!this.props.merge ? (
          <div className="actions btn-group">
            <button
              className="btn btn-default"
              aria-label={this.props.getLabel('remove')}
              onClick={this.onRemove.bind(this)}
            >
              <i className="fa fa-trash"></i>
            </button>
            <button
              className="btn btn-default"
              aria-label={this.props.getLabel('edit')}
              onClick={this.props.onEdit.bind(this)}
            >
              <i className="fa fa-edit"></i>
            </button>
          </div>
        ) : null}
        <div className="item-body">
          <div className="title">{l.name}</div>
          <div>{l.address}</div>
          <div className="text-muted">
            {l.department ? l.department : null}
            {l.region ? (l.department ? ', ' : '') + l.region : null}
            {country ? (l.department || l.region ? ', ' : '') + country : null}
          </div>
          <div className="indicators">
            <i
              className={
                l.image ? 'fa fa-picture-o' : 'fa fa-picture-o disabled'
              }
            ></i>
            <i
              className={
                l.description
                  ? 'fa fa-file-text-o '
                  : 'fa fa-file-text-o disabled'
              }
            ></i>
            {l.state === 0 ? (
              <span className="badge badge-warning">
                {this.props.getLabel('verify')}
              </span>
            ) : null}
            {l.agendaEventCount ? (
              <a onClick={this.seeEvents.bind(this)}>
                {this.props.getLabel(
                  l.agendaEventCount === 1 ? 'seeEvent' : 'seeEvents',
                  { count: l.agendaEventCount }
                )}
              </a>
            ) : (
              <span className="text-muted">
                {this.props.getLabel('noEvent')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
}

LocationItem.propTypes = {
  getLabel: PropTypes.func,
  getCountryLabel: PropTypes.func,
};

export default LocationItem;
