'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _dec, _dec2, _dec3, _class, _class2, _temp, _initialiseProps;

var _reduxConnect = require('redux-connect');

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.throttle');

var _lodash4 = _interopRequireDefault(_lodash3);

var _deepExtend = require('deep-extend');

var _deepExtend2 = _interopRequireDefault(_deepExtend);

var _monitorBottomHit = require('dom-utils/monitorBottomHit');

var _monitorBottomHit2 = _interopRequireDefault(_monitorBottomHit);

var _Modal = require('react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _Spinner = require('react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _reactBootstrap = require('react-bootstrap');

var _InviteMembersForm = require('../../components/InviteMembersForm/InviteMembersForm');

var _InviteMembersForm2 = _interopRequireDefault(_InviteMembersForm);

var _members = require('../../redux/modules/members');

var membersActions = _interopRequireWildcard(_members);

var _modals = require('../../redux/modules/modals');

var modalsActions = _interopRequireWildcard(_modals);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  Dashboard: {
    displayName: 'Dashboard'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/Dashboard/Dashboard.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var selector = (0, _reduxForm.formValueSelector)('membersDashboard');

var searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

var Dashboard = _wrapComponent('Dashboard')((_dec = (0, _reduxConnect.asyncConnect)([{
  promise: function promise(_ref) {
    var _ref$store = _ref.store,
        dispatch = _ref$store.dispatch,
        getState = _ref$store.getState;

    var promises = [];
    var state = getState();
    var query = state.routing.locationBeforeTransitions.query;

    if (!membersActions.isLoaded(state)) {
      promises.push(dispatch(membersActions.getStats()));
      promises.push(dispatch(membersActions.load(query)));
    }

    return Promise.all(promises);
  }
}]), _dec2 = (0, _reactRedux.connect)(function (state, props) {
  return {
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    stakeholders: state.members.data,
    page: state.members.page,
    total: state.members.total,
    loading: state.members.loading,
    nextLoading: state.members.nextLoading,
    credFilters: state.members.credFilters,
    stats: state.members.stats,
    search: selector(state, 'search'),
    agenda: state.agenda,
    perPageLimit: state.settings.perPageLimit,
    modals: state.modals
  };
}, _extends({}, membersActions, modalsActions)), _dec3 = (0, _reduxForm.reduxForm)({
  form: 'membersDashboard'
}), _dec(_class = _dec2(_class = _dec3(_class = (_temp = _class2 = function (_Component) {
  _inherits(Dashboard, _Component);

  function Dashboard(props) {
    _classCallCheck(this, Dashboard);

    var _this = _possibleConstructorReturn(this, (Dashboard.__proto__ || Object.getPrototypeOf(Dashboard)).call(this, props));

    _initialiseProps.call(_this);

    _this.addFilter = _this.addFilter.bind(_this);
    _this.removeFilter = _this.removeFilter.bind(_this);
    _this.cleanFilters = _this.cleanFilters.bind(_this);
    return _this;
  }

  _createClass(Dashboard, [{
    key: 'addFilter',
    value: function addFilter(e, key) {
      var _this2 = this;

      e.preventDefault();

      var _props = this.props,
          addCredFilter = _props.addCredFilter,
          search = _props.search;

      addCredFilter(key);
      this.forceUpdate(function () {
        return _this2.search({ search: search });
      });
    }
  }, {
    key: 'removeFilter',
    value: function removeFilter(e, key) {
      var _this3 = this;

      e.preventDefault();

      var _props2 = this.props,
          removeCredFilter = _props2.removeCredFilter,
          search = _props2.search;

      removeCredFilter(key);
      this.forceUpdate(function () {
        return _this3.search({ search: search });
      });
    }
  }, {
    key: 'cleanFilters',
    value: function cleanFilters(e) {
      var _this4 = this;

      e.preventDefault();

      var _props3 = this.props,
          cleanCredFilters = _props3.cleanCredFilters,
          search = _props3.search;

      cleanCredFilters();
      this.forceUpdate(function () {
        return _this4.search({ search: search });
      });
    }
  }, {
    key: 'credentialToStr',
    value: function credentialToStr(credential) {
      var getLabel = this.context.getLabel;


      switch (credential) {
        case 1:
          return getLabel('contributor');
        case 2:
          return getLabel('administrator');
        case 3:
          return getLabel('moderator');
        case 4:
          return getLabel('reader');
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      (0, _monitorBottomHit2.default)((0, _lodash4.default)(this.nextPage, 400, { trailing: false }));
    }
  }, {
    key: 'renderStakeholder',
    value: function renderStakeholder(stakeholder) {
      var id = stakeholder.id,
          credential = stakeholder.credential,
          custom = stakeholder.custom,
          eventCount = stakeholder.eventCount,
          user = stakeholder.user;
      var getLabel = this.context.getLabel;
      var _props4 = this.props,
          res = _props4.res,
          showModal = _props4.showModal;


      if (!stakeholder.user) return _react3.default.createElement('div', { key: id });

      return _react3.default.createElement(
        'div',
        { key: id, className: 'bo-list-item media' },
        _react3.default.createElement(
          'div',
          { className: 'media-body' },
          _react3.default.createElement(
            'div',
            { className: 'title media-heading' },
            _react3.default.createElement(
              'strong',
              null,
              user.full_name
            ),
            ' ',
            _react3.default.createElement(
              'span',
              { className: 'text-muted small' },
              this.credentialToStr(credential)
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'actions' },
            custom.organization && custom.organization.label && _react3.default.createElement(
              'p',
              { className: 'text-muted' },
              custom.organization.label
            ),
            custom.contactNumber && _react3.default.createElement(
              'p',
              { className: 'text-muted' },
              custom.contactNumber
            ),
            _react3.default.createElement(
              'p',
              { className: 'text-muted' },
              user.email
            ),
            _react3.default.createElement(
              'a',
              {
                href: res.showContributor.replace(':contributorUid', user.uid),
                className: 'text-muted' },
              eventCount,
              ' ',
              getLabel('events')
            )
          )
        )
      );
    }
  }, {
    key: 'renderFilter',
    value: function renderFilter(nbr, key, label) {
      var credFilters = this.props.credFilters;

      var toggleFilter = credFilters.includes(key) ? this.removeFilter : this.addFilter;

      return _react3.default.createElement(
        'li',
        { role: 'presentation', className: (0, _classnames2.default)({ active: credFilters.includes(key) }) },
        _react3.default.createElement(
          'a',
          { href: '#', onClick: function onClick(e) {
              return toggleFilter(e, key);
            } },
          _react3.default.createElement(
            'strong',
            null,
            nbr
          ),
          ' ',
          label,
          ' ',
          _react3.default.createElement('i', {
            className: (0, _classnames2.default)('fa fa-times', { invisible: !credFilters.includes(key) }),
            'aria-hidden': 'true'
          })
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var _props5 = this.props,
          res = _props5.res,
          handleSubmit = _props5.handleSubmit,
          stakeholders = _props5.stakeholders,
          total = _props5.total,
          loading = _props5.loading,
          nextLoading = _props5.nextLoading,
          credFilters = _props5.credFilters,
          stats = _props5.stats,
          showModal = _props5.showModal,
          closeModal = _props5.closeModal,
          modals = _props5.modals,
          remove = _props5.remove,
          perPageLimit = _props5.perPageLimit;
      var getLabel = this.context.getLabel;
      var _stats$credentialTota = stats.credentialTotals,
          totalAdministrator = _stats$credentialTota.administrator,
          totalModerator = _stats$credentialTota.moderator,
          totalContributor = _stats$credentialTota.contributor,
          totalReader = _stats$credentialTota.reader;


      var removeModal = modals.removeMember || {};
      var inviteMembersModal = modals.inviteMembers || {};

      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'h2',
          null,
          getLabel('members')
        ),
        _react3.default.createElement(
          'p',
          null,
          getLabel('total'),
          ': ',
          _react3.default.createElement(
            'strong',
            null,
            stats.total || 0
          )
        ),
        _react3.default.createElement(
          'ul',
          { className: 'nav nav-pills', role: 'tablist' },
          totalAdministrator > 0 && this.renderFilter(totalAdministrator || 0, 'administrator', 'Administrateurs'),
          totalModerator > 0 && this.renderFilter(totalModerator || 0, 'moderator', 'Modérateurs'),
          totalContributor > 0 && this.renderFilter(totalContributor || 0, 'contributor', 'Contributeurs'),
          totalReader > 0 && this.renderFilter(totalReader || 0, 'reader', 'Lecteurs')
        ),
        _react3.default.createElement(
          'form',
          { onSubmit: handleSubmit(this.search) },
          _react3.default.createElement(_reduxForm.Field, {
            component: this.renderSearchInput,
            name: 'search',
            type: 'text',
            classNameGroup: 'search margin-v-md',
            className: 'form-control',
            placeholder: getLabel('searchMember'),
            action: this.debouncedSearch,
            loading: loading
          })
        ),
        total > 0 && _react3.default.createElement(
          'div',
          { className: 'margin-v-md' },
          getLabel('result'),
          ': ',
          total,
          ' ',
          getLabel('members').toLowerCase()
        ),
        _react3.default.createElement(
          'div',
          null,
          stakeholders && stakeholders.map(function (s) {
            return _this5.renderStakeholder(s);
          }),
          !stakeholders || !stakeholders.length ? _react3.default.createElement(
            'div',
            { className: 'text-center text-muted margin-v-md' },
            getLabel('noResult')
          ) : null,
          nextLoading && _react3.default.createElement(
            'div',
            { className: 'padding-v-md', style: { position: 'relative' } },
            _react3.default.createElement(_Spinner2.default, null)
          )
        ),
        _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('removeMember'),
            visible: removeModal.visible || false,
            onClose: function onClose() {
              return closeModal('removeMember');
            }
          },
          _react3.default.createElement(
            'p',
            { className: 'margin-top-sm' },
            getLabel('removeConfirmMessage')
          ),
          _react3.default.createElement(
            'div',
            { className: 'text-center' },
            _react3.default.createElement(
              'button',
              {
                className: 'btn btn-danger',
                onClick: function onClick() {
                  return remove(removeModal.id).then(function () {
                    return closeModal('removeMember');
                  });
                }
              },
              getLabel('removeMember')
            )
          )
        ),
        _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('inviteMembers'),
            visible: inviteMembersModal.visible || false,
            onClose: function onClose() {
              return closeModal('inviteMembers');
            }
          },
          _react3.default.createElement(_InviteMembersForm2.default, { onSubmit: function onSubmit() {} }),
          _react3.default.createElement(
            'div',
            { className: 'text-center' },
            _react3.default.createElement(
              'button',
              {
                className: 'btn btn-primary',
                onClick: function onClick() {
                  return remove(inviteMembersModal.id).then(function () {
                    return closeModal('inviteMembers');
                  });
                }
              },
              getLabel('inviteMembers')
            )
          )
        )
      );
    }
  }]);

  return Dashboard;
}(_react2.Component), _class2.propTypes = {
  list: _react2.PropTypes.func,
  remove: _react2.PropTypes.func,
  nextPage: _react2.PropTypes.func,
  res: _react2.PropTypes.object,
  stakeholders: _react2.PropTypes.array,
  addCredFilter: _react2.PropTypes.func,
  removeCredFilter: _react2.PropTypes.func,
  cleanCredFilters: _react2.PropTypes.func,
  credFilters: _react2.PropTypes.array,
  page: _react2.PropTypes.number,
  total: _react2.PropTypes.number,
  stats: _react2.PropTypes.object,
  loading: _react2.PropTypes.bool,
  nextLoading: _react2.PropTypes.bool,
  search: _react2.PropTypes.string,
  slug: _react2.PropTypes.string,
  perPageLimit: _react2.PropTypes.number,
  showModal: _react2.PropTypes.func,
  closeModal: _react2.PropTypes.func,
  modals: _react2.PropTypes.object
}, _class2.contextTypes = {
  router: _react2.PropTypes.object,
  getLabel: _react2.PropTypes.func
}, _initialiseProps = function _initialiseProps() {
  var _this6 = this;

  this.renderField = function (_ref2) {
    var content = _ref2.content,
        _ref2$input = _ref2.input,
        name = _ref2$input.name,
        value = _ref2$input.value,
        label = _ref2.label,
        subLabel = _ref2.subLabel,
        max = _ref2.max,
        classNameGroup = _ref2.classNameGroup,
        visible = _ref2.visible,
        errorOnDirty = _ref2.errorOnDirty,
        _ref2$meta = _ref2.meta,
        touched = _ref2$meta.touched,
        error = _ref2$meta.error,
        dirty = _ref2$meta.dirty;

    var displayError = errorOnDirty ? dirty || touched : touched;

    if (visible === false) return _react3.default.createElement('div', null);

    return _react3.default.createElement(
      'div',
      { className: 'form-group ' + classNameGroup + ' ' + (displayError && error ? 'has-error has-feedback' : '') },
      label && _react3.default.createElement(
        'label',
        { htmlFor: name },
        label
      ),
      subLabel,
      content,
      displayError && error && _react3.default.createElement(
        'span',
        { className: 'form-control-feedback' },
        _react3.default.createElement('i', { className: 'fa fa-times', 'aria-hidden': 'true' })
      ),
      displayError && error && _react3.default.createElement(
        'div',
        { className: 'text-danger ' + (max && 'pull-left' || '') },
        _this6.context.getLabel(error)
      ),
      max && _react3.default.createElement(
        'div',
        { className: 'text-right ' + (max - value.length < 0 && 'text-danger' || '') },
        max - value.length
      )
    );
  };

  this.renderSearchInput = function (_ref3) {
    var type = _ref3.type,
        placeholder = _ref3.placeholder,
        className = _ref3.className,
        spellCheck = _ref3.spellCheck,
        action = _ref3.action,
        loading = _ref3.loading,
        props = _objectWithoutProperties(_ref3, ['type', 'placeholder', 'className', 'spellCheck', 'action', 'loading']);

    var inputAttrs = { type: type, placeholder: placeholder, className: className, spellCheck: spellCheck };
    var onChange = function onChange(e) {
      props.input.onChange(e.target.value);
      action();
    };
    var content = _react3.default.createElement(
      'div',
      { className: 'input-icon-right' },
      _react3.default.createElement('input', _extends({}, props.input, inputAttrs, { onChange: onChange })),
      _react3.default.createElement(
        'button',
        { type: 'submit', className: 'btn' },
        loading ? _react3.default.createElement(_Spinner2.default, { spinner: searchSpinner }) : _react3.default.createElement('i', { className: 'fa fa-search', 'aria-hidden': 'true' })
      )
    );
    return _this6.renderField(_extends({ content: content }, props));
  };

  this.search = function (_ref4) {
    var search = _ref4.search;
    var _props6 = _this6.props,
        list = _props6.list,
        location = _props6.location,
        credFilters = _props6.credFilters;


    var query = { search: search || undefined, credentials: credFilters };

    return list(query).then(function () {
      return _this6.context.router.push(_extends({}, location, { query: query }));
    });
  };

  this.debouncedSearch = (0, _lodash2.default)(this.props.handleSubmit(this.search), 400);

  this.nextPage = function () {
    var _props7 = _this6.props,
        page = _props7.page,
        total = _props7.total,
        search = _props7.search,
        loading = _props7.loading,
        nextLoading = _props7.nextLoading,
        stakeholders = _props7.stakeholders,
        perPageLimit = _props7.perPageLimit;

    if (!stakeholders || !stakeholders.length || loading || nextLoading || page * perPageLimit >= total) return;
    _this6.props.nextPage({ search: search }, (page || 1) + 1);
  };
}, _temp)) || _class) || _class) || _class));

exports.default = Dashboard;
;
module.exports = exports['default'];