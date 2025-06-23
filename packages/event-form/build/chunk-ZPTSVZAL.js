import {
  schemaLanguages_default
} from "./chunk-AXBOSLHH.js";
import {
  injectValidators_default
} from "./chunk-6SNFBSR2.js";
import {
  event_default
} from "./chunk-7F6GZUDQ.js";

// src/schema.js
import { produce } from "immer";
import eventFormLabels from "@openagenda/labels/event/form.js";
import merge from "@openagenda/form-schemas/client/build/iso/merge.js";
function _fillInTheBlanks(labels2, defaultLang = "en") {
  return produce(labels2, (draft) => {
    Object.keys(draft).forEach((field) => {
      Object.keys(draft[field]).forEach((lang) => {
        if (!draft[field][lang].length) {
          draft[field][lang] = draft[field][defaultLang];
        }
      });
    });
    return draft;
  });
}
var labels = _fillInTheBlanks(eventFormLabels);
var schema_default = (options = {}) => {
  const {
    includeEventFields,
    interfaceLanguage,
    languages,
    schemaExtensions,
    excludeNonDataFields,
    access
  } = {
    includeEventFields: true,
    access: {
      read: "public",
      write: "public"
    },
    ...options
  };
  const eventSchema = {
    fields: [],
    type: "event"
  };
  injectValidators_default(eventSchema);
  eventSchema.fields = event_default({
    labels
  });
  const hasExtensions = Array.isArray(schemaExtensions);
  const finalSchema = merge(
    ...[eventSchema].concat(hasExtensions ? schemaExtensions : []).concat({ access })
  );
  if (hasExtensions && !includeEventFields) {
    const eventSchemaFields = eventSchema.fields.map((f) => f.field);
    finalSchema.fields = finalSchema.fields.filter(
      (f) => !eventSchemaFields.includes(f.field)
    );
  }
  if (excludeNonDataFields) {
    finalSchema.fields = finalSchema.fields.filter(
      (f) => f.field !== "languages"
    );
  }
  return schemaLanguages_default.set(finalSchema, interfaceLanguage, languages);
};

export {
  schema_default
};
//# sourceMappingURL=chunk-ZPTSVZAL.js.map