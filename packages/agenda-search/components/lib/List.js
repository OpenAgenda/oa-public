"use strict";

var React = require('react'),
    monitorBottomHit = require('dom-utils/monitorBottomHit');

module.exports = React.createClass({
  displayName: 'exports',


  propTypes: {
    items: React.PropTypes.array,
    total: React.PropTypes.number,
    pageRange: React.PropTypes.array,
    limit: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {

    return {
      items: [],
      pageRange: [1, 1],
      limit: 20
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
  render: function render() {

    return React.createElement(
      'div',
      null,
      this.hasPrevPage() ? React.createElement(
        'nav',
        { className: 'page-nav' },
        React.createElement(
          'button',
          { className: 'btn btn-default', onClick: this.props.getPage.bind(null, false) },
          'load previous'
        )
      ) : null,
      React.createElement(
        'div',
        null,
        this.props.items.map(this.props.renderItem)
      ),
      this.hasNextPage() ? React.createElement(
        'nav',
        { className: 'page-nav' },
        React.createElement(
          'button',
          { className: 'btn btn-default', onClick: this.props.getPage.bind(null, true) },
          'load next'
        )
      ) : null
    );
  }
});