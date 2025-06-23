import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/abilities/src/client/AbilitiesEditor.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/es.promise.js";
import "core-js/modules/web.dom-collections.iterator.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import setFieldDataMutator from 'final-form-set-field-data';
import { IntlProvider, FormattedMessage } from 'react-intl';
import useLatestModule from 'react-use/lib/useLatest.js';
import { Spinner } from '@openagenda/react-shared';
import * as locales from '../locales-compiled/index.js';
import AbilitiesForm from './AbilitiesForm.js';
import getChildCheckboxDecorator from './getChildCheckboxDecorator.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const useLatest = useLatestModule.default || useLatestModule;
let uniqueIdCounter = 0;
function getUniqueId() {
  uniqueIdCounter += 1;
  return uniqueIdCounter;
}
function getInitialValues(rules) {
  return _reduceInstanceProperty(rules).call(rules, (result, rule) => {
    result[rule.key] = rule.inverted === undefined ? true : !rule.inverted;
    return result;
  }, {});
}
function AbilitiesEditor(_ref) {
  let {
    entityName,
    identifier,
    locale = 'en',
    filterInputPlaceholder = '',
    onSubmit,
    res,
    HeaderComponent,
    searchChildKey
  } = _ref;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const fetchAbilities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("".concat(res.formIndex, "?entityName=").concat(entityName, "&identifier=").concat(identifier));
      const fetchedData = await response.json();
      const formattedData = fetchedData.map(v => _objectSpread(_objectSpread({}, v), {}, {
        key: "rule".concat(getUniqueId())
      }));
      setData(formattedData);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [res.formIndex, entityName, identifier]);
  useEffect(() => {
    fetchAbilities();
  }, [fetchAbilities]);
  const handleSubmit = async (values, form) => {
    const formIndex = data.map(rule => _objectSpread(_objectSpread({}, rule), {}, {
      inverted: !values[rule.key]
    }));
    if (typeof onSubmit === 'function') {
      return onSubmit(formIndex);
    }
    try {
      const response = await fetch("".concat(res.formIndex, "?entityName=").concat(entityName, "&identifier=").concat(identifier), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formIndex)
      });
      const responseData = await response.json();
      if (Array.isArray(responseData)) {
        const formattedData = responseData.map(v => _objectSpread(_objectSpread({}, v), {}, {
          key: "rule".concat(getUniqueId())
        }));
        setData(formattedData);
        form.initialize(getInitialValues(formattedData));
      }
    } catch (err) {
      setError(err);
    }
  };
  const latestData = useLatest(data);
  const childCheckboxDecorator = useMemo(() => getChildCheckboxDecorator({
    entityName,
    identifier,
    getRules: () => latestData.current
  }), [latestData, entityName, identifier]);
  const renderContent = () => {
    if (loading) return /*#__PURE__*/_jsxDEV(Spinner, {}, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 110,
      columnNumber: 25
    }, this);
    if (error) {
      return /*#__PURE__*/_jsxDEV(FormattedMessage, {
        id: "Abilities.AbilitiesEditor.error",
        defaultMessage: "Error."
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 113,
        columnNumber: 9
      }, this);
    }
    return /*#__PURE__*/_jsxDEV(Form, {
      validateOnBlur: true,
      subscription: {},
      initialValues: getInitialValues(data),
      onSubmit: handleSubmit,
      decorators: [childCheckboxDecorator],
      mutators: {
        setFieldData: setFieldDataMutator
      },
      component: AbilitiesForm,
      rules: data,
      entityName: entityName,
      identifier: identifier,
      HeaderComponent: HeaderComponent,
      searchChildKey: searchChildKey,
      filterInputPlaceholder: filterInputPlaceholder
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 121,
      columnNumber: 7
    }, this);
  };

  // eslint-disable-next-line import/namespace
  const messages = locales[locale] || locales.en;
  return /*#__PURE__*/_jsxDEV(IntlProvider, {
    locale: locale,
    messages: messages,
    children: renderContent()
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 142,
    columnNumber: 5
  }, this);
}
export default AbilitiesEditor;
//# sourceMappingURL=AbilitiesEditor.js.map