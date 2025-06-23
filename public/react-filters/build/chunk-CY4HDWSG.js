import {
  updateCustomFilter
} from "./chunk-EMNX5IV5.js";
import {
  useFavoriteState
} from "./chunk-ZEN56UHG.js";
import {
  updateFormValues
} from "./chunk-DBSXZZVL.js";

// src/components/FavoriteToggle.js
import isEqual from "lodash/isEqual.js";
import { useEffect, useRef, useCallback, useMemo } from "react";
import useLatestModule from "react-use/lib/useLatest.js";
import { useForm } from "react-final-form";
import a11yButtonActionHandler from "@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js";
var useLatest = useLatestModule.default || useLatestModule;
function FavoriteToggle({ agendaUid, eventUid, widget }) {
  const form = useForm();
  const [value, setValue] = useFavoriteState(widget.agendaUid || agendaUid);
  const firstRender = useRef(true);
  const latestValue = useLatest(value);
  const eventUidStr = String(eventUid);
  const updateForm = useCallback(
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
  const onChange = useMemo(
    () => a11yButtonActionHandler(updateForm),
    [updateForm]
  );
  useEffect(() => {
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
  useEffect(() => {
    const active = value == null ? void 0 : value.includes(eventUidStr);
    updateCustomFilter(widget, active);
    const formValues = form.getState().values;
    if (formValues.favorites && !isEqual(formValues.uid, value)) {
      updateFormValues(form, {
        uid: value || ["-1"]
      });
    }
  }, [form, eventUidStr, value, widget]);
  return null;
}

export {
  FavoriteToggle
};
//# sourceMappingURL=chunk-CY4HDWSG.js.map