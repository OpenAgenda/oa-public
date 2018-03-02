"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _countries = require('@openagenda/countries');

var _countries2 = _interopRequireDefault(_countries);

var _get = require('@openagenda/utils/get');

var _get2 = _interopRequireDefault(_get);

var _list = require('@openagenda/labels/agenda-locations/list');

var _list2 = _interopRequireDefault(_list);

var _Modal = require('@openagenda/react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _MoreInfo = require('@openagenda/react-components/build/MoreInfo');

var _MoreInfo2 = _interopRequireDefault(_MoreInfo);

var _SearchField = require('@openagenda/react-form-components/build/SearchField');

var _SearchField2 = _interopRequireDefault(_SearchField);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

var _CreateForm = require('./CreateForm');

var _CreateForm2 = _interopRequireDefault(_CreateForm);

var _Filters = require('./Filters');

var _Filters2 = _interopRequireDefault(_Filters);

var _List = require('./List/List');

var _List2 = _interopRequireDefault(_List);

var _LocationItem = require('./LocationItem');

var _LocationItem2 = _interopRequireDefault(_LocationItem);

var _MergeForm = require('./MergeForm');

var _MergeForm2 = _interopRequireDefault(_MergeForm);

var _UpdateForm = require('./UpdateForm');

var _UpdateForm2 = _interopRequireDefault(_UpdateForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loaded = {};

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {

    // general agenda info ( title, slug, )
    agenda: _propTypes2.default.object,

    // optional settings of agenda ( such as tags requirements )
    settings: _propTypes2.default.object,

    // server endpoints
    res: _propTypes2.default.object

  },

  getDefaultProps: function getDefaultProps() {

    return {
      settings: {}
    };
  },
  getInitialState: function getInitialState() {

    return {

      // merge mode enabled or not.
      // if enabled, shows selection checkboxes on list
      // and merge menu on top
      merge: false,
      loading: false,
      form: false,
      query: {},
      locations: [],
      page: 1,
      total: null,
      modal: false

    };
  },
  componentWillMount: function componentWillMount() {
    var _this = this;

    this.actions = (0, _actions2.default)({
      getState: function getState() {
        return _this.state;
      },
      setState: function setState(newState) {
        return _this.setState(newState);
      }
    });
  },
  onSearchChange: function onSearchChange(field, newSearchValue) {

    if (arguments.length == 1) {

      newSearchValue = field;

      field = 'search';
    }

    this.actions.queryChange(_actions2.default.updateSearchQuery(this.actions.getQuery(), field, newSearchValue));
  },
  getCountryLabel: function getCountryLabel(code) {

    if (loaded[code] === undefined) {

      loaded[code] = _countries2.default.getLabel(code);
    }

    return loaded[code] !== null ? loaded[code][this.props.lang] : null;
  },
  getLabel: function getLabel(name, values) {

    var str = _list2.default[name][this.props.lang],
        k;

    if (values) {

      for (k in values) {

        str = str.replace(k, values[k]);
      }
    }

    return str;
  },
  renderItem: function renderItem(item, itemActions, itemIndex) {

    return _react2.default.createElement(_LocationItem2.default, {
      merge: this.state.merge,
      key: item.uid,
      location: item,
      seeEventsRes: this.props.res.seeEvents.replace(':agendaSlug', this.props.agenda.slug),
      onSelect: this.state.merge ? this.actions.toggleMergeItem.bind(null, item) : this.actions.editLocation.bind(null, item, itemIndex),
      onEdit: this.actions.editLocation.bind(null, item, itemIndex),
      onRemove: this.confirmRemove.bind(null, item, itemIndex),
      getLabel: this.getLabel,
      getCountryLabel: this.getCountryLabel });
  },
  confirmRemove: function confirmRemove(location, index) {
    var _this2 = this;

    (0, _get2.default)(this.props.res.get.replace(':locationUid', location.uid), { detailed: 1 }, function (err, location) {

      if (err) return console.error(err);

      _this2.actions.displayRemoveConfirmModal(location);
    });
  },
  onRemoveLocation: function onRemoveLocation(location, index) {
    var _this3 = this;

    (0, _xhr2.default)({
      uri: this.props.res.remove,
      method: 'post',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid: location.uid })
    }, function (err, result) {

      if (err || result.statusCode !== 200) {

        log('error', err || result.statusCode);
      } else {

        if (JSON.parse(result.body).removed) {

          _this3.actions.removedLocation(index);
        }
      }
    });
  },
  launchMerge: function launchMerge() {
    var _this4 = this;

    if (!this.state.merge || !this.state.merge.locationUids.length) return;

    (0, _get2.default)(this.props.res.index, {
      uids: this.state.merge.locationUids
    }, function (err, result) {

      if (err) {

        log('error', err);

        return;
      }

      _this4.actions.launchMerge(result.items);
    });
  },
  renderHead: function renderHead() {

    return _react2.default.createElement(
      'div',
      { className: 'head' },
      Object.keys(this.actions.getQuery()).length ? _react2.default.createElement(_Filters2.default, {
        locations: this.state.locations,
        query: this.actions.getQuery(),
        getLabel: this.getLabel,
        onQueryChange: this.actions.queryChange }) : null,
      this.state.total ? _react2.default.createElement(
        'p',
        null,
        this.getLabel('total', { '%count%': this.state.total })
      ) : null,
      this.state.total === 0 ? _react2.default.createElement(
        'p',
        null,
        this.getLabel('totalzero')
      ) : null
    );
  },
  renderRemoveLocationModal: function renderRemoveLocationModal() {
    var _this5 = this;

    var eventCount = this.state.modal.data.location.eventCount,
        seeEventsLink = this.props.res.seeEvents.replace(':agendaSlug', this.props.agenda.slug).replace(':locationUid', this.state.modal.data.location.uid),
        isRemoved = this.state.modal.data.isRemoved,
        modalStates = isRemoved ? 'removed' : eventCount ? 'withEvents' : 'noEvents';

    return _react2.default.createElement(
      _Modal2.default,
      { title: this.getLabel('removeTitle'), onClose: this.actions.closeModal },
      function () {
        switch (modalStates) {

          case 'removed':

            return _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'p',
                { className: 'text-center' },
                _this5.getLabel('removeComplete')
              ),
              _react2.default.createElement(
                'div',
                { className: 'text-center' },
                _react2.default.createElement(
                  'a',
                  { className: 'btn btn-primary', onClick: _this5.actions.closeModal },
                  _this5.getLabel('closeModal')
                )
              )
            );

          case 'noEvents':

            return _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'p',
                { className: 'text-center' },
                _this5.getLabel('confirmRemoveMessage')
              ),
              _react2.default.createElement(
                'div',
                { className: 'text-center' },
                _react2.default.createElement(
                  'a',
                  {
                    onClick: _this5.onRemoveLocation.bind(null, _this5.state.modal.data.location, _this5.state.modal.data.index),
                    className: 'btn btn-danger' },
                  _this5.getLabel('confirmRemove')
                )
              )
            );

          case 'withEvents':

            return _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                'p',
                { className: 'text-center' },
                _this5.getLabel('cannotRemove', { '%eventCount%': eventCount })
              ),
              _react2.default.createElement(
                'div',
                { className: 'text-center' },
                _react2.default.createElement(
                  'a',
                  { className: 'btn btn-primary', href: seeEventsLink },
                  _this5.getLabel('seeevents')
                )
              )
            );

        }
      }()
    );
  },
  renderMergeMenu: function renderMergeMenu() {

    return _react2.default.createElement(
      'div',
      { className: 'merge-menu' },
      _react2.default.createElement(
        'p',
        null,
        this.getLabel('mergedescription'),
        _react2.default.createElement(
          'button',
          {
            onClick: this.launchMerge,
            className: 'btn btn-primary margin-left-sm' },
          this.getLabel('launchmerge')
        )
      ),
      this.state.merge.locationUids.length ? _react2.default.createElement(
        'span',
        { className: 'info' },
        this.getLabel('mergeselection', { '%count%': this.state.merge.locationUids.length }),
        _react2.default.createElement(
          'a',
          {
            onClick: this.onSearchChange.bind(null, 'uids', this.state.merge.locationUids) },
          this.getLabel('seemergelist')
        )
      ) : _react2.default.createElement(
        'span',
        { className: 'info' },
        this.getLabel('mergenoselection')
      )
    );
  },
  renderMergeAction: function renderMergeAction() {

    return _react2.default.createElement(
      'div',
      { className: 'form-group' },
      !this.state.merge ? _react2.default.createElement(
        'button',
        { className: 'btn btn-default',
          onClick: this.actions.toggleMerge.bind(null, true) },
        this.getLabel('merge')
      ) : _react2.default.createElement(
        'button',
        { className: 'btn btn-danger',
          onClick: this.actions.toggleMerge.bind(null, false) },
        this.getLabel('cancelmerge')
      )
    );
  },
  getMode: function getMode() {

    if (!this.state.form) return 'list';

    if (this.state.form.alternatives && this.state.merge) return 'merge';

    if (this.state.form.location) return 'update';

    return 'create';
  },
  render: function render() {
    var _this6 = this;

    switch (this.getMode()) {

      case 'merge':
        return _react2.default.createElement(
          'div',
          { className: 'agenda-admin-locations' },
          _react2.default.createElement(_MergeForm2.default, _extends({}, this.props, { actions: this.actions }))
        );

      case 'create':
        return _react2.default.createElement(
          'div',
          { className: 'agenda-admin-locations' },
          _react2.default.createElement(_CreateForm2.default, _extends({}, this.props, { actions: this.actions }))
        );

      case 'update':
        return _react2.default.createElement(
          'div',
          { className: 'agenda-admin-locations' },
          _react2.default.createElement(_UpdateForm2.default, _extends({}, this.props, { actions: this.actions }))
        );

    }

    return _react2.default.createElement(
      'div',
      { className: 'agenda-admin-locations' },
      _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'div',
          { className: 'row list-actions' },
          _react2.default.createElement(
            'div',
            { className: 'col col-sm-12' },
            _react2.default.createElement(
              'div',
              { className: 'form-inline' },
              _react2.default.createElement(
                'div',
                { className: 'form-group' },
                _react2.default.createElement(
                  'button',
                  {
                    className: 'btn btn-primary',
                    onClick: this.actions.newLocation.bind(null) },
                  this.getLabel('create')
                )
              ),
              this.renderMergeAction()
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'row list-filters' },
          _react2.default.createElement(
            'div',
            { className: 'col col-sm-12' },
            _react2.default.createElement(
              'div',
              { className: 'form-inline' },
              _react2.default.createElement(
                'div',
                { className: 'form-group' },
                _react2.default.createElement(_SearchField2.default, {
                  value: this.actions.getQuery().search,
                  label: this.getLabel('search'),
                  placeholder: this.getLabel('search'),
                  onChange: this.onSearchChange })
              ),
              _react2.default.createElement(
                'div',
                { className: 'checkbox' },
                _react2.default.createElement(
                  'label',
                  null,
                  _react2.default.createElement('input', {
                    type: 'checkbox',
                    onChange: this.onSearchChange.bind(null, 'state', parseInt(this.actions.getQuery().state) === 0 ? undefined : 0),
                    checked: parseInt(this.actions.getQuery().state) === 0 }),
                  ' ',
                  this.getLabel('toverify')
                ),
                _react2.default.createElement(_MoreInfo2.default, {
                  className: 'margin-left-sm',
                  id: 'checkbox-help',
                  content: this.getLabel('verifiedInfo'),
                  placement: 'top'
                })
              )
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'row list' },
          _react2.default.createElement(
            'div',
            { className: 'col col-sm-12' },
            this.state.merge ? this.renderMergeMenu() : null,
            _react2.default.createElement(_List2.default, {
              res: this.props.res.index,
              query: this.actions.getQuery(),
              renderItem: this.renderItem,
              renderHead: this.renderHead,
              items: this.state.locations,
              page: this.state.page,
              total: this.state.total,
              onItemsUpdate: this.actions.updateLocationList })
          )
        ),
        this.state.modal ? function () {
          switch (_this6.state.modal.type) {

            case 'removeLocation':
              return _this6.renderRemoveLocationModal();

          }
        }() : null
      )
    );
  }
});

function log() {

  console.log.apply(console, arguments);
}
//# sourceMappingURL=AgendaAdminLocations.js.map