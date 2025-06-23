var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/DisplaySchemaData.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/es.promise.js";
import "core-js/modules/web.dom-collections.iterator.js";
import { useState, useEffect } from 'react';
import { Spinner } from '@openagenda/react-shared';
import flatten from '../lib/flatten.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default function DisplaySchemaData(_ref) {
  let {
    schema: schemaFromProps,
    data: dataFromProps,
    lang = 'en',
    res
  } = _ref;
  const [isLoading, setIsLoading] = useState(!!res);
  const [schema, setSchema] = useState(res ? null : schemaFromProps);
  const [data, setData] = useState(res ? null : dataFromProps);
  useEffect(() => {
    if (!res) return;
    fetch(res).then(response => {
      response.json().then(_ref2 => {
        let {
          schema: schemaFromRes,
          data: dataFromRes
        } = _ref2;
        setSchema(schemaFromRes);
        setData(dataFromRes);
        setIsLoading(false);
      });
    });
  }, [res]);
  if (isLoading) {
    return /*#__PURE__*/_jsxDEV(Spinner, {}, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 12
    }, this);
  }
  return /*#__PURE__*/_jsxDEV("ul", {
    className: "list-unstyled",
    children: schema.fields.map(field => {
      const {
        label
      } = flatten(field, lang);
      const value = data === null || data === void 0 ? void 0 : data[field.field];
      if (field.fieldType === 'link') {
        return /*#__PURE__*/_jsxDEV("li", {
          className: "margin-bottom-xs",
          children: /*#__PURE__*/_jsxDEV("a", {
            rel: "noreferrer",
            href: value,
            target: "_blank",
            children: label
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 41,
            columnNumber: 15
          }, this)
        }, "value-".concat(field.field), false, {
          fileName: _jsxFileName,
          lineNumber: 40,
          columnNumber: 13
        }, this);
      }
      return /*#__PURE__*/_jsxDEV("li", {
        className: "margin-bottom-xs",
        children: [/*#__PURE__*/_jsxDEV("strong", {
          children: label
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 50,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          children: value
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 51,
          columnNumber: 13
        }, this)]
      }, "value-".concat(field.field), true, {
        fileName: _jsxFileName,
        lineNumber: 49,
        columnNumber: 11
      }, this);
    })
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 33,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=DisplaySchemaData.js.map