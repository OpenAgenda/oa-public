var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/admin-agendas/components/src/Search.js";
import "core-js/modules/es.regexp.exec.js";
import React, { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Spinner } from '@openagenda/react-shared';
import AgendaItem from '@openagenda/admin-agendas/components/src/AgendaItem';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const searchSpinnerConfig = {
  width: 1,
  length: 3,
  radius: 4
};
export default function Search(_ref) {
  let {
    query,
    agendas,
    loading,
    onSelectAgenda,
    onSearchChange,
    getSearchPage
  } = _ref;
  const searchRef = useRef(null);
  const {
    ref: infiniteRef
  } = useInView({
    onChange: inView => {
      if (inView && !loading) {
        getSearchPage(true);
      }
    }
  });
  return /*#__PURE__*/_jsxDEV("div", {
    className: "col-md-3 admin-search",
    ref: searchRef,
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "row",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "header",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "form-group",
          children: [/*#__PURE__*/_jsxDEV("label", {
            className: "sr-only",
            htmlFor: "agenda_search",
            children: "Recherche d'agendas"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 35,
            columnNumber: 13
          }, this), /*#__PURE__*/_jsxDEV("div", {
            className: "input-icon-right",
            children: [/*#__PURE__*/_jsxDEV("input", {
              title: "je mange des urls et des uid aussi maintenant",
              className: "form-control",
              placeholder: "Rechercher",
              value: (query === null || query === void 0 ? void 0 : query.search) || '',
              onChange: e => onSearchChange('oas[search]', e.target.value)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 39,
              columnNumber: 15
            }, this), /*#__PURE__*/_jsxDEV("button", {
              type: "submit",
              className: "btn",
              children: loading ? /*#__PURE__*/_jsxDEV(Spinner, {
                options: searchSpinnerConfig
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 48,
                columnNumber: 19
              }, this) : /*#__PURE__*/_jsxDEV("i", {
                className: "fa fa-search",
                "aria-hidden": "true"
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 50,
                columnNumber: 19
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 46,
              columnNumber: 15
            }, this)]
          }, void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 38,
            columnNumber: 13
          }, this)]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 34,
          columnNumber: 11
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 32,
      columnNumber: 7
    }, this), /*#__PURE__*/_jsxDEV("div", {
      className: "row",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "body media-list margin-bottom-xs",
        children: [agendas !== null && agendas !== void 0 && agendas.length ? agendas.map(agenda => /*#__PURE__*/_jsxDEV(AgendaItem, {
          agenda: agenda,
          onSelect: onSelectAgenda
        }, agenda.uid, false, {
          fileName: _jsxFileName,
          lineNumber: 62,
          columnNumber: 15
        }, this)) : /*#__PURE__*/_jsxDEV("div", {
          className: "empty",
          children: /*#__PURE__*/_jsxDEV("p", {
            children: "Aucun agenda correspondant \xE0 cette recherche"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 70,
            columnNumber: 15
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 69,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("div", {
          ref: infiniteRef
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 73,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 59,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 58,
      columnNumber: 7
    }, this)]
  }, void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 31,
    columnNumber: 5
  }, this);
}
;
//# sourceMappingURL=Search.js.map