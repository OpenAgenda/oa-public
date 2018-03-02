"use strict";

var React = require('react'),
    PropTypes = require('prop-types'),
    createReactClass = require('create-react-class'),
    Spinner = require('@openagenda/react-components/build/Spinner'),
    SearchField = require('./List/SearchField'),
    List = require('./List/List');

module.exports = createReactClass({
  displayName: 'exports',


  propTypes: {

    lang: PropTypes.string,

    onCreateRequest: PropTypes.func,

    onSelect: PropTypes.func,

    getLabel: PropTypes.func

  },

  getInitialState: function getInitialState() {

    return {
      query: this.props.init ? { search: this.props.init } : {},
      showDropdown: false,
      loading: false,
      page: 1,
      total: null,
      locations: []
    };
  },

  /**
   * click outside the component means the dropdown
   * should close
   */
  componentDidMount: function componentDidMount() {

    var bodyElem = document.getElementsByTagName('body')[0];

    this['location-search'].addEventListener('click', this.preemptClose);

    bodyElem.addEventListener('click', this.triggerClose);
  },

  componentWillUnmount: function componentWillUnmount() {

    var bodyElem = document.getElementsByTagName('body')[0];

    bodyElem.removeEventListener('click', this.triggerClose);

    this['location-search'].removeEventListener('click', this.preemptClose);
  },

  triggerClose: function triggerClose() {

    if (!this.closePreempted) {

      this.setState({ showDropdown: false });
    }

    this.closePreempted = false;
  },

  preemptClose: function preemptClose() {

    this.closePreempted = true;
  },

  onSearchChange: function onSearchChange(value) {

    this.setState({
      query: { search: value }
    });
  },

  onListLoading: function onListLoading() {

    this.setState({
      loading: true,
      showDropdown: false
    });
  },

  onListLoaded: function onListLoaded(total) {

    this.setState({
      loading: false,
      showDropdown: true
    });
  },

  renderItem: function renderItem(l) {

    return React.createElement(
      'li',
      { onClick: this.props.onSelect.bind(null, l), className: 'search-item', key: l.uid },
      React.createElement(
        'div',
        { className: 'name' },
        l.name
      ),
      React.createElement(
        'div',
        { className: 'address' },
        l.address
      )
    );
  },

  renderCreateItem: function renderCreateItem() {

    return React.createElement(
      'li',
      { className: 'search-item', onClick: this.props.onCreateRequest.bind(null, this.state.query.search) },
      React.createElement(
        'a',
        null,
        this.props.getLabel('create')
      )
    );
  },

  renderEmpty: function renderEmpty() {

    return React.createElement(
      'li',
      { className: 'no-search-result' },
      this.props.getLabel('noresult')
    );
  },

  render: function render() {
    var _this = this;

    var self = this;

    return React.createElement(
      'div',
      {
        ref: function ref(r) {
          return _this['location-search'] = r;
        },
        className: this.state.showDropdown ? 'dropdown open' : 'dropdown'
      },
      React.createElement(SearchField, {
        name: 'name',
        loading: this.state.loading,
        value: this.state.query.search,
        placeholder: this.props.getLabel('namePlaceholder'),
        onChange: this.onSearchChange }),
      this.state.loading ? React.createElement(Spinner, { mode: 'inline', loading: true, message: this.props.getLabel('searching') }) : null,
      React.createElement(List, {
        items: this.state.locations,
        page: this.state.page,
        total: this.state.total,
        onItemsUpdate: function onItemsUpdate(locations, total, page) {
          _this.setState({ locations: locations, total: total, page: page });
        },
        limit: 10,
        dropdownMode: true,
        res: this.props.res.index,
        query: this.state.query,
        renderItem: this.renderItem,
        renderHead: this.renderHead,
        renderEmpty: this.renderEmpty,
        renderBottom: this.renderCreateItem,
        onLoaded: this.onListLoaded,
        onLoading: this.onListLoading })
    );
  }

});
//# sourceMappingURL=LocationSearch.js.map