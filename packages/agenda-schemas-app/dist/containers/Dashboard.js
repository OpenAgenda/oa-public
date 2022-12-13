"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.replace.js");

require("core-js/modules/es.string.search.js");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/slicedToArray"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _reactIntl = require("react-intl");

var _reactQuery = require("react-query");

var _reactRouter = require("react-router");

var _reactShared = require("@openagenda/react-shared");

var _FormSchemaBuilder = _interopRequireDefault(require("@openagenda/form-schemas/client/build/FormSchemaBuilder"));

var _EnabledRanges = _interopRequireDefault(require("@openagenda/event-form/build/components/configuration/EnabledRanges"));

var _getSchemaFieldCount = _interopRequireDefault(require("../lib/getSchemaFieldCount"));

var _useRes = _interopRequireDefault(require("../hooks/useRes"));

var _useEventSchemas2 = _interopRequireDefault(require("../hooks/useEventSchemas"));

var _useMemberSchemas2 = _interopRequireDefault(require("../hooks/useMemberSchemas"));

var _react2 = require("@emotion/react");

var _jsxFileName = "/home/clement/Project/oa/packages/agenda-schemas-app/src/containers/Dashboard.js";

var completedPrefix = function completedPrefix(agenda, prefix) {
  return prefix.replace(':agendaSlug', agenda.slug);
};

var messages = (0, _reactIntl.defineMessages)({
  network: {
    "id": "AgendaSchema.network",
    "defaultMessage": [{
      "type": 0,
      "value": "Network"
    }]
  },
  networkDetail: {
    "id": "AgendaSchema.networkDetail",
    "defaultMessage": [{
      "type": 0,
      "value": "Field required by the agenda network"
    }]
  },
  event: {
    "id": "AgendaSchema.event",
    "defaultMessage": [{
      "type": 0,
      "value": "Standard"
    }]
  },
  eventDetail: {
    "id": "AgendaSchema.eventDetail",
    "defaultMessage": [{
      "type": 0,
      "value": "Standard event field"
    }]
  },
  needMoreFields: {
    "id": "AgendaSchema.needMoreFields",
    "defaultMessage": [{
      "type": 0,
      "value": "Need more fields?"
    }]
  },
  adaptForm: {
    "id": "AgendaSchema.adaptForm",
    "defaultMessage": [{
      "type": 0,
      "value": "Adapt the configuration of the event form"
    }]
  },
  canAddField: {
    "id": "AgendaSchema.canAddField",
    "defaultMessage": [{
      "type": 0,
      "value": "You can add the field of your choice to the event form"
    }]
  },
  member: {
    "id": "AgendaSchema.member",
    "defaultMessage": [{
      "type": 0,
      "value": "Standard Member"
    }]
  },
  memberDetail: {
    "id": "AgendaSchema.memberDetail",
    "defaultMessage": [{
      "type": 0,
      "value": "Standard member field"
    }]
  }
});

function Dashboard() {
  var _agenda$credentials,
      _agenda$credentials2,
      _this = this;

  var _useLayoutData = (0, _reactShared.useLayoutData)(),
      lang = _useLayoutData.lang,
      agenda = _useLayoutData.agenda;

  var maxFields = agenda !== null && agenda !== void 0 && (_agenda$credentials = agenda.credentials) !== null && _agenda$credentials !== void 0 && _agenda$credentials.premiumCustomFields ? 100 : 1;
  var editableParents = (agenda === null || agenda === void 0 ? void 0 : (_agenda$credentials2 = agenda.credentials) === null || _agenda$credentials2 === void 0 ? void 0 : _agenda$credentials2.premiumCustomFields) || ['timings'];
  var prefix = completedPrefix(agenda, (0, _reactRedux.useSelector)(function (state) {
    return state.settings.prefix;
  }));
  var intl = (0, _reactIntl.useIntl)();
  var res = (0, _useRes.default)(agenda);
  var history = (0, _reactRouter.useHistory)();
  var historyLocation = (0, _reactRouter.useLocation)();
  console.log('history :', history.location, '\nhistoryLocation :', historyLocation);

  var _useEventSchemas = (0, _useEventSchemas2.default)(agenda),
      schema = _useEventSchemas.schema,
      parents = _useEventSchemas.parents,
      isLoading = _useEventSchemas.isLoading;

  var _useMemberSchemas = (0, _useMemberSchemas2.default)(agenda),
      memberSchema = _useMemberSchemas.memberSchema,
      memberParents = _useMemberSchemas.memberParents,
      isLoadingMember = _useMemberSchemas.isLoadingMember;

  var _useState = (0, _react.useState)((0, _getSchemaFieldCount.default)(schema)),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      currentFieldCount = _useState2[0],
      setCurrentFieldCount = _useState2[1];

  var queryClient = (0, _reactQuery.useQueryClient)();
  console.log(schema, memberSchema);
  console.log(parents, memberParents);
  var search = historyLocation.search;

  var _useMemo = (0, _react.useMemo)(function () {
    if ((0, _includes.default)(search).call(search, 'member')
    /*&& check for credentials*/
    ) {
        return {
          memberMode: true
        };
      }

    return {
      memberMode: false
    };
  }, [search]),
      memberMode = _useMemo.memberMode;

  console.log('memberMode', memberMode);
  (0, _react.useEffect)(function () {
    if (schema !== null && schema !== void 0 && schema.fields) setCurrentFieldCount((0, _getSchemaFieldCount.default)(schema));
  }, [schema]);

  var onSuccess = function onSuccess() {
    console.log('on success clear cache');
    queryClient.removeQueries(['agenda-eventSchema', agenda.uid], {
      exact: true
    });
  };

  var onUpdate = function onUpdate(updatedSchema) {
    setCurrentFieldCount((0, _getSchemaFieldCount.default)(updatedSchema));
  };

  var renderHeadComponent = function renderHeadComponent() {
    return (0, _react2.jsx)("div", {
      className: "padding-all-sm",
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 102,
        columnNumber: 5
      }
    }, (0, _react2.jsx)("label", {
      htmlFor: "adaptForm-label",
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 103,
        columnNumber: 7
      }
    }, intl.formatMessage(messages.adaptForm)), (0, _react2.jsx)("p", {
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 104,
        columnNumber: 7
      }
    }, (0, _react2.jsx)("button", {
      type: "button",
      className: "btn btn-primary margin-top-sm",
      onClick: function onClick() {
        if (!(0, _includes.default)(search).call(search, 'member')) history.push({
          search: 'member'
        });else history.push({
          search: ''
        });
      },
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 105,
        columnNumber: 9
      }
    }, "Nav")), maxFields === 1 ? (0, _react2.jsx)("div", {
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 117,
        columnNumber: 9
      }
    }, (0, _react2.jsx)("p", {
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 118,
        columnNumber: 11
      }
    }, intl.formatMessage(messages.canAddField))) : null, maxFields === 1 && maxFields === currentFieldCount ? (0, _react2.jsx)("div", {
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 122,
        columnNumber: 9
      }
    }, (0, _react2.jsx)("a", {
      href: "/support?origin=".concat(encodeURIComponent(window.location.pathname), "&subject=agendaSchema"),
      __self: _this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 123,
        columnNumber: 11
      }
    }, intl.formatMessage(messages.needMoreFields))) : null);
  };

  if (isLoading || isLoadingMember) {
    return (0, _react2.jsx)(_reactShared.Spinner, {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 132,
        columnNumber: 12
      }
    });
  }

  return (0, _react2.jsx)("div", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 5
    }
  }, (0, _react2.jsx)(_FormSchemaBuilder.default, {
    res: memberMode ? res.memberSchema : res.eventSchema,
    lang: lang,
    addEnabled: maxFields > currentFieldCount,
    settingsEnabled: true,
    editableExtentions: editableParents,
    devState: {// editedField: 'title'
    },
    schema: memberMode ? memberSchema : schema,
    extendedFrom: memberMode ? memberParents : parents,
    onUpdate: onUpdate,
    onSuccess: onSuccess,
    renderHead: renderHeadComponent,
    components: {
      enabledRanges: _EnabledRanges.default
    },
    customFieldConfigurationSchemas: {
      timings: {
        fields: [{
          field: 'label',
          fieldType: 'abstract'
        }, {
          field: 'sub',
          fieldType: 'abstract'
        }, {
          field: 'enabledRanges',
          fieldType: 'enabledRanges',
          label: 'Configurateur des saisie de dates',
          selfHandled: ['label', 'info', 'help', 'sub']
        }]
      }
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 137,
      columnNumber: 7
    }
  }), maxFields === 1 && maxFields === currentFieldCount ? (0, _react2.jsx)("div", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 172,
      columnNumber: 9
    }
  }, (0, _react2.jsx)("a", {
    href: "/support?origin=".concat(encodeURIComponent(window.location.pathname), "&subject=agendaSchema"),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 173,
      columnNumber: 11
    }
  }, intl.formatMessage(messages.needMoreFields))) : null);
}

var _default = Dashboard;
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=Dashboard.js.map