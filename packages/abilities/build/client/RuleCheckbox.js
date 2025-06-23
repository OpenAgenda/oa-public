import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _isEqual from "lodash/isEqual.js";
import _upperFirst from "lodash/upperFirst.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/abilities/src/client/RuleCheckbox.js";
import React, { useRef } from 'react';
import { Field } from 'react-final-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const stateMessages = defineMessages({
  '-1': {
    id: 'Abilities.RulesCheckbox.states.refused',
    defaultMessage: 'refused'
  },
  0: {
    id: 'Abilities.RulesCheckbox.states.toControl',
    defaultMessage: 'to control'
  },
  1: {
    id: 'Abilities.RulesCheckbox.states.controlled',
    defaultMessage: 'controlled'
  },
  2: {
    id: 'Abilities.RulesCheckbox.states.published',
    defaultMessage: 'published'
  }
});
const ruleMessages = defineMessages({
  receiveInvitation: {
    id: 'Abilities.RulesCheckbox.rules.receiveInvitation',
    defaultMessage: 'Receive invitations'
  },
  receiveNotificationsSummary: {
    id: 'Abilities.RulesCheckbox.rules.receiveNotificationsSummary',
    defaultMessage: 'Receive summaries of notifications'
  },
  receiveMemberMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveMemberMessage',
    defaultMessage: 'Receive messages sent via the "Write to them" feature'
  },
  receiveUserInboxMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveUserInboxMessage',
    defaultMessage: 'Receive messages from my inbox'
  },
  receiveAgendaInboxMessage: {
    id: 'Abilities.RulesCheckbox.rules.receiveAgendaInboxMessage',
    defaultMessage: 'Receive messages from agenda inbox'
  },
  receiveEvent: {
    id: 'Abilities.RulesCheckbox.rules.receiveEvent',
    defaultMessage: 'Receive events sent by other users'
  },
  receiveMyEventChangeState: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventChangeState',
    defaultMessage: 'Receive notifications when someone change state of my events'
  },
  receiveMyEventUpdate: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventUpdate',
    defaultMessage: 'Receive notifications when someone update my events'
  },
  receiveMyEventAggregation: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventAggregation',
    defaultMessage: 'Receive notifications when someone aggregate my events'
  },
  receiveEventChangeState: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventChangeState',
    defaultMessage: 'Receive states changes for {state}'
  },
  receiveMyEventCreation: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventCreation',
    defaultMessage: 'Receive event creation confirmations'
  },
  receiveEventCreation: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventCreation',
    defaultMessage: 'Receive event creations'
  },
  receiveEventUpdate: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventUpdate',
    defaultMessage: 'Receive event updates'
  },
  receiveEventAggregation: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventAggregation',
    defaultMessage: 'Receive event aggregations'
  },
  receiveEventAddition: {
    id: 'Abilities.RulesCheckbox.rules.receiveEventAddition',
    defaultMessage: 'Receive event creations'
  },
  receiveMyEventAddition: {
    id: 'Abilities.RulesCheckbox.rules.receiveMyEventAddition',
    defaultMessage: 'Receive notifications when someone add my events'
  }
});
const RuleLabel = /*#__PURE__*/React.memo(_ref => {
  let {
    rule
  } = _ref;
  const values = {};
  if (rule.actions === 'receive' && rule.subject === 'eventChangeState') {
    values.state = /*#__PURE__*/_jsxDEV(FormattedMessage, _objectSpread({}, stateMessages[rule.conditions.state]), void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 99,
      columnNumber: 9
    }, this);
  }
  const messageKey = "".concat(rule.actions).concat(_upperFirst(rule.subject));
  if (!ruleMessages[messageKey]) {
    return messageKey;
  }
  return /*#__PURE__*/_jsxDEV(FormattedMessage, _objectSpread(_objectSpread({}, ruleMessages[messageKey]), {}, {
    values: values
  }), void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 109,
    columnNumber: 12
  }, this);
}, (prevProps, nextProps) => _isEqual(prevProps.rule, nextProps.rule));
function RuleField(_ref2) {
  let {
    rule,
    input,
    meta
  } = _ref2;
  const checkboxRef = useRef(null);
  if (checkboxRef.current) {
    checkboxRef.current.indeterminate = meta.data && meta.data.indeterminate;
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: "checkbox",
    children: /*#__PURE__*/_jsxDEV("label", {
      htmlFor: rule.key,
      children: [/*#__PURE__*/_jsxDEV("input", _objectSpread({
        type: "checkbox",
        id: rule.key,
        ref: checkboxRef
      }, input), void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 124,
        columnNumber: 9
      }, this), ' ', /*#__PURE__*/_jsxDEV(RuleLabel, {
        rule: rule
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 125,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 123,
      columnNumber: 7
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 122,
    columnNumber: 5
  }, this);
}
function RuleCheckbox(_ref3) {
  let {
    rule
  } = _ref3;
  return /*#__PURE__*/_jsxDEV(Field, {
    name: rule.key,
    type: "checkbox",
    subscription: {
      value: true,
      data: true
    },
    validateFields: [],
    component: RuleField,
    rule: rule
  }, rule.key, false, {
    fileName: _jsxFileName,
    lineNumber: 133,
    columnNumber: 5
  }, this);
}
export default /*#__PURE__*/React.memo(RuleCheckbox);
//# sourceMappingURL=RuleCheckbox.js.map