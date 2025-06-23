// src/components/Age.js
import ih from "immutability-helper";
import { Component } from "react";
import Select from "react-select";
import ageLabels from "@openagenda/labels/cibul-templates/age-fields.js";
import flattenLabels from "@openagenda/labels/flatten.js";
import { jsx, jsxs } from "react/jsx-runtime";
var limits = {
  min: 0,
  max: 122
};
var defaults = {
  min: 0,
  max: 99
};
var AgeComponent = class extends Component {
  onChange(field, choice) {
    const { onChange, value } = this.props;
    const clean = parseInt(choice.value, 10);
    onChange(
      ih(value, {
        [field]: {
          $set: Number.isNaN(clean) ? null : clean
        }
      })
    );
  }
  getSelectOptions(minValue) {
    const { lang } = this.props;
    const labels = flattenLabels(ageLabels, lang);
    const options = [];
    const min = minValue || limits.min;
    for (let i = 0; i < limits.max; i++) {
      if (min <= i) {
        options.push({
          value: `${i}`,
          label: `${i} ${i < 2 ? labels.year : labels.years}`
        });
      }
    }
    return options;
  }
  isEnabled() {
    const { value, enabled: enabledFromProps = true } = this.props;
    if (!enabledFromProps) {
      return false;
    }
    const min = parseInt((value == null ? void 0 : value.min) ?? "NaN", 10);
    const max = parseInt((value == null ? void 0 : value.max) ?? "NaN", 10);
    return !Number.isNaN(min) || !Number.isNaN(max);
  }
  toggleEnabled(enable = null) {
    const isEnabled = this.isEnabled();
    if (enable === true) {
      if (!isEnabled) this.initialize();
    } else if (enable === false) {
      if (isEnabled) this.disable();
    } else if (isEnabled) {
      this.disable();
    } else {
      this.initialize();
    }
  }
  disable() {
    const { onChange } = this.props;
    onChange({
      min: null,
      max: null
    });
  }
  initialize() {
    const { onChange } = this.props;
    onChange(defaults);
  }
  render() {
    const { lang, value, enabled: enabledFromProps = true } = this.props;
    const labels = flattenLabels(ageLabels, lang);
    const min = `${(value == null ? void 0 : value.min) ?? ""}`;
    const max = `${(value == null ? void 0 : value.max) ?? ""}`;
    const isEnabled = this.isEnabled();
    const minAgeOptions = this.getSelectOptions();
    const minAgeValue = isEnabled ? minAgeOptions.find((option) => option.value === min) : null;
    const maxAgeOptions = this.getSelectOptions(value ? min : false);
    const maxAgeValue = isEnabled ? maxAgeOptions.find((option) => option.value === max) : null;
    const selectStyles = {
      container: (provided) => ({
        ...provided,
        width: "150px",
        display: "inline-block"
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 3
      })
    };
    return /* @__PURE__ */ jsxs("div", { className: "age", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          disabled: !enabledFromProps,
          type: "checkbox",
          name: "age",
          checked: isEnabled,
          onChange: () => this.toggleEnabled(null)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "age-inputs", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "minage", className: "margin-right-sm", children: labels.min }),
        /* @__PURE__ */ jsx(
          Select,
          {
            isDisabled: !enabledFromProps,
            styles: selectStyles,
            name: "minage",
            value: minAgeValue,
            options: minAgeOptions,
            clearable: false,
            onChange: (choice) => this.onChange("min", choice),
            onFocus: () => this.toggleEnabled(true),
            placeholder: labels.select
          }
        ),
        /* @__PURE__ */ jsx("label", { className: "margin-h-sm", htmlFor: "maxage", children: labels.max }),
        /* @__PURE__ */ jsx(
          Select,
          {
            isDisabled: !enabledFromProps,
            styles: selectStyles,
            name: "maxage",
            value: maxAgeValue,
            options: maxAgeOptions,
            clearable: false,
            onChange: (choice) => this.onChange("max", choice),
            onFocus: () => this.toggleEnabled(true),
            placeholder: labels.select
          }
        )
      ] })
    ] });
  }
};

export {
  AgeComponent
};
//# sourceMappingURL=chunk-HKQYAK24.js.map