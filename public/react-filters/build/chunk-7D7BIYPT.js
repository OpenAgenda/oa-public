import {
  updateCustomFilter
} from "./chunk-EMNX5IV5.js";
import {
  useFavoriteState
} from "./chunk-ZEN56UHG.js";
import {
  useFavoritesOnChange
} from "./chunk-2UQN5EMM.js";
import {
  updateFormValues
} from "./chunk-DBSXZZVL.js";
import {
  matchQuery
} from "./chunk-JCQAUF4W.js";
import {
  FilterPreviewer
} from "./chunk-FUQD6HGF.js";

// src/components/filters/FavoritesFilter.js
import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { useForm, FormSpy } from "react-final-form";
import useLatestModule from "react-use/lib/useLatest.js";
import a11yButtonActionHandler from "@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js";
import { jsx } from "@emotion/react/jsx-runtime";
var useLatest = useLatestModule.default || useLatestModule;
var subscription = { values: true };
function Preview({
  name = "favorites",
  filter,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  agendaUid,
  ...rest
}) {
  const form = useForm();
  const [value] = useFavoriteState(filter.agendaUid || agendaUid);
  const onRemove = useCallback(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      updateFormValues(
        form,
        {
          uid: void 0,
          favorites: void 0
        },
        false
      );
      const handlerElem = filter.handlerElem || filter.elem;
      const innerCheckboxes = handlerElem.querySelectorAll(
        'input[type="checkbox"]'
      );
      if (innerCheckboxes.length === 1 && !filter.handlerElem) {
        innerCheckboxes[0].checked = false;
      }
    },
    [disabled, form, filter]
  );
  return /* @__PURE__ */ jsx(FormSpy, { subscription, children: ({ values }) => {
    const query = {
      uid: value,
      favorites: "1"
    };
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
var FavoritesFilter = React.forwardRef(function FavoritesFilter2({ agendaUid, filter }, _ref) {
  const form = useForm();
  const firstRender = useRef(true);
  const [value] = useFavoriteState(filter.agendaUid || agendaUid);
  const latestValue = useLatest(value);
  const updateForm = useFavoritesOnChange(value, {
    isExclusive: filter.exclusive
  });
  const onChange = useMemo(
    () => a11yButtonActionHandler(updateForm),
    [updateForm]
  );
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const query = form.getState().values;
      const registeredFields = form.getRegisteredFields();
      if (!registeredFields.includes("uid")) {
        form.registerField(
          "uid",
          () => {
          },
          { value: true },
          {
            initialValue: query.uid
          }
        );
      }
      if (!registeredFields.includes("favorites")) {
        form.registerField(
          "favorites",
          () => {
          },
          { value: true },
          {
            initialValue: query.favorites
          }
        );
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
      ({ values }) => updateCustomFilter(
        filter,
        matchQuery(values, {
          uid: latestValue.current || ["-1"],
          favorites: "1"
        })
      ),
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
  }, [filter, form, latestValue, onChange, updateForm]);
  return null;
});
var exported = React.memo(FavoritesFilter);
exported.Preview = Preview;
var FavoritesFilter_default = exported;

export {
  FavoritesFilter_default
};
//# sourceMappingURL=chunk-7D7BIYPT.js.map