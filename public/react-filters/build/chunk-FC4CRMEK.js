import {
  updateCustomFilter
} from "./chunk-EMNX5IV5.js";
import {
  updateFormValues
} from "./chunk-DBSXZZVL.js";
import {
  matchQuery
} from "./chunk-JCQAUF4W.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/CustomFilter.js
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useForm, FormSpy } from "react-final-form";
import a11yButtonActionHandler from "@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js";
import { jsx } from "@emotion/react/jsx-runtime";
var subscription = { values: true };
function Preview({
  name,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  filter,
  query,
  ...rest
}) {
  const form = useForm();
  const onRemove = useCallback(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      updateFormValues(form, filter.query, false);
    },
    [disabled, form, filter]
  );
  return /* @__PURE__ */ jsx(FormSpy, { subscription, children: ({ values }) => {
    if (!matchQuery(values, query) || !activeFilterLabel) {
      return null;
    }
    return React.createElement(component, {
      name,
      label: activeFilterLabel,
      onRemove,
      disabled,
      filter,
      ...rest
    });
  } });
}
function CustomFilter({ filter }) {
  const form = useForm();
  const firstRender = useRef(true);
  const updateForm = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const query = form.getState().values;
      updateFormValues(form, filter.query, !matchQuery(query, filter.query));
    },
    [filter.query, form]
  );
  const onChange = useMemo(
    () => a11yButtonActionHandler(updateForm),
    [updateForm]
  );
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const query = form.getState().values;
      const matchInitialQuery = matchQuery(query, filter.query);
      const registeredFields = form.getRegisteredFields();
      for (const key in filter.query) {
        if (Object.prototype.hasOwnProperty.call(filter.query, key)) {
          if (!registeredFields.includes(key)) {
            form.registerField(
              key,
              () => {
              },
              { value: true },
              {
                initialValue: matchInitialQuery ? filter.query[key] : void 0
              }
            );
          }
        }
      }
    }
    const handlerElem = filter.handlerElem || filter.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]'
    );
    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1 && handlerElem.tagName === "LABEL" && handlerElem.contains(innerCheckboxes[0]);
    if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
      innerCheckboxes[0].addEventListener("change", updateForm, false);
    } else {
      handlerElem.addEventListener("click", onChange, false);
    }
    handlerElem.addEventListener("keydown", onChange, false);
    const unsubscribe = form.subscribe(
      ({ values }) => updateCustomFilter(filter, matchQuery(values, filter.query)),
      { values: true }
    );
    return () => {
      if (innerCheckboxes.length === 1 && (!filter.handlerElem || handlerIsLabelWithCheckbox)) {
        innerCheckboxes[0].removeEventListener("change", updateForm, false);
      } else {
        handlerElem.removeEventListener("click", onChange, false);
      }
      handlerElem.removeEventListener("keydown", onChange, false);
      unsubscribe();
    };
  }, [filter, form, onChange, updateForm]);
  return null;
}
var exported = React.memo(CustomFilter);
exported.Preview = Preview;
var CustomFilter_default = exported;

export {
  CustomFilter_default
};
//# sourceMappingURL=chunk-FC4CRMEK.js.map