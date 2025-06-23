import {
  EventsAdditionalFieldComponent
} from "./chunk-OE7763HL.js";
import "./chunk-NSIWX63Y.js";
import "./chunk-XJNLOVRC.js";
import "./chunk-RINQXU4K.js";
import "./chunk-D7N7YQOA.js";
import "./chunk-4BWOB5LX.js";
import {
  removeMultilingualValues_default
} from "./chunk-66H3XWAK.js";
import {
  transferMultilingualValues_default
} from "./chunk-A2Z36CQ3.js";
import {
  updateLanguages
} from "./chunk-NM6BOMDS.js";
import {
  appendFormFieldConfigurations
} from "./chunk-5PXKPOJR.js";
import {
  extractLanguages
} from "./chunk-ES2NDY4P.js";
import {
  getMultilingualFieldNames_default
} from "./chunk-SOUGXV43.js";
import {
  identifyLanguageChanges_default
} from "./chunk-HZ6QDHCF.js";
import {
  locales_compiled_exports
} from "./chunk-PJ6MWQLC.js";
import {
  Location_default
} from "./chunk-XAZJRTVC.js";
import "./chunk-VB3R3CZR.js";
import {
  TimingsComponent
} from "./chunk-7P6AYHNE.js";
import "./chunk-UJTMWBIB.js";
import {
  schema_default
} from "./chunk-ZPTSVZAL.js";
import {
  schemaLanguages_default
} from "./chunk-AXBOSLHH.js";
import {
  injectValidators_default
} from "./chunk-6SNFBSR2.js";
import {
  validators_default
} from "./chunk-OJWNQI7B.js";
import "./chunk-2KU34P4D.js";
import "./chunk-4LU3LPNS.js";
import "./chunk-V6VOOY44.js";
import "./chunk-MOJXDEFA.js";
import "./chunk-WCR23ZMK.js";
import "./chunk-7F6GZUDQ.js";
import {
  AccessibilityComponent
} from "./chunk-HDRGSFE5.js";
import {
  AgeComponent
} from "./chunk-HKQYAK24.js";
import {
  ConfigurableTextarea_default
} from "./chunk-7CRH2JF4.js";
import {
  Keywords_default
} from "./chunk-COASEV6R.js";
import {
  Languages
} from "./chunk-UVISQWTK.js";
import "./chunk-2ED66MGV.js";
import "./chunk-MJ2SKPQ7.js";
import "./chunk-PZ5AY32C.js";

// src/index.js
import _ from "lodash";
import ih from "immutability-helper";
import { Component } from "react";
import { IntlProvider } from "react-intl";
import commonLocales from "@openagenda/common-labels";
import { getSupportedLocale, mergeLocales } from "@openagenda/intl";
import FormSchemaComponent from "@openagenda/form-schemas/client/build/index.js";
import errorLabels from "@openagenda/labels/event/errors.js";
import Registration from "@openagenda/registration-apps";
import { jsx } from "react/jsx-runtime";
var eventFormComponents = {
  age: AgeComponent,
  registration: Registration,
  keywords: Keywords_default,
  timings: TimingsComponent,
  location: Location_default,
  languages: Languages,
  accessibility: AccessibilityComponent,
  events: EventsAdditionalFieldComponent,
  longDescription: ConfigurableTextarea_default
};
var EventForm = class extends Component {
  constructor(props) {
    super(props);
    const { values: propsValues } = this.props;
    this.onChange = this.onChange.bind(this);
    const languages = extractLanguages(props.schema, propsValues, {
      defaultLanguage: props.lang
    });
    const { schema, hash } = this.buildEventSchema(languages, props);
    const values = ih(props.values ?? {}, {
      languages: {
        $set: languages
        // schemaLanguages.getFromSchemaAndValues(schema, props.lang, languages)
      }
    });
    this.state = {
      values,
      schema,
      hash,
      files: [],
      loading: false
    };
  }
  onChange({ values, errors, files, loading, globalError }) {
    const { lang, devOnChange } = this.props;
    const { values: stateValues } = this.state;
    const languageChanges = identifyLanguageChanges_default(
      _.get(this.state, "values.languages"),
      // before
      _.get(values, "languages")
      // now
    );
    const update = _.omitBy(
      {
        errors,
        globalError,
        files,
        loading
      },
      _.isUndefined
    );
    if (values) update.values = values;
    const multilingualFieldNames = getMultilingualFieldNames_default(
      schema_default({ languages: true })
    );
    if (languageChanges.swapped.length) {
      update.values = ih(
        transferMultilingualValues_default(
          stateValues,
          multilingualFieldNames,
          _.get(this, "state.values.languages.0"),
          _.first(languageChanges.swapped)
        ),
        {
          languages: {
            $set: [languageChanges.swapped[0]]
          }
        }
      );
    } else if (languageChanges.removed.length) {
      update.values = ih(
        removeMultilingualValues_default(
          stateValues,
          multilingualFieldNames,
          languageChanges.removed
        ),
        {
          languages: {
            $set: stateValues.languages.filter(
              (l) => !languageChanges.removed.includes(l)
            )
          }
        }
      );
    }
    if (languageChanges.has) {
      _.assign(update, this.buildEventSchema(_.get(values, "languages")));
      update.values.languages = schemaLanguages_default.getFromSchemaAndValues(
        update.schema,
        lang,
        update.values.languages
      );
    }
    if (devOnChange) devOnChange(update);
    return this.setState(update);
  }
  buildEventSchema(languages, props = null) {
    const p = props || this.props;
    const { schema: propsSchema } = this.props;
    const schema = propsSchema || schema_default({
      includeEventFields: p.includeEventFields,
      interfaceLanguage: p.lang,
      suggestionsRes: p.suggestionsRes,
      languages,
      schemaExtensions: p.schemaExtensions,
      access: {
        write: p.role
      }
    });
    appendFormFieldConfigurations(schema, {
      locationRes: p.locationRes,
      tiles: p.tiles,
      fileStore: p.fileStore
    });
    injectValidators_default(schema);
    updateLanguages(schema, languages);
    return {
      schema,
      hash: JSON.stringify(languages)
      // only language changes may trigger schema changes
    };
  }
  render() {
    const {
      lang,
      actionComponents,
      onSubmitSuccess,
      classNames,
      role,
      maxFileSize,
      res
    } = this.props;
    const { values, schema, hash, errors, globalError, loading, files } = this.state;
    return /* @__PURE__ */ jsx(
      IntlProvider,
      {
        locale: lang,
        messages: mergeLocales(commonLocales, locales_compiled_exports)[lang],
        defaultLocale: getSupportedLocale(lang),
        children: /* @__PURE__ */ jsx(
          FormSchemaComponent,
          {
            res: res ? { post: res } : void 0,
            method: "post",
            role,
            stateless: true,
            maxFileSize,
            lang,
            components: eventFormComponents,
            values,
            errors,
            globalError,
            loading,
            files,
            onChange: this.onChange,
            schema,
            hash,
            classNames: ih(classNames ?? {}, {
              field: { $set: "padding-v-sm form-group" }
            }),
            actionComponents,
            onSubmitSuccess,
            labels: {
              errors: errorLabels
            }
          }
        )
      },
      lang
    );
  }
};
var src_default = EventForm;
export {
  src_default as default,
  validators_default as validators
};
//# sourceMappingURL=index.js.map