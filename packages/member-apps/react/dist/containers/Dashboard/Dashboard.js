'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _redboxReact2 = require('redbox-react');

var _redboxReact3 = _interopRequireDefault(_redboxReact2);

var _react2 = require('react');

var _react3 = _interopRequireDefault(_react2);

var _reactTransformCatchErrors3 = require('react-transform-catch-errors');

var _reactTransformCatchErrors4 = _interopRequireDefault(_reactTransformCatchErrors3);

var _dec, _dec2, _dec3, _class, _class2, _temp;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reduxConnect = require('redux-connect');

var _reactRedux = require('react-redux');

var _reduxForm = require('redux-form');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _upperFirst = require('lodash/upperFirst');

var _upperFirst2 = _interopRequireDefault(_upperFirst);

var _reactBootstrap = require('react-bootstrap');

var _monitorBottomHit = require('@openagenda/dom-utils/monitorBottomHit');

var _monitorBottomHit2 = _interopRequireDefault(_monitorBottomHit);

var _Modal = require('@openagenda/react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _MoreInfo = require('@openagenda/react-components/build/MoreInfo');

var _MoreInfo2 = _interopRequireDefault(_MoreInfo);

var _Spinner = require('@openagenda/react-form-components/build/Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

var _openRequestForm = require('@openagenda/call-to-action/react/dist/openRequestForm');

var _openRequestForm2 = _interopRequireDefault(_openRequestForm);

var _InviteMembersForm = require('../../components/InviteMembersForm/InviteMembersForm');

var _InviteMembersForm2 = _interopRequireDefault(_InviteMembersForm);

var _EditMemberForm = require('../../components/EditMemberForm/EditMemberForm');

var _EditMemberForm2 = _interopRequireDefault(_EditMemberForm);

var _SendMessageForm = require('../../components/SendMessageForm/SendMessageForm');

var _SendMessageForm2 = _interopRequireDefault(_SendMessageForm);

var _members = require('../../redux/modules/members');

var membersActions = _interopRequireWildcard(_members);

var _modals = require('../../redux/modules/modals');

var modalsActions = _interopRequireWildcard(_modals);

var _form = require('../../utils/form');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var dashboardValuesSelector = (0, _reduxForm.formValueSelector)('membersDashboard');
// const selector = formValueSelector( 'membersDashboard' );

var base64encode = function base64encode(str) {
  // str = encodeURIComponent( str );
  return typeof window === 'undefined' ? new Buffer(str).toString('base64') : btoa(str);
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

    return _promise2.default.all(promises);
  }
}]), _dec2 = (0, _reactRedux.connect)(function (state, props) {
  return {
    initialValues: {
      search: props.location.query.search || ''
    },
    res: state.res,
    credentials: state.agenda.credentials,
    userCredential: state.stakeholder.credential,
    stakeholders: state.members.data,
    page: state.members.page,
    total: state.members.total,
    loading: state.members.loading,
    nextLoading: state.members.nextLoading,
    credFilters: state.members.credFilters,
    showInviteResult: state.members.showInviteResult,
    inviteError: state.members.inviteError,
    stats: state.members.stats,
    search: dashboardValuesSelector(state, 'search'),
    agenda: state.agenda,
    perPageLimit: state.settings.perPageLimit,
    modals: state.modals,
    roles: state.agenda.roles
  };
}, (0, _extends3.default)({}, membersActions, modalsActions)), _dec3 = (0, _reduxForm.reduxForm)({
  form: 'membersDashboard'
}), _dec(_class = _dec2(_class = _dec3(_class = (_temp = _class2 = function (_Component) {
  (0, _inherits3.default)(Dashboard, _Component);

  function Dashboard(props) {
    (0, _classCallCheck3.default)(this, Dashboard);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Dashboard.__proto__ || (0, _getPrototypeOf2.default)(Dashboard)).call(this, props));

    _this.search = function (_ref2) {
      var search = _ref2.search;
      var _this$props = _this.props,
          list = _this$props.list,
          location = _this$props.location,
          credFilters = _this$props.credFilters;


      var query = { search: search || undefined, credentials: credFilters };

      return list(query).then(function () {
        return _this.context.router.push((0, _extends3.default)({}, location, { query: query }));
      });
    };

    _this.debouncedSearch = (0, _debounce2.default)(_this.props.handleSubmit(_this.search), 400);

    _this.nextPage = function () {
      var _this$props2 = _this.props,
          page = _this$props2.page,
          total = _this$props2.total,
          search = _this$props2.search,
          credFilters = _this$props2.credFilters,
          loading = _this$props2.loading,
          nextLoading = _this$props2.nextLoading,
          stakeholders = _this$props2.stakeholders,
          perPageLimit = _this$props2.perPageLimit;

      if (!stakeholders || !stakeholders.length || loading || nextLoading || page * perPageLimit >= total) return;
      _this.props.nextPage({ search: search || undefined, credentials: credFilters }, (page || 1) + 1);
    };

    _this.addFilter = _this.addFilter.bind(_this);
    _this.removeFilter = _this.removeFilter.bind(_this);
    _this.cleanFilters = _this.cleanFilters.bind(_this);
    _this.renderField = _form.renderField.bind(_this);
    _this.renderSearchInput = _form.renderSearchInput.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Dashboard, [{
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
      (0, _monitorBottomHit2.default)((0, _throttle2.default)(this.nextPage, 400, { trailing: false }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _monitorBottomHit2.default.stop();
    }
  }, {
    key: 'renderStakeholder',
    value: function renderStakeholder(stakeholder) {
      var id = stakeholder.id,
          credential = stakeholder.credential,
          invited = stakeholder.invited,
          custom = stakeholder.custom,
          eventCount = stakeholder.eventCount,
          user = stakeholder.user,
          deletedUser = stakeholder.deletedUser,
          owner = stakeholder.owner;
      var _props4 = this.props,
          res = _props4.res,
          showModal = _props4.showModal,
          userCredential = _props4.userCredential,
          resendInvitation = _props4.resendInvitation;
      var getLabel = this.context.getLabel;


      var stakeholderType = function () {
        if (invited && !deletedUser) return 'invited';
        if (credential === 1 && eventCount === 0) return 'noContrib';
        if (deletedUser && !invited) return 'deleted';
      }();

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
              custom.contactName || user && user.full_name || (invited ? custom.email || getLabel('invited') : getLabel('noName'))
            ),
            ' ',
            _react3.default.createElement(
              'span',
              { className: 'text-muted small' },
              this.credentialToStr(credential)
            ),
            ' ',
            _react3.default.createElement(
              _MoreInfo2.default,
              {
                id: 'moreinfo-' + id,
                content: getLabel('moreinfo' + (0, _upperFirst2.default)(stakeholderType))
              },
              _react3.default.createElement(
                'span',
                {
                  className: (0, _classnames2.default)('badge', 'badge-sm', {
                    'badge-info': stakeholderType === 'invited',
                    'badge-default': stakeholderType === 'inactive',
                    'badge-success': stakeholderType === 'active',
                    'badge-warning': ['deleted', 'noContrib'].includes(stakeholderType)
                  })
                },
                stakeholderType === 'noContrib' && getLabel('noContrib'),
                stakeholderType === 'invited' && getLabel('invited'),
                stakeholderType === 'deleted' && getLabel('deleted')
              )
            )
          ),
          _react3.default.createElement(
            'div',
            { className: 'actions' },
            (custom.organization || custom.contactPosition) && _react3.default.createElement(
              'p',
              null,
              _react3.default.createElement(
                'span',
                { className: 'text-muted' },
                custom.organization || null
              ),
              custom.organization && custom.contactPosition && ' - ',
              _react3.default.createElement(
                'span',
                { className: 'text-muted' },
                custom.contactPosition || null
              )
            ),
            !invited && (custom.email || custom.contactNumber) && _react3.default.createElement(
              'p',
              null,
              _react3.default.createElement(
                'span',
                { className: 'text-muted' },
                custom.email || null
              ),
              custom.email && custom.contactNumber && ' - ',
              _react3.default.createElement(
                'span',
                { className: 'text-muted' },
                custom.contactNumber || null
              )
            ),
            _react3.default.createElement(
              'a',
              {
                href: res.showContributor.replace(':contributorId', id),
                className: 'text-muted'
              },
              eventCount,
              ' ',
              getLabel(eventCount && eventCount > 1 ? 'events' : 'event')
            ),
            (userCredential !== 3 || ![2, 3].includes(credential)) && _react3.default.createElement(
              'a',
              {
                role: 'button',
                className: 'text-muted',
                onClick: function onClick() {
                  return showModal('editMember', { stakeholder: stakeholder });
                }
              },
              getLabel('editProfile')
            ),
            !owner && (userCredential !== 3 || ![2, 3].includes(credential)) && _react3.default.createElement(
              'a',
              {
                role: 'button',
                className: 'text-muted',
                onClick: function onClick() {
                  return showModal('removeMember', { stakeholder: stakeholder });
                }
              },
              getLabel('removeMember')
            ),
            user && _react3.default.createElement(
              'a',
              {
                role: 'button',
                className: 'text-muted',
                onClick: function onClick() {
                  return showModal('sendAMessage', { stakeholder: stakeholder });
                }
              },
              getLabel('sendAMessage')
            ),
            invited && _react3.default.createElement(
              'a',
              {
                role: 'button',
                onClick: function onClick() {
                  return resendInvitation(id).then(function () {
                    return showModal('memberReinvited', { stakeholder: stakeholder, success: true });
                  }).catch(function () {
                    return showModal('memberReinvited', { stakeholder: stakeholder, success: false });
                  });
                },
                className: 'text-muted'
              },
              getLabel('resendInvitation')
            )
          )
        )
      );
    }
  }, {
    key: 'renderFilter',
    value: function renderFilter(nbr, key) {
      var _props5 = this.props,
          credFilters = _props5.credFilters,
          credentials = _props5.credentials,
          agenda = _props5.agenda;
      var getLabel = this.context.getLabel;


      var label = key + (nbr > 1 ? 's' : '');
      var toggleFilter = credFilters.includes(key) ? this.removeFilter : this.addFilter;

      /* if ( key === 'moderator' && !credentials.moderators ) {
         return (
          <li role="presentation" className="locked">
            <a href="#" onClick={() => openRequestForm( { lang, subject: 'moderators', agenda: agenda.slug } )}>
              {nbr && <strong>{nbr || 0}</strong>}{' '}{getLabel( label )}{' '}
              <i className="fa fa-unlock-alt" aria-hidden="true"></i>
            </a>
          </li>
        );
       } */

      if (!nbr) return null;

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
            nbr || 0
          ),
          ' ',
          getLabel(label),
          ' ',
          _react3.default.createElement('i', { className: (0, _classnames2.default)('fa fa-times', { invisible: !credFilters.includes(key) }) })
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var _props6 = this.props,
          res = _props6.res,
          handleSubmit = _props6.handleSubmit,
          stakeholders = _props6.stakeholders,
          total = _props6.total,
          loading = _props6.loading,
          nextLoading = _props6.nextLoading,
          stats = _props6.stats,
          showModal = _props6.showModal,
          closeModal = _props6.closeModal,
          setModal = _props6.setModal,
          modals = _props6.modals,
          update = _props6.update,
          invite = _props6.invite,
          remove = _props6.remove,
          sendMessage = _props6.sendMessage,
          sendAMessage = _props6.sendAMessage,
          showInviteResult = _props6.showInviteResult,
          cleanInviteResult = _props6.cleanInviteResult,
          inviteError = _props6.inviteError,
          credentials = _props6.credentials,
          agenda = _props6.agenda;
      var _context = this.context,
          getLabel = _context.getLabel,
          lang = _context.lang;
      var _stats$credentialTota = stats.credentialTotals,
          totalAdministrator = _stats$credentialTota.administrator,
          totalModerator = _stats$credentialTota.moderator,
          totalContributor = _stats$credentialTota.contributor,
          totalReader = _stats$credentialTota.reader;


      var editModal = modals.editMember || {};
      var removeModal = modals.removeMember || {};
      var inviteMembersModal = modals.inviteMembers || {};
      var memberReinvitedModal = modals.memberReinvited || {};
      var writeToMembersModal = modals.writeToMembers || {};
      var sendAMessageModal = modals.sendAMessage || {};

      return _react3.default.createElement(
        'div',
        null,
        _react3.default.createElement(
          'h2',
          null,
          getLabel('members'),
          _react3.default.createElement(
            'div',
            { className: 'pull-right' },
            _react3.default.createElement(
              _reactBootstrap.DropdownButton,
              { bsStyle: 'default', title: getLabel('actions'), id: 'dropdown-actions', pullRight: true },
              _react3.default.createElement(
                _reactBootstrap.MenuItem,
                { onClick: function onClick() {
                    return showModal('inviteMembers');
                  } },
                getLabel('inviteMembers')
              ),
              credentials.invitationMessage && _react3.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
              credentials.invitationMessage && _react3.default.createElement(
                _reactBootstrap.MenuItem,
                { onClick: function onClick() {
                    return showModal('writeToMembers');
                  } },
                getLabel('sendMessageToAll')
              ),
              credentials.invitationMessage && _react3.default.createElement(
                _reactBootstrap.MenuItem,
                { onClick: function onClick() {
                    return showModal('writeToMembers', { inactive: true });
                  } },
                getLabel('sendMessageToInactives')
              ),
              !credentials.invitationMessage && _react3.default.createElement(
                _reactBootstrap.MenuItem,
                {
                  className: 'icon-hoverable',
                  onClick: function onClick() {
                    return (0, _openRequestForm2.default)({ lang: lang, subject: 'writeToAll', agenda: agenda.slug });
                  }
                },
                _react3.default.createElement('i', { className: 'golden-icon' }),
                ' ',
                getLabel('sendMessageToAll')
              ),
              !credentials.invitationMessage && _react3.default.createElement(
                _reactBootstrap.MenuItem,
                {
                  className: 'icon-hoverable',
                  onClick: function onClick() {
                    return (0, _openRequestForm2.default)({ lang: lang, subject: 'moderators', agenda: agenda.slug });
                  }
                },
                _react3.default.createElement('i', { className: 'golden-icon' }),
                ' ',
                getLabel('nameModerators')
              ),
              _react3.default.createElement(_reactBootstrap.MenuItem, { divider: true }),
              _react3.default.createElement(
                _reactBootstrap.MenuItem,
                { href: res.exportToXlsx },
                getLabel('exportToXlsx')
              ),
              _react3.default.createElement(
                _reactBootstrap.MenuItem,
                { href: res.exportToCsv },
                getLabel('exportToCsv')
              )
            )
          )
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
          this.renderFilter(totalAdministrator, 'administrator'),
          this.renderFilter(totalModerator, 'moderator'),
          this.renderFilter(totalContributor, 'contributor'),
          this.renderFilter(totalReader, 'reader')
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
        editModal.visible && _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('editProfile'),
            onClose: function onClose() {
              return closeModal('editMember');
            }
          },
          _react3.default.createElement(_EditMemberForm2.default, {
            stakeholder: editModal.stakeholder,
            onSubmit: function onSubmit() {
              for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
                params[_key] = arguments[_key];
              }

              return update.apply(undefined, [editModal.stakeholder.id].concat(params)).then(function (result) {
                if (result.error && result.error instanceof _reduxForm.SubmissionError) {
                  throw new _reduxForm.SubmissionError(result.error.errors);
                } else {
                  closeModal('editMember');
                }
                return result;
              });
            }
          })
        ),
        removeModal.visible && _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('removeMember'),
            visible: removeModal.visible || false,
            onClose: function onClose() {
              return closeModal('removeMember');
            }
          },
          removeModal.error ? _react3.default.createElement(
            'div',
            { className: 'text-center' },
            _react3.default.createElement(
              'div',
              { className: 'margin-v-sm' },
              getLabel('removeModalError')
            ),
            _react3.default.createElement(
              'button',
              {
                onClick: function onClick() {
                  return closeModal('removeMember');
                },
                className: 'btn btn-danger'
              },
              getLabel('close')
            )
          ) : _react3.default.createElement(
            'div',
            null,
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
                    return remove(removeModal.stakeholder.id).then(function () {
                      return closeModal('removeMember');
                    }).catch(function () {
                      return setModal('removeMember', { error: true });
                    });
                  }
                },
                getLabel('removeMember')
              )
            )
          )
        ),
        inviteMembersModal.visible && _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('inviteMembers'),
            onClose: function onClose() {
              closeModal('inviteMembers');
              cleanInviteResult();
            },
            classNames: {
              overlay: 'popup-overlay big'
            },
            disableBodyScroll: true
          },
          showInviteResult ? _react3.default.createElement(
            'div',
            null,
            inviteError ? _react3.default.createElement(
              'div',
              null,
              inviteError.emailsRejected && inviteError.emailsRejected.length ? _react3.default.createElement(
                'div',
                null,
                getLabel('emailsCouldNotBeInvited'),
                ' ',
                _react3.default.createElement(
                  'b',
                  null,
                  inviteError.emailsRejected.join(', ')
                )
              ) : _react3.default.createElement(
                'div',
                null,
                getLabel('invitationProblem')
              )
            ) : _react3.default.createElement(
              'div',
              null,
              getLabel('membersInvited')
            )
          ) : _react3.default.createElement(_InviteMembersForm2.default, { onSubmit: function onSubmit(data) {
              return invite(data).then(function (result) {
                if (result.error && result.error instanceof _reduxForm.SubmissionError) {
                  throw new _reduxForm.SubmissionError(result.error.errors);
                }
                return result;
              });
            } })
        ),
        memberReinvitedModal.visible && _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('inviteMembers'),
            onClose: function onClose() {
              closeModal('memberReinvited');
            }
          },
          memberReinvitedModal.success ? _react3.default.createElement(
            'div',
            null,
            getLabel('invitationResended')
          ) : _react3.default.createElement(
            'div',
            null,
            getLabel('invitationNotResended')
          )
        ),
        sendAMessageModal && _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel('sendAMessage'),
            visible: sendAMessageModal.visible || false,
            onClose: function onClose() {
              return closeModal('sendAMessage');
            }
          },
          !sendAMessageModal.confirmation ? _react3.default.createElement(_SendMessageForm2.default, { onSubmit: function onSubmit(data) {
              return sendAMessage(data, sendAMessageModal.stakeholder).then(function (result) {
                if (result.error && result.error instanceof _reduxForm.SubmissionError) {
                  throw new _reduxForm.SubmissionError(result.error.errors);
                }
                return result;
              }).then(function () {
                return setModal('sendAMessage', { confirmation: true });
              });
            } }) : _react3.default.createElement(
            'div',
            { className: 'text-center' },
            _react3.default.createElement(
              'div',
              { className: 'margin-v-sm' },
              getLabel('messageSent')
            ),
            _react3.default.createElement(
              'button',
              {
                onClick: function onClick() {
                  return closeModal('sendAMessage');
                },
                className: 'btn btn-danger'
              },
              getLabel('close')
            )
          )
        ),
        writeToMembersModal.visible && _react3.default.createElement(
          _Modal2.default,
          {
            title: getLabel(writeToMembersModal.inactive ? 'sendMessageToInactives' : 'sendMessageToAll'),
            visible: writeToMembersModal.visible || false,
            onClose: function onClose() {
              return closeModal('writeToMembers');
            }
          },
          !writeToMembersModal.confirmation ? _react3.default.createElement(_SendMessageForm2.default, { onSubmit: function onSubmit(data) {
              return sendMessage(data, writeToMembersModal.inactive).then(function (result) {
                if (result.error && result.error instanceof _reduxForm.SubmissionError) {
                  throw new _reduxForm.SubmissionError(result.error.errors);
                }
                return result;
              }).then(function () {
                return setModal('writeToMembers', { confirmation: true });
              });
            } }) : _react3.default.createElement(
            'div',
            { className: 'text-center' },
            _react3.default.createElement(
              'div',
              { className: 'margin-v-sm' },
              getLabel('messageSent')
            ),
            _react3.default.createElement(
              'button',
              {
                onClick: function onClick() {
                  return closeModal('writeToMembers');
                },
                className: 'btn btn-danger'
              },
              getLabel('close')
            )
          )
        )
      );
    }
  }]);
  return Dashboard;
}(_react2.Component), _class2.propTypes = {
  list: _propTypes2.default.func,
  remove: _propTypes2.default.func,
  nextPage: _propTypes2.default.func,
  res: _propTypes2.default.object,
  userCredential: _propTypes2.default.number,
  stakeholders: _propTypes2.default.array,
  addCredFilter: _propTypes2.default.func,
  removeCredFilter: _propTypes2.default.func,
  cleanCredFilters: _propTypes2.default.func,
  credFilters: _propTypes2.default.array,
  page: _propTypes2.default.number,
  total: _propTypes2.default.number,
  stats: _propTypes2.default.object,
  loading: _propTypes2.default.bool,
  nextLoading: _propTypes2.default.bool,
  search: _propTypes2.default.string,
  slug: _propTypes2.default.string,
  perPageLimit: _propTypes2.default.number,
  showModal: _propTypes2.default.func,
  closeModal: _propTypes2.default.func,
  modals: _propTypes2.default.object,
  stopSubmit: _propTypes2.default.func
}, _class2.contextTypes = {
  router: _propTypes2.default.object,
  getLabel: _propTypes2.default.func,
  lang: _propTypes2.default.string
}, _temp)) || _class) || _class) || _class));

exports.default = Dashboard;
;
module.exports = exports['default'];
//# sourceMappingURL=Dashboard.js.map