"use strict";

var React = require('react'),
    monitorBottomHit = require('dom-utils/monitorBottomHit');

module.exports = React.createClass({
  displayName: 'exports',


  propTypes: {
    items: React.PropTypes.array,
    total: React.PropTypes.number,
    pageRange: React.PropTypes.array,
    limit: React.PropTypes.number,
    getPage: React.PropTypes.func,
    renderItem: React.PropTypes.func,
    renderEmpty: React.PropTypes.func,
    renderPrev: React.PropTypes.func,
    renderNext: React.PropTypes.func,
    prevLabel: React.PropTypes.string,
    nextLabel: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {

    return {
      items: [],
      pageRange: [1, 1],
      limit: 20,
      prevLabel: 'load previous',
      nextLabel: 'load next',
      renderEmpty: function renderEmpty() {
        return '';
      }
    };
  },
  isClient: function isClient() {

    return typeof document !== 'undefined';
  },
  getInitialState: function getInitialState() {

    return {};
  },
  hasNextPage: function hasNextPage() {

    var lastPage = this.props.pageRange[1];

    return lastPage * this.props.limit < this.props.total;
  },
  hasPrevPage: function hasPrevPage() {

    return this.props.pageRange[0] > 1;
  },
  componentWillMount: function componentWillMount() {
    var _this = this;

    if (this.isClient()) monitorBottomHit(function () {

      _this.props.getPage(true);
    });
  },
  renderPrev: function renderPrev() {
    return this.props.renderPrev ? this.props.renderPrev : this.hasPrevPage() ? React.createElement(
      'nav',
      { className: 'page-nav' },
      React.createElement(
        'button',
        { className: 'btn btn-default', onClick: this.props.getPage.bind(null, false) },
        this.props.prevLabel
      )
    ) : null;
  },
  renderNext: function renderNext() {
    return this.props.renderNext ? this.props.renderNext : this.hasNextPage() ? React.createElement(
      'nav',
      { className: 'page-nav' },
      React.createElement(
        'button',
        { className: 'btn btn-default', onClick: this.props.getPage.bind(null, true) },
        'this.props.nextLabel'
      )
    ) : null;
  },
  render: function render() {

    return React.createElement(
      'div',
      null,
      this.renderPrev(),
      React.createElement(
        'div',
        null,
        this.props.items.length ? this.props.items.map(this.props.renderItem) : this.props.renderEmpty
      ),
      this.renderNext()
    );
  }
});