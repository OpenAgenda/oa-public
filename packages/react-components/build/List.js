"use strict";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    monitorBottomHit = require('@openagenda/dom-utils/monitorBottomHit');

var List = createReactClass({

  displayName: 'List',

  propTypes: {
    items: PropTypes.array,
    total: PropTypes.number,
    pageRange: PropTypes.array,
    limit: PropTypes.number,
    getPage: PropTypes.func,
    renderItem: PropTypes.func,
    prevLabel: PropTypes.string,
    nextLabel: PropTypes.string,
    renderEmpty: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    renderPrev: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    renderNext: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    wrapTag: PropTypes.string //TODO React component possibility
  },

  getDefaultProps: function getDefaultProps() {

    return {
      items: [],
      pageRange: [1, 1],
      limit: 20,
      prevLabel: 'load previous',
      nextLabel: 'load next',
      renderEmpty: function renderEmpty() {
        return null;
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

    if (this.isClient() && this.props.getPage) monitorBottomHit(function () {

      _this.props.getPage(true);
    });
  },
  renderPrev: function renderPrev() {

    if (this.props.renderPrev) return typeof this.props.renderPrev === 'function' ? this.props.renderPrev() : this.props.renderPrev;

    if (this.hasPrevPage()) return React.createElement(
      'nav',
      { className: 'page-nav' },
      React.createElement(
        'button',
        { className: 'btn btn-default',
          onClick: this.props.getPage.bind(null, false) },
        this.props.prevLabel
      )
    );
  },
  renderNext: function renderNext() {

    if (this.props.renderNext) return typeof this.props.renderNext === 'function' ? this.props.renderNext() : this.props.renderNext;

    if (this.hasNextPage()) return React.createElement(
      'nav',
      { className: 'page-nav' },
      React.createElement(
        'button',
        { className: 'btn btn-default',
          onClick: this.props.getPage.bind(null, true) },
        this.props.nextLabel
      )
    );
  },
  renderEmpty: function renderEmpty() {

    return typeof this.props.renderEmpty === 'function' ? this.props.renderEmpty() : this.props.renderEmpty;
  },
  render: function render() {

    var Tag = this.props.wrapTag ? this.props.wrapTag : 'div';

    return React.createElement(
      Tag,
      null,
      this.renderPrev(),
      this.props.items.length ? this.props.items.map(this.props.renderItem) : this.renderEmpty(),
      this.renderNext()
    );
  }
});

module.exports = List;
//# sourceMappingURL=List.js.map