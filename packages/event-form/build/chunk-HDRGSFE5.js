// src/components/Accessibility.js
import _ from "lodash";
import { Component } from "react";
import mLabels from "@openagenda/labels/event/accessibility.js";
import flatten from "@openagenda/labels/flatten.js";
import { jsx, jsxs } from "react/jsx-runtime";
var TYPES = ["hi", "vi", "pi", "mi", "ii"];
var getDefault = () => TYPES.reduce(
  (c, t) => ({
    ...c,
    [t]: false
  }),
  {}
);
var AccessibilityComponent = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: this.hasAccessibility()
    };
  }
  hasAccessibility() {
    const { value: currentValue } = this.props;
    const value = currentValue ?? getDefault();
    return !!_.keys(value).filter((k) => value[k]).length;
  }
  toggleEnabled() {
    const { onChange } = this.props;
    const { enabled } = this.state;
    const toggled = !enabled;
    this.setState({
      enabled: toggled
    });
    if (!toggled && this.hasAccessibility()) {
      onChange(getDefault());
    }
  }
  toggleAccessibility(type) {
    const { onChange, value: currentValue } = this.props;
    const value = currentValue ?? getDefault();
    onChange({
      ...value,
      [type]: !value[type]
    });
  }
  render() {
    const { value, lang } = this.props;
    const labels = flatten(mLabels, lang, true);
    const { enabled } = this.state;
    return /* @__PURE__ */ jsxs("div", { className: "accessibility form-group", children: [
      /* @__PURE__ */ jsx("div", { className: "checkbox", children: /* @__PURE__ */ jsxs("label", { htmlFor: "show-accessibility", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "show-accessibility",
            type: "checkbox",
            checked: enabled,
            onChange: this.toggleEnabled.bind(this)
          }
        ),
        labels.input
      ] }) }),
      enabled ? /* @__PURE__ */ jsx("div", { className: "accessibility-detail margin-left-md margin-top-md", children: TYPES.map((type, i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `checkbox ${type + (i + 1 < TYPES.length ? " margin-bottom-md" : " margin-bottom-xs")}`,
          children: /* @__PURE__ */ jsxs("label", { htmlFor: type, children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                id: type,
                name: type,
                type: "checkbox",
                checked: !!(value == null ? void 0 : value[type]),
                onChange: this.toggleAccessibility.bind(this, type)
              }
            ),
            /* @__PURE__ */ jsx("i", {}),
            labels[type]
          ] })
        },
        type
      )) }) : null
    ] });
  }
};

export {
  AccessibilityComponent
};
//# sourceMappingURL=chunk-HDRGSFE5.js.map