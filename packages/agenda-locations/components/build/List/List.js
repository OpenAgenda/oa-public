"use strict";

var React = require('react'),
    PropTypes = require('prop-types'),
    createReactClass = require('create-react-class'),
    get = require('@openagenda/utils/get'),
    monitorBottomHit = require('./lib/monitorBottomHit'),
    deepExtend = require('deep-extend'),
    update = require('immutability-helper'),
    utils = require('@openagenda/utils');

module.exports = createReactClass({
  displayName: 'exports',


  propTypes: {
    items: PropTypes.array,
    total: PropTypes.number,
    page: PropTypes.number,
    dropdownMode: PropTypes.bool,
    onLoading: PropTypes.func,
    onLoaded: PropTypes.func,
    limit: PropTypes.number,
    renderHead: PropTypes.func,
    renderItem: PropTypes.func.isRequired,
    renderEmpty: PropTypes.func,
    renderNav: PropTypes.func,
    renderBottom: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {

    return {
      dropdownMode: false,
      limit: 40,
      items: [],
      total: null,
      page: 1
    };
  },
  getInitialState: function getInitialState() {

    return {
      loading: true,
      loadingNext: false,
      loadError: false,
      dropped: false,
      buffer: null
    };
  },
  componentWillUnmount: function componentWillUnmount() {

    monitorBottomHit.unregister();
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    if (this.props.dropdownMode && !utils.size(this.props.query)) return;

    if (this.props.items.length) {

      return monitorBottomHit(this.getAdjacentPage);
    }

    this.getPage(1, true, function () {

      if (_this.props.dropdownMode) return;

      monitorBottomHit(_this.getAdjacentPage);
    });
  },


  /**
   * load anew if query changed
   */

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {

    if (JSON.stringify(prevProps.query) == JSON.stringify(this.props.query)) return;

    this.bufferize();
  },
  bufferize: function bufferize() {
    var _this2 = this;

    if (this.state.buffer) clearTimeout(this.state.buffer);

    this.setState({ buffer: setTimeout(function () {

        _this2.getPage(1, true, monitorBottomHit.assess);
      }, 500) });
  },
  getAdjacentPage: function getAdjacentPage(prev, replace) {

    var newPage = this.props.page + (prev ? -1 : 1);

    if (this.state.loadingNext) return;

    this.getPage(newPage, replace);
  },
  getPage: function getPage(page, replace, cb) {
    var _this3 = this;

    var offset;

    log('getting page %s with query %s', page, JSON.stringify(this.props.query));

    this.setState({
      loading: page == 1,
      loadingNext: page !== 1
    });

    if (page == 1 && this.props.onLoading) {

      this.props.onLoading();
    }

    get(this.props.res, deepExtend({
      offset: (page - 1) * this.props.limit,
      limit: this.props.limit
    }, this.props.query), function (err, result) {

      log('received page %s', page);

      var newState = {
        loading: false,
        loadingNext: false,
        page: err ? _this3.props.page : page,
        loadError: !!err
      };

      if (!err) {

        newState.hasNext = result.total > page * _this3.props.limit;
        newState.hasPrev = page > 1;
      }

      _this3.setState(newState);

      _this3.props.onItemsUpdate(replace ? result.items : update(_this3.props.items, { $push: result.items }), result.total, page);

      if (!err && page == 1 && _this3.props.onLoaded) {

        _this3.props.onLoaded(result.total);
      }

      if (cb) cb(err, result);
    });
  },


  // remove this and do it where it is needed.
  removeItem: function removeItem(itemIndex) {

    var updated = this.props.items.concat();

    updated.splice(itemIndex, 1);

    this.props.onItemsUpdate(updated);
  },
  renderItem: function renderItem(item, i) {

    return this.props.renderItem(item, {
      remove: this.removeItem.bind(null, i)
    }, i);
  },
  renderNav: function renderNav(type) {

    // need some notion of where we stand...

    if (type == 'next' ? this.state.hasNext : this.state.hasPrev) {

      return React.createElement(
        'li',
        { className: 'nav-item', onClick: this.getAdjacentPage.bind(null, type == 'prev', true) },
        React.createElement('i', { className: 'fa fa-ellipsis-h' })
      );
    } else {

      return '';
    }
  },
  renderEmpty: function renderEmpty() {

    if (this.props.items.length || !this.props.renderEmpty) return '';

    return this.props.renderEmpty();
  },
  renderBottom: function renderBottom() {

    if (this.state.hasNext || !this.props.renderBottom) return '';

    return this.props.renderBottom();
  },
  render: function render() {

    if (this.props.dropdownMode) {

      return React.createElement(
        'ul',
        { className: 'dropdown-menu' },
        this.renderNav('prev'),
        this.props.items.map(this.renderItem),
        this.renderNav('next'),
        this.renderEmpty(),
        this.renderBottom()
      );
    } else {

      return React.createElement(
        'div',
        null,
        this.props.renderHead ? React.createElement(
          'div',
          null,
          this.props.renderHead()
        ) : '',
        React.createElement(
          'div',
          null,
          this.props.items.map(this.renderItem),
          this.renderEmpty()
        )
      );
    }
  }
});

function log() {

  //console.log.apply( console, arguments );

}
//# sourceMappingURL=List.js.map