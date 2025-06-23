import {
  showRemoveAction
} from "./chunk-2ED66MGV.js";
import {
  languageCodesAndLabels_default
} from "./chunk-MJ2SKPQ7.js";

// src/components/Languages.js
import _ from "lodash";
import { Component } from "react";
import Select from "react-select";
import languages from "languages";
import flattenLabels from "@openagenda/labels/flatten.js";
import languageLabels from "@openagenda/labels/event/form.js";
import { a11yButtonActionHandler } from "@openagenda/react-shared";
import { jsx, jsxs } from "react/jsx-runtime";
var Languages = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adding: false,
      changing: false
    };
    this.onChangeStart = this.onChangeStart.bind(this);
    this.onAddSelectStart = this.onAddSelectStart.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onCancelChange = this.onCancelChange.bind(this);
  }
  onAddSelectStart() {
    this.setState({ adding: true });
  }
  onChangeStart() {
    const { value } = this.props;
    if (value.length !== 1) return;
    this.setState({ changing: true });
  }
  onChange(l) {
    const { onChange } = this.props;
    onChange([l.value]);
    this.setState({ changing: false });
  }
  onCancelChange() {
    this.setState({ changing: false });
  }
  onRemove(l) {
    const { onChange, value } = this.props;
    onChange(value.filter((current) => current !== l));
  }
  onAdd(l) {
    const { onChange, value } = this.props;
    onChange(value.concat(l.value));
    this.setState({ adding: false });
  }
  getRemainingLanguages() {
    const { value } = this.props;
    return languageCodesAndLabels_default.filter((l) => !value.includes(l.value));
  }
  render() {
    const { value, lang, field } = this.props;
    const { changing, adding } = this.state;
    const pickedLanguages = value;
    const labels = flattenLabels(languageLabels, lang);
    const { strict, required } = field;
    return /* @__PURE__ */ jsxs("div", { className: "language-bar", children: [
      !changing ? /* @__PURE__ */ jsx("ul", { children: pickedLanguages.map((l) => /* @__PURE__ */ jsx(
        "li",
        {
          role: "presentation",
          onClick: a11yButtonActionHandler(this.onChangeStart),
          onKeyPress: a11yButtonActionHandler(this.onChangeStart),
          children: /* @__PURE__ */ jsxs("div", { className: "language-item", children: [
            /* @__PURE__ */ jsx("span", { children: languages.getLanguageInfo(l).nativeName }),
            showRemoveAction(
              { strict, pickedLanguages, required },
              l
            ) ? /* @__PURE__ */ jsx(
              "span",
              {
                role: "button",
                tabIndex: "0",
                className: "remove",
                onClick: a11yButtonActionHandler(
                  this.onRemove.bind(this, l)
                ),
                onKeyPress: a11yButtonActionHandler(
                  this.onRemove.bind(this, l)
                ),
                children: "\u2715"
              }
            ) : null,
            !strict && pickedLanguages.length === 1 ? /* @__PURE__ */ jsx("span", { className: "margin-right-xs", children: /* @__PURE__ */ jsx("i", { className: "fa fa-angle-down" }) }) : null
          ] })
        },
        `language-${l}`
      )) }) : null,
      !strict && !adding && !changing ? /* @__PURE__ */ jsx("span", { className: "language-add", children: /* @__PURE__ */ jsx("a", { onClick: this.onAddSelectStart, children: labels.addLanguage }) }) : null,
      adding && /* @__PURE__ */ jsx("span", { className: "language-add", children: /* @__PURE__ */ jsx(
        Select,
        {
          placeholder: labels.selectLanguage,
          options: this.getRemainingLanguages(),
          onChange: this.onAdd,
          classNamePrefix: "language-select",
          clearable: false
        }
      ) }),
      changing && /* @__PURE__ */ jsx(
        Select,
        {
          placeholder: labels.selectLanguage,
          value: _.first(
            languageCodesAndLabels_default.filter(
              (c) => _.first(pickedLanguages) === c.value
            )
          ),
          options: this.getRemainingLanguages(),
          onChange: this.onChange,
          className: "change-select margin-right-sm",
          clearable: false
        }
      ),
      changing && /* @__PURE__ */ jsx("span", { className: "change-cancel", children: /* @__PURE__ */ jsx("a", { onClick: this.onCancelChange, children: labels.cancelLanguageChange }) })
    ] });
  }
};

export {
  Languages
};
//# sourceMappingURL=chunk-UVISQWTK.js.map