// src/components/Keywords.js
import { useState } from "react";
import TagsInput from "react-tagsinput";
import { jsx } from "react/jsx-runtime";
var KeywordsComponent = ({ field, value = [], onChange }) => {
  const [inputValues, setInputValues] = useState(null);
  const myOnChange = (v) => {
    setInputValues();
    onChange([...new Set(v)]);
  };
  const onInputChange = (e) => {
    const parts = e.target.value.split(",");
    if (parts.length === 2) {
      if (parts[0].length >= 1) {
        value.push(parts[0]);
        myOnChange(value);
      }
      setInputValues();
      return;
    }
    setInputValues(e.target.value);
  };
  return /* @__PURE__ */ jsx("div", { className: "multi-input", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    TagsInput,
    {
      value,
      onChange: (v) => myOnChange(v),
      inputProps: {
        value: inputValues || "",
        onChange: (e) => onInputChange(e),
        placeholder: field.placeholder,
        onBlur: (e) => {
          if (!e.target.value.length) return;
          setInputValues();
          value.push(e.target.value);
          myOnChange(value);
        },
        style: value ? { width: "630px" } : null
      }
    }
  ) }) });
};
var Keywords_default = KeywordsComponent;

export {
  Keywords_default
};
//# sourceMappingURL=chunk-COASEV6R.js.map