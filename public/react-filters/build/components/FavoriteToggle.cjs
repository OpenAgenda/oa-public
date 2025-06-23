var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/FavoriteToggle.js
var FavoriteToggle_exports = {};
__export(FavoriteToggle_exports, {
  default: () => FavoriteToggle
});
module.exports = __toCommonJS(FavoriteToggle_exports);
var import_isEqual = __toESM(require("lodash/isEqual.js"), 1);
var import_react2 = require("react");
var import_useLatest = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_react_final_form2 = require("react-final-form");
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);

// src/utils/updateCustomFilter.js
function updateCustomFilter(filter, active) {
  const activeClass = filter.activeClass || "active";
  const inactiveClass = filter.inactiveClass || "inactive";
  const { classList } = filter.activeTargetElem || filter.elem;
  const handlerElem = filter.handlerElem || filter.elem;
  const innerCheckboxes = handlerElem.querySelectorAll(
    'input[type="checkbox"]'
  );
  const checkbox = innerCheckboxes.length === 1 ? innerCheckboxes[0] : null;
  if (active) {
    if (classList.contains(inactiveClass)) classList.remove(inactiveClass);
    if (!classList.contains(activeClass)) classList.add(activeClass);
    if (checkbox && !checkbox.checked) checkbox.checked = true;
  } else {
    if (classList.contains(activeClass)) classList.remove(activeClass);
    if (!classList.contains(inactiveClass)) classList.add(inactiveClass);
    if (checkbox && checkbox.checked) checkbox.checked = false;
  }
}

// src/utils/updateFormValues.js
function updateFormValues(form, query, active = true) {
  form.batch(() => {
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (active) {
          form.change(key, query[key]);
        } else {
          form.change(key, void 0);
        }
      }
    }
  });
}

// src/hooks/useFavoriteState.js
var import_react = require("react");
var import_use_local_storage_state = require("use-local-storage-state");
var useFavoriteLocalStorageState = (0, import_use_local_storage_state.createLocalStorageStateHook)("favorite-events");
function useFavoriteState(agendaUid) {
  const [value, setValue] = useFavoriteLocalStorageState();
  const setAgendaValue = (0, import_react.useCallback)(
    (fnOrValue) => {
      if (typeof fnOrValue === "function") {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue(prev == null ? void 0 : prev[agendaUid])
        }));
      } else {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue
        }));
      }
    },
    [setValue, agendaUid]
  );
  return [value == null ? void 0 : value[agendaUid], setAgendaValue];
}

// src/hooks/index.js
var import_react_final_form = require("react-final-form");

// src/components/FavoriteToggle.js
var useLatest = import_useLatest.default.default || import_useLatest.default;
function FavoriteToggle({ agendaUid, eventUid, widget }) {
  const form = (0, import_react_final_form2.useForm)();
  const [value, setValue] = useFavoriteState(widget.agendaUid || agendaUid);
  const firstRender = (0, import_react2.useRef)(true);
  const latestValue = useLatest(value);
  const eventUidStr = String(eventUid);
  const updateForm = (0, import_react2.useCallback)(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      const active = (_a = latestValue.current) == null ? void 0 : _a.includes(eventUidStr);
      const newValue = active ? latestValue.current.filter((v) => v !== eventUidStr) : [...latestValue.current || [], eventUidStr].filter(
        (v) => v !== "-1"
      );
      setValue(newValue.length ? newValue : void 0);
    },
    [eventUidStr, latestValue, setValue]
  );
  const onChange = (0, import_react2.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)(updateForm),
    [updateForm]
  );
  (0, import_react2.useEffect)(() => {
    var _a;
    if (firstRender.current) {
      firstRender.current = false;
      if ((_a = latestValue.current) == null ? void 0 : _a.includes(eventUidStr)) {
        updateCustomFilter(widget, true);
      }
    }
    const handlerElem = widget.handlerElem || widget.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]'
    );
    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1 && handlerElem.tagName === "LABEL" && handlerElem.contains(innerCheckboxes[0]);
    if (innerCheckboxes.length === 1 && (!widget.handlerElem || handlerIsLabelWithCheckbox)) {
      innerCheckboxes[0].addEventListener("change", updateForm, false);
    } else {
      handlerElem.addEventListener("click", onChange, false);
    }
    handlerElem.addEventListener("keydown", onChange, false);
    return () => {
      if (innerCheckboxes.length === 1 && (!widget.handlerElem || handlerIsLabelWithCheckbox)) {
        innerCheckboxes[0].removeEventListener("change", updateForm, false);
      } else {
        handlerElem.removeEventListener("click", onChange, false);
      }
      handlerElem.removeEventListener("keydown", onChange, false);
    };
  }, [eventUidStr, widget, latestValue, onChange]);
  (0, import_react2.useEffect)(() => {
    const active = value == null ? void 0 : value.includes(eventUidStr);
    updateCustomFilter(widget, active);
    const formValues = form.getState().values;
    if (formValues.favorites && !(0, import_isEqual.default)(formValues.uid, value)) {
      updateFormValues(form, {
        uid: value || ["-1"]
      });
    }
  }, [form, eventUidStr, value, widget]);
  return null;
}
//# sourceMappingURL=FavoriteToggle.cjs.map