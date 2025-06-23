// src/components/ConfigurableTextarea.js
import TextField from "@openagenda/form-schemas/client/build/Components/TextField.js";
import MarkdownField from "@openagenda/form-schemas/client/build/Components/MarkdownField.js";
import { jsx } from "react/jsx-runtime";
var ConfigurableTextarea = (props) => {
  const { field } = props;
  if (field.mode === "textarea") {
    return /* @__PURE__ */ jsx(TextField, { ...props, field: { ...field, fieldType: "textarea" } });
  }
  return /* @__PURE__ */ jsx(MarkdownField, { ...props, field: { ...field, fieldType: "textarea" } });
};
var ConfigurableTextarea_default = ConfigurableTextarea;

export {
  ConfigurableTextarea_default
};
//# sourceMappingURL=chunk-7CRH2JF4.js.map