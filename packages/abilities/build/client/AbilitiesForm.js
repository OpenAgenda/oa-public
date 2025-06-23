import _defineProperty from "@babel/runtime-corejs3/helpers/defineProperty";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _reduce from "lodash/reduce.js";
import _forEach from "lodash/forEach.js";
import _remove from "lodash/remove.js";
import _filter from "lodash/filter.js";
import _matches from "lodash/matches.js";
import _partition from "lodash/partition.js";
import _mapValues from "lodash/mapValues.js";
import _reject from "lodash/reject.js";
import _groupBy from "lodash/groupBy.js";
import _find from "lodash/find.js";
import _pick from "lodash/pick.js";
import _isEqual from "lodash/isEqual.js";
import _debounce from "lodash/debounce.js";
import _upperFirst from "lodash/upperFirst.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/abilities/src/client/AbilitiesForm.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _valuesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/values";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/es.regexp.exec.js";
import "core-js/modules/web.dom-collections.iterator.js";
import React, { Component, useState, useCallback } from 'react';
import ky from 'ky';
import { FormSpy } from 'react-final-form';
import Collapse from 'rc-collapse';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import cn from 'classnames';
import Fuse from 'fuse.js';
import { Spinner } from '@openagenda/react-shared';
import RuleCheckbox from './RuleCheckbox.js';
import isIndeterminate from './isIndeterminate.js';
import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const MINLEN_REQUIRED_FOR_SEARCH = 8;
const saveSubscription = {
  submitting: true,
  pristine: true,
  submitSucceeded: true
};
const changeSubscription = {
  values: true,
  data: true
};
const descriptionMessages = defineMessages({
  firstEntityUser: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityUser',
    defaultMessage: 'Your global settings:'
  },
  firstEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityContributor',
    defaultMessage: 'Your contributor settings:'
  },
  firstEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.firstEntityAdminmod',
    defaultMessage: 'Your administrator or moderator settings:'
  },
  childEntityContributor: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityContributor',
    defaultMessage: 'Contributor settings:'
  },
  childEntityAdminmod: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.childEntityAdminmod',
    defaultMessage: 'Administrator or moderator settings:'
  },
  search: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.search',
    defaultMessage: 'Search'
  },
  newsletterTitle: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterTitle',
    defaultMessage: 'Receive the newsletter'
  },
  newsletterDescription: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterDescription',
    defaultMessage: 'Follow the upcoming evolutions coming up on OpenAgenda! You can unsubscribe at any time.'
  },
  newsletterSubscribe: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterSubscribe',
    defaultMessage: 'Click here to subscribe'
  },
  newsletterSubscribed: {
    id: 'Abilities.RulesCheckbox.AbilitiesForm.newsletterSubscribed',
    defaultMessage: 'You will now receive the next newsletter! To unsubscribe, just click on the link that will be placed at the bottom of each message.'
  }
});
function getEntityTitle(ability) {
  switch (ability.entityName) {
    case 'user':
      return ability.entity.fullName;
    case 'agenda':
      return ability.entity.title;
    case 'member':
      return ability.entity.agendaTitle;
    default:
      return ability.identifier;
  }
}
const Newsletter = () => {
  const intl = useIntl();
  const [wasClicked, setWasClicked] = useState(false);
  const subscribe = useCallback(() => {
    ky.post('/newsletter/subscribe', {
      json: {}
    }).then(() => {
      setWasClicked(true);
    });
  }, []);
  return /*#__PURE__*/_jsxDEV("div", {
    className: "info-block-sm margin-bottom-sm".concat(wasClicked ? ' success' : ''),
    children: [/*#__PURE__*/_jsxDEV("strong", {
      children: intl.formatMessage(descriptionMessages.newsletterTitle)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 95,
      columnNumber: 7
    }, this), /*#__PURE__*/_jsxDEV("div", {
      children: intl.formatMessage(descriptionMessages[wasClicked ? 'newsletterSubscribed' : 'newsletterDescription'])
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 96,
      columnNumber: 7
    }, this), wasClicked ? null : /*#__PURE__*/_jsxDEV("button", {
      disabled: wasClicked,
      onClick: () => subscribe(),
      type: "button",
      className: "btn btn-link padding-left-z",
      children: intl.formatMessage(descriptionMessages.newsletterSubscribe)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 104,
      columnNumber: 9
    }, this)]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 92,
    columnNumber: 5
  }, this);
};
const FilterInput = _ref => {
  let {
    value,
    onChange,
    placeholder
  } = _ref;
  const intl = useIntl();
  return /*#__PURE__*/_jsxDEV("div", {
    className: "form-group search",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "input-icon-right",
      children: [/*#__PURE__*/_jsxDEV("input", {
        name: "filter",
        type: "text",
        className: "form-control",
        value: value,
        onChange: onChange,
        placeholder: placeholder
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 123,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("button", {
        type: "submit",
        className: "btn",
        children: /*#__PURE__*/_jsxDEV("i", {
          className: "fa fa-search",
          "aria-hidden": "true",
          "aria-label": intl.formatMessage(descriptionMessages.search)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 132,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 131,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 122,
      columnNumber: 7
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 121,
    columnNumber: 5
  }, this);
};
const SaveButton = _ref2 => {
  let {
    form,
    submitting,
    pristine,
    submitSucceeded
  } = _ref2;
  return /*#__PURE__*/_jsxDEV("button", {
    type: "submit",
    onClick: form.submit,
    className: cn('btn', {
      'btn-primary': !submitSucceeded,
      'btn-success': submitSucceeded
    }),
    disabled: submitting || pristine,
    children: [/*#__PURE__*/_jsxDEV(FormattedMessage, {
      id: "Abilities.AbilitiesForm.save",
      defaultMessage: "Save"
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 5
    }, this), submitting && /*#__PURE__*/_jsxDEV("span", {
      className: "margin-h-sm",
      children: /*#__PURE__*/_jsxDEV(Spinner, {
        mode: "inline"
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 157,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 156,
      columnNumber: 7
    }, this)]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 144,
    columnNumber: 3
  }, this);
};
const FirstEntityRule = _ref3 => {
  let {
    ruleName,
    rules
  } = _ref3;
  const headerMessage = descriptionMessages["firstEntity".concat(_upperFirst(ruleName))];
  return /*#__PURE__*/_jsxDEV("div", {
    children: [headerMessage ? /*#__PURE__*/_jsxDEV("b", {
      children: /*#__PURE__*/_jsxDEV(FormattedMessage, _objectSpread({}, headerMessage), void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 170,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 169,
      columnNumber: 9
    }, this) : null, rules.map(rule => /*#__PURE__*/_jsxDEV(RuleCheckbox, {
      rule: rule
    }, rule.key, false, {
      fileName: _jsxFileName,
      lineNumber: 175,
      columnNumber: 9
    }, this))]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 167,
    columnNumber: 5
  }, this);
};
const ChildEntityRule = _ref4 => {
  let {
    ruleName,
    rules
  } = _ref4;
  const headerMessage = descriptionMessages["childEntity".concat(_upperFirst(ruleName))];
  return /*#__PURE__*/_jsxDEV("div", {
    children: [headerMessage ? /*#__PURE__*/_jsxDEV("b", {
      children: /*#__PURE__*/_jsxDEV(FormattedMessage, _objectSpread({}, headerMessage), void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 188,
        columnNumber: 11
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 9
    }, this) : null, rules.map(rule => /*#__PURE__*/_jsxDEV(RuleCheckbox, {
      rule: rule
    }, rule.key, false, {
      fileName: _jsxFileName,
      lineNumber: 193,
      columnNumber: 9
    }, this))]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 185,
    columnNumber: 5
  }, this);
};
export default class AbilitiesForm extends Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "debouncedSearch", _debounce(value => {
      this.setState({
        debouncedSearch: value
      });
    }, 500));
    _defineProperty(this, "handleSearchChange", e => {
      const {
        value
      } = e.target;
      this.setState({
        search: value
      });
      this.debouncedSearch(value);
    });
    _defineProperty(this, "onFormValueChange", formState => {
      const {
        entityName,
        identifier,
        rules,
        form
      } = this.props;
      const {
        mutators: {
          setFieldData
        },
        batch,
        getFieldState
      } = form;
      const [firstEntityRules, otherRules] = _partition(rules, _matches({
        entityName,
        identifier
      }));

      // calculate indeterminates
      const indeterminates = _reduceInstanceProperty(firstEntityRules).call(firstEntityRules, (result, rule) => {
        const relatedRules = _remove(otherRules, _matches(_pick(rule, 'actions', 'subject', 'conditions')));
        const fieldState = getFieldState(rule.key);
        const indeterminate = isIndeterminate(_valuesInstanceProperty(formState), rule, relatedRules);
        if (!!fieldState.data.indeterminate !== !!indeterminate) {
          result[rule.key] = indeterminate;
        }
        return result;
      }, {});

      // set indeterminate prop for each field
      batch(() => {
        _forEach(indeterminates, (indeterminate, key) => setFieldData(key, {
          indeterminate
        }));
      });
    });
    this.state = {
      ruleKeys: null,
      firstEntityAbility: null,
      childAbilities: null,
      search: '',
      debouncedSearch: ''
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      entityName,
      identifier,
      rules,
      searchChildKey
    } = nextProps;
    const ruleKeys = rules.map(rule => rule.key);
    if (!_isEqual(prevState.ruleKeys, ruleKeys)) {
      const rulesPerEntity = _reduceInstanceProperty(rules).call(rules, (result, rule) => {
        const entityProps = _pick(rule, ['entityName', 'identifier', 'entity']);
        const found = _find(result, entityProps);
        if (found) {
          found.rules.push(rule);
        } else {
          result.push(_objectSpread(_objectSpread({}, entityProps), {}, {
            rules: [rule]
          }));
        }
        return result;
      }, []);
      const firstEntityAbility = _find(rulesPerEntity, {
        entityName,
        identifier
      });
      const childAbilities = _groupBy(_reject(rulesPerEntity, {
        entityName,
        identifier
      }), 'entityName');
      const fuseChildAbilities = searchChildKey ? _mapValues(childAbilities, childAbility => new Fuse(childAbility, {
        shouldSort: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [searchChildKey]
      })) : null;
      return {
        ruleKeys,
        firstEntityAbility,
        childAbilities,
        fuseChildAbilities
      };
    }
    return null;
  }
  componentDidMount() {
    // calculate `indeterminate` props
    const {
      rules,
      form,
      entityName,
      identifier
    } = this.props;
    const {
      mutators: {
        setFieldData
      },
      batch
    } = form;
    const formState = form.getState();
    const allValues = _valuesInstanceProperty(formState);
    const [firstEntityRules, otherRules] = _partition(rules, _matches({
      entityName,
      identifier
    }));
    batch(() => {
      for (const rule of firstEntityRules) {
        const relatedRules = _filter(otherRules, _matches(_pick(rule, 'actions', 'subject', 'conditions')));
        setFieldData(rule.key, {
          indeterminate: isIndeterminate(allValues, rule, relatedRules)
        });
      }
    });
  }
  render() {
    const {
      handleSubmit,
      HeaderComponent,
      searchChildKey,
      filterInputPlaceholder
    } = this.props;
    const {
      firstEntityAbility,
      childAbilities,
      fuseChildAbilities,
      search,
      debouncedSearch
    } = this.state;
    const saveButton = /*#__PURE__*/_jsxDEV(FormSpy, {
      subscription: saveSubscription,
      component: SaveButton
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 384,
      columnNumber: 7
    }, this);
    const childAbilitiesLength = _reduce(childAbilities, (result, value) => result + value.length, 0);
    return /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [HeaderComponent ? /*#__PURE__*/React.createElement(HeaderComponent, {
        saveButton
      }) : null, /*#__PURE__*/_jsxDEV(Newsletter, {}, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 399,
        columnNumber: 9
      }, this), /*#__PURE__*/_jsxDEV("form", {
        onSubmit: handleSubmit,
        children: [firstEntityAbility && firstEntityAbility.rules.length ? /*#__PURE__*/_jsxDEV("div", {
          className: "margin-bottom-sm",
          children: Object.entries(_groupBy(firstEntityAbility.rules, 'tag')).map(_ref5 => {
            let [key, rules] = _ref5;
            return /*#__PURE__*/_jsxDEV(FirstEntityRule, {
              ruleName: key,
              rules: rules
            }, key, false, {
              fileName: _jsxFileName,
              lineNumber: 406,
              columnNumber: 19
            }, this);
          })
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 403,
          columnNumber: 13
        }, this) : null, searchChildKey && childAbilitiesLength >= MINLEN_REQUIRED_FOR_SEARCH ? /*#__PURE__*/_jsxDEV("div", {
          className: "margin-v-md",
          children: /*#__PURE__*/_jsxDEV(FilterInput, {
            value: search,
            onChange: this.handleSearchChange,
            placeholder: filterInputPlaceholder
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 414,
            columnNumber: 15
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 413,
          columnNumber: 13
        }, this) : null, Object.keys(childAbilities).map(name => {
          const abilities = fuseChildAbilities && debouncedSearch ? fuseChildAbilities[name].search(debouncedSearch) : childAbilities[name];
          return /*#__PURE__*/_jsxDEV(Collapse, {
            className: "margin-bottom-md",
            abilities: abilities,
            children: abilities.map(entityAbility => /*#__PURE__*/_jsxDEV(Collapse.Panel, {
              rules: entityAbility.rules,
              header: /*#__PURE__*/_jsxDEV("b", {
                children: getEntityTitle(entityAbility)
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 437,
                columnNumber: 29
              }, this),
              children: Object.entries(_groupBy(entityAbility.rules, 'tag')).map(_ref6 => {
                let [key, rules] = _ref6;
                return /*#__PURE__*/_jsxDEV(ChildEntityRule, {
                  ruleName: key,
                  rules: rules
                }, key, false, {
                  fileName: _jsxFileName,
                  lineNumber: 441,
                  columnNumber: 25
                }, this);
              })
            }, "".concat(name, ".").concat(entityAbility.identifier), false, {
              fileName: _jsxFileName,
              lineNumber: 434,
              columnNumber: 19
            }, this))
          }, name, false, {
            fileName: _jsxFileName,
            lineNumber: 428,
            columnNumber: 15
          }, this);
        }), saveButton, /*#__PURE__*/_jsxDEV(FormSpy, {
          subscription: changeSubscription,
          onChange: this.onFormValueChange
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 456,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 401,
        columnNumber: 9
      }, this)]
    }, void 0, true);
  }
}
_defineProperty(AbilitiesForm, "defaultProps", {
  rules: null,
  form: null,
  handleSubmit: null,
  HeaderComponent: null,
  searchChildKey: null,
  filterInputPlaceholder: ''
});
//# sourceMappingURL=AbilitiesForm.js.map