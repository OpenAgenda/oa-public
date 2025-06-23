import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import { optionedTypes, minMaxedTypes } from './fieldTypes.js';
export default function buildFieldSchema(type) {
  var _context;
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    defaultLabelLanguage = null,
    isMultilingual = true,
    requireLabels = true
  } = options;
  const labelFieldType = isMultilingual || defaultLabelLanguage ? 'multilingual' : 'text';
  const structure = {
    // all custom schema fields must have a field name
    // that is the name that will be used for the input
    // in the form as well as the key in data exports
    field: {
      type: 'text',
      optional: false,
      max: 255
    },
    // the label to be displayed in the form
    label: {
      type: labelFieldType,
      optional: !requireLabels,
      defaultLanguage: defaultLabelLanguage
    },
    // the optional help text
    help: {
      type: labelFieldType,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },
    helpLink: {
      type: 'link',
      optional: true,
      default: null
    },
    helpContent: {
      type: 'text',
      optional: true,
      default: null
    },
    default: {
      type: 'pass',
      // dependent on type of field
      optional: true
    },
    // an informative text can be added adjacent to the form item
    info: {
      type: labelFieldType,
      max: 1000,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },
    sub: {
      type: labelFieldType,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },
    placeholder: {
      type: labelFieldType,
      max: 400,
      optional: true,
      default: null,
      defaultLanguage: defaultLabelLanguage
    },
    write: {
      type: 'text',
      optional: true,
      list: {
        default: null
      }
    },
    read: {
      type: 'text',
      optional: true,
      list: {
        default: null
      }
    },
    optional: {
      type: 'boolean'
    },
    display: {
      type: 'pass',
      default: true
    },
    enable: {
      type: 'boolean',
      default: true
    },
    // when the field was defined elsewhere (tag, category or custom)
    origin: {
      type: 'choice',
      default: null,
      unique: true,
      options: ['tags', 'categories', 'custom']
    },
    // other field that defines if this field should be enabled
    enableWith: {
      type: 'pass',
      default: null
    },
    optionalWith: {
      type: 'pass',
      default: null
    },
    allowNull: {
      type: 'boolean',
      optional: true,
      default: undefined
    },
    related: {
      enable: {
        type: 'text',
        default: [],
        list: true
      },
      optional: {
        type: 'text',
        default: [],
        list: true
      },
      other: {
        type: 'text',
        default: [],
        list: true
      }
    },
    constraints: {
      type: 'pass',
      optional: true
    },
    selfHandled: {
      type: 'choice',
      optional: true,
      options: ['label', 'help', 'max', 'info', 'sub']
    }
  };
  if (_includesInstanceProperty(minMaxedTypes).call(minMaxedTypes, type)) {
    Object.assign(structure, {
      min: {
        type: 'integer',
        optional: true,
        default: null
      },
      max: {
        type: 'integer',
        optional: true,
        default: null
      }
    });
  }
  if (_includesInstanceProperty(_context = ['image', 'file']).call(_context, type)) {
    Object.assign(structure, {
      extensions: {
        type: 'text',
        optional: true,
        list: true
      },
      store: {
        // store variables depend on type (s3 needs a region and a bucket)
        type: 'pass',
        optional: true
      },
      allowURL: {
        type: 'boolean',
        optional: true,
        default: false
      },
      allowPath: {
        type: 'boolean',
        optional: true,
        default: false
      },
      imageWithSizeAndVariants: {
        type: 'boolean',
        optional: true,
        default: false
      }
    });
  }
  if (_includesInstanceProperty(optionedTypes).call(optionedTypes, type)) {
    Object.assign(structure, {
      options: {
        list: {
          min: 1
        },
        fields: {
          id: {
            type: 'integer'
          },
          value: {
            type: 'text',
            optional: false
          },
          label: {
            type: labelFieldType,
            optional: false,
            defaultLanguage: defaultLabelLanguage
          },
          info: {
            type: labelFieldType,
            optional: true,
            default: null,
            defaultLanguage: defaultLabelLanguage
          },
          display: {
            type: 'pass',
            default: true
          }
        }
      }
    });
  }
  return structure;
}
//# sourceMappingURL=buildFieldSchema.js.map