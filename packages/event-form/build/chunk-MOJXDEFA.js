// src/validators/accessibility.js
import boolean from "@openagenda/validators/boolean.js";
import schema from "@openagenda/validators/schema/index.js";
schema.register({ boolean });
var accessibility_default = () => schema({
  hi: { type: "boolean", default: false },
  ii: { type: "boolean", default: false },
  vi: { type: "boolean", default: false },
  mi: { type: "boolean", default: false },
  pi: { type: "boolean", default: false }
});

export {
  accessibility_default
};
//# sourceMappingURL=chunk-MOJXDEFA.js.map