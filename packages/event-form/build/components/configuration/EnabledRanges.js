import "../../chunk-PZ5AY32C.js";

// src/components/configuration/EnabledRanges.js
import { useState, useEffect } from "react";
import MaskedInputModule from "react-text-mask";
import { format } from "date-fns";
import enabledRangesLabels from "@openagenda/labels/event/enabledRanges.js";
import flattenLabels from "@openagenda/labels/flatten.js";
import DateField from "@openagenda/form-schemas/client/build/Components/DateField.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var MaskedInput = MaskedInputModule.default || MaskedInputModule;
var timeMask = [/\d/, /\d/, ":", /\d/, /\d/];
var EnabledRanges = ({ lang = "fr", value = null, field, onChange }) => {
  const readValue = (aValue) => aValue ? aValue[0] : null;
  const { constraints } = field;
  const labels = flattenLabels(enabledRangesLabels, lang);
  const [localValue, setLocalValue] = useState(value);
  const [checked, setChecked] = useState(!!readValue(value));
  const [constraintError, setConstraintError] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [timeError, setTimeError] = useState(null);
  const checkAndOnChange = (newValue) => {
    setLocalValue(newValue);
    const beginDate = readValue(newValue) && readValue(newValue).begin ? new Date(readValue(newValue).begin) : null;
    const endDate = readValue(newValue) && readValue(newValue).end ? new Date(readValue(newValue).end) : null;
    if (!beginDate || !endDate) {
      return;
    }
    setDateError(null);
    setConstraintError(null);
    setTimeError(null);
    if (beginDate.toString() === "Invalid Date" || endDate.toString() === "Invalid Date") {
      if (beginDate.toString() === "Invalid Date") setTimeError({ begin: true });
      if (endDate.toString() === "Invalid Date") setTimeError({ end: true });
      if (beginDate.toString() === "Invalid Date" && endDate.toString() === "Invalid Date") setTimeError({ begin: true, end: true });
      return;
    }
    if (!(beginDate < endDate)) {
      setDateError(true);
      return;
    }
    if (constraints && !(new Date(constraints[0].begin) <= beginDate && new Date(constraints[0].end) >= endDate)) {
      setConstraintError(true);
      return;
    }
    onChange(newValue);
  };
  useEffect(() => {
    checkAndOnChange(localValue);
  }, []);
  const getDate = (name) => {
    if (!readValue(localValue)) return null;
    if (!readValue(localValue)[name]) return null;
    if (readValue(localValue)[name].split("T")[0] === "null") return null;
    return readValue(localValue)[name].split("T")[0];
  };
  const getTime = (name) => {
    if (!readValue(localValue)) return null;
    if (!readValue(localValue)[name]) return null;
    if (readValue(localValue)[name].split("T")[1] === "null") return null;
    return readValue(localValue)[name].split("T")[1];
  };
  return /* @__PURE__ */ jsxs("div", { className: "checkbox", children: [
    /* @__PURE__ */ jsxs("label", { htmlFor: "enabledRanges", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "enabledRanges",
          type: "checkbox",
          checked,
          onChange: () => {
            if (checked) {
              onChange(void 0);
            }
            setChecked(!checked);
          }
        }
      ),
      /* @__PURE__ */ jsx("strong", { children: labels.checkboxInfo }),
      /* @__PURE__ */ jsx("div", { className: "text-muted margin-bottom-sm", children: labels.usefulFor })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "checkbox-sub-menu", children: checked ? /* @__PURE__ */ jsxs(Fragment, { children: [
      constraints ? /* @__PURE__ */ jsxs(
        "div",
        {
          className: `info-block-sm margin-bottom-sm ${constraintError ? "danger" : ""}`,
          children: [
            /* @__PURE__ */ jsx("p", { children: labels.constraintInfo }),
            /* @__PURE__ */ jsxs("p", { children: [
              labels.from,
              ":",
              " ",
              new Date(constraints[0].begin).toLocaleDateString("fr-FR"),
              " ",
              labels.at,
              " ",
              new Date(constraints[0].begin).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit"
              })
            ] }),
            /* @__PURE__ */ jsxs("text", { children: [
              labels.to,
              ":",
              " ",
              new Date(constraints[0].end).toLocaleDateString("fr-FR"),
              " ",
              labels.at,
              " ",
              new Date(constraints[0].end).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit"
              })
            ] })
          ]
        }
      ) : null,
      /* @__PURE__ */ jsxs("form", { className: "form-inline", children: [
        /* @__PURE__ */ jsx("div", { className: "form-group", children: labels.from }),
        /* @__PURE__ */ jsx("div", { className: "form-group", children: /* @__PURE__ */ jsx(
          DateField,
          {
            className: "margin-h-sm",
            field: {
              field: "begin",
              fieldType: "date"
            },
            value: getDate("begin"),
            enabled: true,
            lang,
            onChange: (v) => {
              if (!getTime("begin")) {
                checkAndOnChange([
                  {
                    ...readValue(localValue),
                    begin: `${format(v, "yyyy-MM-dd")}`
                  }
                ]);
                return;
              }
              checkAndOnChange([
                {
                  ...readValue(localValue),
                  begin: `${format(v, "yyyy-MM-dd")}T${getTime("begin")}`
                }
              ]);
            }
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "form-group", children: labels.at }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `form-group ${(timeError == null ? void 0 : timeError.begin) ? "has-error" : ""}`,
            children: /* @__PURE__ */ jsx(
              MaskedInput,
              {
                value: getTime("begin") || "",
                className: "form-control text-center margin-left-sm",
                mask: timeMask,
                placeholder: "HH:MM",
                keepCharPositions: true,
                onBlur: (e) => {
                  checkAndOnChange([
                    {
                      ...readValue(localValue),
                      begin: `${getDate("begin")}T${e.target.value}`
                    }
                  ]);
                },
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    checkAndOnChange([
                      {
                        ...readValue(localValue),
                        begin: `${getDate("begin")}T${e.target.value}`
                      }
                    ]);
                  }
                },
                style: {
                  width: "75px"
                }
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("form", { className: "form-inline margin-top-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "form-group", children: labels.to }),
        /* @__PURE__ */ jsx("div", { className: `form-group ${dateError ? "has-error" : ""}`, children: /* @__PURE__ */ jsx(
          DateField,
          {
            className: "margin-h-sm",
            field: {
              field: "end"
            },
            value: getDate("end"),
            enabled: true,
            lang,
            onChange: (v) => {
              if (!getTime("end")) {
                checkAndOnChange([
                  {
                    ...readValue(localValue),
                    end: `${format(v, "yyyy-MM-dd")}`
                  }
                ]);
                return;
              }
              checkAndOnChange([
                {
                  ...readValue(localValue),
                  end: `${format(v, "yyyy-MM-dd")}T${getTime("end")}`
                }
              ]);
            }
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "form-group", children: labels.at }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `form-group ${(timeError == null ? void 0 : timeError.end) ? "has-error" : ""}`,
            children: /* @__PURE__ */ jsx(
              MaskedInput,
              {
                className: "form-control text-center margin-left-sm",
                value: getTime("end") || "",
                mask: timeMask,
                placeholder: "HH:MM",
                keepCharPositions: true,
                onBlur: (e) => {
                  checkAndOnChange([
                    {
                      ...readValue(localValue),
                      end: `${getDate("end")}T${e.target.value}`
                    }
                  ]);
                },
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    checkAndOnChange([
                      {
                        ...readValue(localValue),
                        end: `${getDate("end")}T${e.target.value}`
                      }
                    ]);
                  }
                },
                style: {
                  width: "75px"
                }
              }
            )
          }
        )
      ] }),
      constraintError || dateError || timeError ? /* @__PURE__ */ jsxs("div", { className: "info-block-sm danger", children: [
        timeError ? labels.timeError : null,
        dateError ? labels.dateError : null,
        constraintError ? labels.constraintError : null
      ] }) : null
    ] }) : null })
  ] });
};
var EnabledRanges_default = EnabledRanges;
export {
  EnabledRanges_default as default
};
//# sourceMappingURL=EnabledRanges.js.map