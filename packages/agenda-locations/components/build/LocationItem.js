"use strict";

var React = require('react'),
    PropTypes = require('prop-types'),
    LocationMap = require('./LocationMap'),
    createReactClass = require('create-react-class');

module.exports = createReactClass({
  displayName: 'exports',


  propTypes: {
    getLabel: PropTypes.func,
    getCountryLabel: PropTypes.func
  },

  isInMergeSelection: function isInMergeSelection() {

    return this.props.merge.locationUids.indexOf(this.props.location.uid) !== -1;
  },
  onRemove: function onRemove(e) {

    e.stopPropagation();

    this.props.onRemove();
  },
  renderMergeCheckbox: function renderMergeCheckbox() {
    var _this = this;

    return React.createElement(
      'div',
      { className: 'checkbox' },
      React.createElement(
        'label',
        null,
        React.createElement('input', {
          ref: function ref(r) {
            return _this.checkbox = r;
          },
          type: 'checkbox',
          checked: this.isInMergeSelection() })
      )
    );
  },
  seeEvents: function seeEvents(e) {

    e.stopPropagation();

    window.location.href = this.props.seeEventsRes.replace(':locationUid', this.props.location.uid);
  },
  render: function render() {

    var l = this.props.location,
        className = ['item'],
        country = this.props.getCountryLabel(l.countryCode);

    if (this.props.merge) className.push('merge');

    return React.createElement(
      'div',
      { className: className.join(' '), key: l.uid, onClick: this.props.onSelect },
      this.props.merge ? this.renderMergeCheckbox() : null,
      !this.props.merge ? React.createElement(
        'div',
        { className: 'actions btn-group' },
        React.createElement(
          'button',
          {
            className: 'btn btn-default',
            'aria-label': this.props.getLabel('remove'),
            onClick: this.onRemove },
          React.createElement('i', { className: 'fa fa-trash' })
        ),
        React.createElement(
          'button',
          {
            className: 'btn btn-default',
            'aria-label': this.props.getLabel('edit'),
            onClick: this.props.onEdit },
          React.createElement('i', { className: 'fa fa-edit' })
        )
      ) : null,
      React.createElement(
        'div',
        { className: 'item-body' },
        React.createElement(
          'div',
          { className: 'title' },
          l.name
        ),
        React.createElement(
          'div',
          null,
          l.address
        ),
        React.createElement(
          'div',
          { className: 'text-muted' },
          l.department ? l.department : null,
          l.region ? (l.department ? ', ' : '') + l.region : null,
          country ? (l.department || l.region ? ', ' : '') + country : null
        ),
        React.createElement(
          'div',
          { className: 'indicators' },
          React.createElement('i', { className: l.image ? "fa fa-picture-o" : "fa fa-picture-o disabled" }),
          React.createElement('i', { className: l.description ? "fa fa-file-text-o " : "fa fa-file-text-o disabled" }),
          l.state === 0 ? React.createElement(
            'span',
            { className: 'badge badge-warning' },
            this.props.getLabel('verify')
          ) : null,
          React.createElement(
            'a',
            { onClick: this.seeEvents },
            this.props.getLabel('seeevents')
          )
        )
      )
    );
  }
});
//# sourceMappingURL=LocationItem.js.map