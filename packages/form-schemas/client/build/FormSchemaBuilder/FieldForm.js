import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/FieldForm.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import { Component } from 'react';
import passValidator from '@openagenda/validators/pass.js';
import FormSchemaComponent from '../index.js';
import merge from '../iso/merge.js';
import flattenLabels from '../lib/flatten.js';
import slugFromLabel from './lib/slugFromLabel.js';
import fg from './lib/fieldGroups.js';
import Options from './Options.js';
import unflattenLabels from './lib/unflattenLabels.js';
import restrictLabelLanguages from './lib/restrictLabelLanguages.js';
import optionsValidator from './lib/optionsValidator.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const assignConstraintsToFields = (schema, parents) => {
  var _context;
  return _reduceInstanceProperty(_context = schema.fields).call(_context, (carriedSchema, field) => {
    carriedSchema.fields.push(_objectSpread(_objectSpread({}, field), {}, {
      constraints: parents ? parents[field.field] : null
    }));
    return carriedSchema;
  }, _objectSpread(_objectSpread({}, schema), {}, {
    fields: []
  }));
};
const fieldOrder = order => ({
  fields: order.map(f => ({
    field: f,
    fieldType: 'abstract'
  }))
});
const fieldSchemaTypes = {
  labels: _ref => {
    let {
      labelLanguages
    } = _ref;
    return fg.labels({
      labelLanguages
    });
  },
  textLike: _ref2 => {
    var _parentsField$optiona;
    let {
      labelLanguages,
      parentsField
    } = _ref2;
    return merge(fg.labels({
      labelLanguages
    }), parentsField ? null : fg.minMax({
      min: 0,
      max: 255
    }), !parentsField || ((_parentsField$optiona = parentsField === null || parentsField === void 0 ? void 0 : parentsField.optional) !== null && _parentsField$optiona !== void 0 ? _parentsField$optiona : true) ? fg.optional() : null, fieldOrder(['label', 'optional', 'min', 'max', 'info', 'placeholder', 'sub']));
  },
  radioLike: _ref3 => {
    var _parentsField$optiona2;
    let {
      labelLanguages,
      parentsField
    } = _ref3;
    return merge(fg.labels({
      labelLanguages
    }), !parentsField || ((_parentsField$optiona2 = parentsField === null || parentsField === void 0 ? void 0 : parentsField.optional) !== null && _parentsField$optiona2 !== void 0 ? _parentsField$optiona2 : true) ? fg.optional() : null, parentsField ? null : fg.options({
      labelLanguages
    }), fieldOrder(['label', 'optional', 'options', 'placeholder', 'sub']));
  },
  customLike: customFieldSchema => _ref4 => {
    let {
      labelLanguages
    } = _ref4;
    return merge(customFieldSchema.fields.some(f => f.field === 'label') ? fg.labels({
      labelLanguages
    }) : null, customFieldSchema.fields.some(f => f.field === 'optional') ? fg.optional() : null, customFieldSchema);
  }
};
const schemas = (type, _ref5) => {
  var _context2, _context3;
  let {
    customFieldConfigurationSchemas
  } = _ref5;
  if (type === 'section') {
    return fg.section;
  }
  if (_includesInstanceProperty(_context2 = ['text', 'textarea', 'markdown', 'link', 'boolean', 'email', 'integer']).call(_context2, type)) {
    return fieldSchemaTypes.textLike;
  }
  if (_includesInstanceProperty(_context3 = ['radio', 'checkbox', 'select', 'multiselect']).call(_context3, type)) {
    return fieldSchemaTypes.radioLike;
  }
  if (customFieldConfigurationSchemas && customFieldConfigurationSchemas[type]) {
    return fieldSchemaTypes.customLike(customFieldConfigurationSchemas[type]);
  }
  return fieldSchemaTypes.labels;
};
export default class FieldForm extends Component {
  constructor(props) {
    super(props);
    const {
      labelLanguages,
      field,
      lang
    } = props;
    this.state = {
      values: labelLanguages.length ? unflattenLabels(field, labelLanguages) : flattenLabels(field, lang),
      errors: []
    };
    this.onChange = this.onChange.bind(this);
  }
  onChange(_ref6) {
    let {
      values,
      errors
    } = _ref6;
    this.setState({
      errors,
      values
    });
  }
  onSubmit(sanitize) {
    var _field$fieldType;
    const {
      lang,
      field,
      initFieldType,
      labelLanguages,
      onSubmit
    } = this.props;
    const {
      values,
      errors: stateErrors
    } = this.state;
    const {
      errors
    } = sanitize(values);
    const fieldType = (_field$fieldType = field === null || field === void 0 ? void 0 : field.fieldType) !== null && _field$fieldType !== void 0 ? _field$fieldType : initFieldType;
    if (errors.length) {
      return this.setState({
        errors
      });
    }
    if ((stateErrors || []).length) return;
    const item = restrictLabelLanguages(values, labelLanguages);
    if (fieldType === 'section') {
      item.type = 'section';
      item.slug = slugFromLabel(values === null || values === void 0 ? void 0 : values.label, lang);
    } else {
      item.fieldType = fieldType;
      item.field = (field === null || field === void 0 ? void 0 : field.field) || slugFromLabel(values === null || values === void 0 ? void 0 : values.label, lang);
    }
    onSubmit(item);
  }
  render() {
    var _field$fieldType2, _context4;
    const {
      labelLanguages,
      lang,
      field: propsField,
      initFieldType,
      actionComponent,
      customFieldConfigurationSchemas,
      // new
      components,
      // new
      parentsField,
      enable = true
    } = this.props;
    const {
      values,
      errors
    } = this.state;
    const field = propsField !== null && propsField !== void 0 ? propsField : {
      fieldType: initFieldType
    };
    const schema = assignConstraintsToFields(schemas((_field$fieldType2 = field.fieldType) !== null && _field$fieldType2 !== void 0 ? _field$fieldType2 : field.type, {
      customFieldConfigurationSchemas
    })({
      labelLanguages,
      parentsField
    }), parentsField);
    if (!enable) {
      schema.fields.forEach(f => {
        f.enable = false;
      });
    }
    const customs = components ? _reduceInstanceProperty(_context4 = Object.keys(components)).call(_context4, (prev, curr) => _objectSpread(_objectSpread({}, prev), {}, {
      [curr]: passValidator
    }), {}) : null;
    schema.custom = _objectSpread(_objectSpread({}, customs), {}, {
      options: optionsValidator
    });
    return /*#__PURE__*/_jsxDEV("div", {
      className: "margin-top-sm",
      children: /*#__PURE__*/_jsxDEV(FormSchemaComponent, {
        stateless: true,
        values: values,
        errors: errors,
        components: _objectSpread({
          options: Options
        }, components),
        onChange: this.onChange,
        lang: lang,
        schema: schema,
        actionComponents: [{
          position: 'bottom',
          Component: _ref7 => {
            let {
              sanitize
            } = _ref7;
            return actionComponent({
              onSubmit: this.onSubmit.bind(this, sanitize)
            });
          }
        }]
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 187,
        columnNumber: 9
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 186,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=FieldForm.js.map