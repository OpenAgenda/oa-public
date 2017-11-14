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

var _dec, _class, _class2, _temp2;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactRedux = require('react-redux');

var _openRequestForm = require('@openagenda/call-to-action/react/dist/openRequestForm');

var _openRequestForm2 = _interopRequireDefault(_openRequestForm);

var _Modal = require('@openagenda/react-components/build/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _components2 = require('../../components');

var _modals = require('../../redux/modules/modals');

var modalsActions = _interopRequireWildcard(_modals);

var _keys = require('../../redux/modules/keys');

var keysActions = _interopRequireWildcard(_keys);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _components = {
  ContributionEdition: {
    displayName: 'ContributionEdition'
  }
};

var _reactTransformCatchErrors2 = (0, _reactTransformCatchErrors4.default)({
  filename: 'react/src/containers/AdvancedEdition/AdvancedEdition.js',
  components: _components,
  locals: [],
  imports: [_react3.default, _redboxReact3.default]
});

function _wrapComponent(id) {
  return function (Component) {
    return _reactTransformCatchErrors2(Component, id);
  };
}

var zendeskRes = {
  official: 'https://openagenda.zendesk.com/hc/articles/115001581185',
  private: 'https://openagenda.zendesk.com/hc/fr/articles/115001584389'
};

var ContributionEdition = _wrapComponent('ContributionEdition')((_dec = (0, _reactRedux.connect)(function (state) {
  return {
    agenda: state.agenda.data,
    modals: state.modals
  };
}, _extends({}, modalsActions, { removeKey: keysActions.remove })), _dec(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(ContributionEdition, _Component);

  function ContributionEdition() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ContributionEdition);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ContributionEdition.__proto__ || Object.getPrototypeOf(ContributionEdition)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      activeTab: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ContributionEdition, [{
    key: 'setTab',
    value: function setTab(tab) {

      this.setState({ activeTab: tab });
    }
  }, {
    key: 'renderTableRow',
    value: function renderTableRow(tabName, description, closedComponent, openedComponent) {
      var _this2 = this;

      var activeTab = this.state.activeTab;


      return _react3.default.createElement(
        'tr',
        {
          className: (0, _classnames2.default)({ inactive: activeTab !== tabName }),
          onClick: activeTab !== tabName ? function () {
            return _this2.setTab(tabName);
          } : null
        },
        _react3.default.createElement(
          'td',
          {
            className: 'col-md-3',
            style: { cursor: 'pointer' },
            onClick: activeTab === tabName ? function () {
              return _this2.setTab(null);
            } : null
          },
          description
        ),
        activeTab === tabName ? _react3.default.createElement(
          'td',
          null,
          _react3.default.createElement(
            'div',
            {
              className: 'margin-bottom-sm',
              style: { cursor: 'pointer' },
              onClick: function onClick() {
                return _this2.setTab(null);
              }
            },
            closedComponent
          ),
          openedComponent
        ) : _react3.default.createElement(
          'td',
          { style: { cursor: 'pointer' } },
          closedComponent
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          agenda = _props.agenda,
          modals = _props.modals,
          closeModal = _props.closeModal,
          removeKey = _props.removeKey;
      var _context = this.context,
          getLabel = _context.getLabel,
          lang = _context.lang;


      var removeModal = modals['removeKey'] || {};

      return _react3.default.createElement(
        'div',
        { className: 'advanced' },
        _react3.default.createElement(
          'h2',
          { className: 'margin-bottom-lg' },
          getLabel('advanced')
        ),
        _react3.default.createElement(
          'div',
          { className: 'table-responsive' },
          _react3.default.createElement(
            'table',
            { className: 'table' },
            _react3.default.createElement(
              'tbody',
              null,
              this.renderTableRow('keys', _react3.default.createElement(
                'b',
                null,
                getLabel('accessKeys')
              ), getLabel('manageKeys'), _react3.default.createElement(_components2.KeysManager, null)),
              this.renderTableRow('official', _react3.default.createElement(
                'b',
                null,
                getLabel('labeling')
              ), _react3.default.createElement(
                'b',
                { className: 'text-muted' },
                getLabel(agenda.official ? 'officialAgenda' : 'nonOfficialAgenda')
              ), _react3.default.createElement(
                'div',
                null,
                agenda.official ? _react3.default.createElement(
                  'a',
                  { href: zendeskRes.official, target: '_blank' },
                  getLabel('learnMore')
                ) : _react3.default.createElement(
                  'div',
                  null,
                  _react3.default.createElement(
                    'a',
                    {
                      className: 'margin-right-sm',
                      style: { cursor: 'pointer' },
                      onClick: function onClick() {
                        return (0, _openRequestForm2.default)({ lang: lang, agenda: agenda.slug, subject: 'officialAgenda' });
                      }
                    },
                    getLabel('requestOfficialAgenda')
                  ),
                  _react3.default.createElement(
                    'a',
                    {
                      href: zendeskRes.official,
                      target: '_blank'
                    },
                    getLabel('learnMore')
                  )
                )
              )),
              this.renderTableRow('private', _react3.default.createElement(
                'b',
                null,
                getLabel('visibility')
              ), _react3.default.createElement(
                'b',
                { className: 'text-muted' },
                getLabel(agenda.private ? 'privateAgenda' : 'publicAgenda')
              ), _react3.default.createElement(
                'div',
                null,
                agenda.private ? _react3.default.createElement(
                  'div',
                  null,
                  _react3.default.createElement(
                    'a',
                    {
                      className: 'margin-right-sm',
                      style: { cursor: 'pointer' },
                      onClick: function onClick() {
                        return (0, _openRequestForm2.default)({ lang: lang, agenda: agenda.slug, subject: 'publicAgenda' });
                      }
                    },
                    getLabel('requestPublicAgenda')
                  ),
                  _react3.default.createElement(
                    'a',
                    {
                      href: zendeskRes.private,
                      target: '_blank'
                    },
                    getLabel('learnMore')
                  )
                ) : _react3.default.createElement(
                  'div',
                  null,
                  _react3.default.createElement(
                    'a',
                    {
                      className: 'margin-right-sm',
                      style: { cursor: 'pointer' },
                      onClick: function onClick() {
                        return (0, _openRequestForm2.default)({ lang: lang, agenda: agenda.slug, subject: 'privateAgenda' });
                      }
                    },
                    getLabel('requestPrivateAgenda')
                  ),
                  _react3.default.createElement(
                    'a',
                    {
                      href: zendeskRes.private,
                      target: '_blank'
                    },
                    getLabel('learnMore')
                  )
                )
              )),
              this.renderTableRow('personalization', _react3.default.createElement(
                'b',
                null,
                getLabel('personalization')
              ), getLabel('editEventsDescription'), _react3.default.createElement(
                'div',
                null,
                _react3.default.createElement(
                  'a',
                  {
                    className: 'margin-right-sm',
                    style: { cursor: 'pointer' },
                    onClick: function onClick() {
                      return (0, _openRequestForm2.default)({ lang: lang, agenda: agenda.slug, subject: 'bottomDescription' });
                    }
                  },
                  getLabel('requestBottomDescription')
                )
              ))
            )
          )
        ),
        removeModal.visible && _react3.default.createElement(
          _Modal2.default,
          {
            onClose: function onClose() {
              return closeModal('removeKey');
            },
            title: getLabel('removeKey')
          },
          _react3.default.createElement(
            'p',
            null,
            getLabel('removeKeyWarning')
          ),
          _react3.default.createElement(
            'button',
            { className: 'btn btn-primary', onClick: function onClick() {
                return closeModal('removeKey');
              } },
            getLabel('close')
          ),
          _react3.default.createElement(
            'button',
            {
              className: 'btn btn-danger pull-right',
              onClick: function onClick() {
                return removeKey(removeModal.options.key).then(function () {
                  return closeModal('removeKey');
                }).catch(function () {
                  return closeModal('removeKey');
                });
              }
            },
            getLabel('remove')
          )
        )
      );
    }
  }]);

  return ContributionEdition;
}(_react2.Component), _class2.contextTypes = {
  getLabel: _propTypes2.default.func,
  lang: _propTypes2.default.string
}, _temp2)) || _class));

exports.default = ContributionEdition;
module.exports = exports['default'];
//# sourceMappingURL=AdvancedEdition.js.map