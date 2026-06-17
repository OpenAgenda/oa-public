import { Component, createRef } from 'react';
import passValidator from '@openagenda/validators/pass';
import { Accordion } from '@openagenda/react-shared';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import FormSchemaComponent from '../index.js';

import merge from '../iso/merge.js';
import { scrubDefaultValue } from '../iso/fieldOptions.js';
import flattenLabels from '../lib/flatten.js';
import slugFromLabel from './lib/slugFromLabel.js';
import fg from './lib/fieldGroups.js';
import Options from './Options.js';
import ConditionalLogic from './ConditionalLogic.js';
import DefaultValue from './DefaultValue.js';
import unflattenLabels from './lib/unflattenLabels.js';
import restrictLabelLanguages from './lib/restrictLabelLanguages.js';
import optionsValidator from './lib/optionsValidator.js';
import labels from './lib/labels.js';

const getLabel = makeLabelGetter(labels);

const hasValueIn = (field, keys) =>
  keys.some((k) => {
    const v = field?.[k];
    if (v === null || v === undefined || v === '') return false;
    if (typeof v === 'object') return Object.values(v).some((s) => s);
    return true;
  });

const assignConstraintsToFields = (schema, parents) =>
  schema.fields.reduce(
    (carriedSchema, field) => {
      carriedSchema.fields.push({
        ...field,
        constraints: parents ? parents[field.field] : null,
      });
      return carriedSchema;
    },
    { ...schema, fields: [] },
  );

const fieldOrder = (order) => ({
  fields: order.map((f) => ({ field: f, fieldType: 'abstract' })),
});

const AccordionHeader = ({ title, subtitle }) => (
  <div>
    <div>{title}</div>
    <div className="text-muted">{subtitle}</div>
  </div>
);

const accordionDescriptors = ({
  labelLanguages,
  parentsField,
  siblings,
  currentFieldSlug,
  lang,
  defaultOptions,
  optionedType,
}) => {
  const minMax = parentsField
    ? null
    : {
      id: 'minMax',
      labelKey: 'fieldMinMaxSection',
      infoKey: 'fieldMinMaxSectionInfo',
      fieldKeys: ['min', 'max'],
      schema: fg.minMax(),
    };
  const info = {
    id: 'info',
    labelKey: 'fieldInfoSection',
    infoKey: 'fieldInfoSectionInfo',
    fieldKeys: ['info'],
    schema: fg.info({ labelLanguages }),
  };
  const placeholderSub = {
    id: 'placeholderSub',
    labelKey: 'fieldPlaceholderSubSection',
    infoKey: 'fieldPlaceholderSubSectionInfo',
    fieldKeys: ['placeholder', 'sub'],
    schema: fg.placeholderSub({ labelLanguages }),
  };
  const help = {
    id: 'help',
    labelKey: 'fieldHelpSection',
    infoKey: 'fieldHelpSectionInfo',
    fieldKeys: ['help', 'helpLink', 'helpContent'],
    schema: fg.help({ labelLanguages }),
  };
  const conditional = {
    id: 'conditional',
    labelKey: 'fieldConditionalSection',
    infoKey: 'fieldConditionalSectionInfo',
    fieldKeys: ['enableWith', 'optionalWith'],
    schema: fg.conditional({
      siblings: siblings || [],
      currentFieldSlug: currentFieldSlug || null,
      lang,
    }),
  };
  const defaultValue = {
    id: 'defaultValue',
    labelKey: 'fieldDefaultValueSection',
    infoKey: 'fieldDefaultValueSectionInfo',
    fieldKeys: ['default'],
    schema: fg.defaultValue({
      optionsList: defaultOptions || [],
      optionedType,
    }),
  };
  return { minMax, info, placeholderSub, help, conditional, defaultValue };
};

const deriveConditionalValue = (field) => {
  if (field?.enableWith) {
    if (typeof field.enableWith === 'string') {
      return {
        mode: 'enable',
        field: field.enableWith,
        valueMode: 'any',
        value: [],
      };
    }
    return {
      mode: 'enable',
      field: field.enableWith.field,
      valueMode: 'specific',
      value: [].concat(field.enableWith.value ?? []),
    };
  }
  if (field?.optionalWith) {
    if (typeof field.optionalWith === 'string') {
      return {
        mode: 'optional',
        field: field.optionalWith,
        valueMode: 'any',
        value: [],
      };
    }
    return {
      mode: 'optional',
      field: field.optionalWith.field,
      valueMode: 'specific',
      value: [].concat(field.optionalWith.value ?? []),
    };
  }
  return { mode: 'none', field: null, valueMode: 'any', value: [] };
};

const serializeConditional = (conditional) => {
  if (!conditional || conditional.mode === 'none' || !conditional.field) {
    return { enableWith: null, optionalWith: null };
  }
  const targetKey = conditional.mode === 'enable' ? 'enableWith' : 'optionalWith';
  const otherKey = conditional.mode === 'enable' ? 'optionalWith' : 'enableWith';
  if (conditional.valueMode === 'specific' && conditional.value?.length) {
    const values = conditional.value;
    const value = values.length === 1 ? values[0] : values;
    return {
      [targetKey]: { field: conditional.field, value },
      [otherKey]: null,
    };
  }
  return { [targetKey]: conditional.field, [otherKey]: null };
};

const getNeighbours = (slug, siblings) => {
  const f = siblings.find((s) => s.field === slug);
  if (!f) return [];
  const targets = [];
  const collect = (link) => {
    if (!link) return;
    if (typeof link === 'string') targets.push(link);
    else if (link.field) targets.push(link.field);
  };
  collect(f.enableWith);
  collect(f.optionalWith);
  return targets;
};

const detectConditionalCycle = ({ startSlug, currentFieldSlug, siblings }) => {
  if (!startSlug || !currentFieldSlug) return false;
  const visited = new Set();
  const queue = [startSlug];
  while (queue.length) {
    const slug = queue.shift();
    if (visited.has(slug)) continue;
    visited.add(slug);
    if (slug === currentFieldSlug) return true;
    for (const next of getNeighbours(slug, siblings)) {
      if (!visited.has(next)) queue.push(next);
    }
  }
  return false;
};

const OPTIONED_TYPES = ['radio', 'checkbox', 'select', 'multiselect'];

// Effective optioned type/options for the default-value editor: an inherited
// (abstract) field draws its options and type from its parent schema, while an
// own field uses the options currently being edited in the form state.
const resolveOptioned = (type, parentsField, values) => {
  const optionedType = OPTIONED_TYPES.includes(parentsField?.fieldType)
    ? parentsField.fieldType
    : type;
  const options = parentsField
    ? parentsField.options || []
    : values?.options || [];
  return { optionedType, options };
};

const buildSchema = (
  type,
  {
    labelLanguages,
    parentsField,
    customFieldConfigurationSchemas,
    siblings,
    currentFieldSlug,
    lang,
    values,
  },
) => {
  if (type === 'section') {
    return { main: fg.section({ labelLanguages }), accordions: [] };
  }

  if (
    customFieldConfigurationSchemas
    && customFieldConfigurationSchemas[type]
  ) {
    const customSchema = customFieldConfigurationSchemas[type];
    return {
      main: merge(
        customSchema.fields.some((f) => f.field === 'label')
          ? fg.labels({ labelLanguages })
          : null,
        customSchema.fields.some((f) => f.field === 'optional')
          ? fg.optional()
          : null,
        customSchema,
      ),
      accordions: [],
    };
  }

  const optionalGroup = !parentsField || (parentsField?.optional ?? true) ? fg.optional() : null;
  const { optionedType, options: defaultOptions } = resolveOptioned(
    type,
    parentsField,
    values,
  );
  const acc = accordionDescriptors({
    labelLanguages,
    parentsField,
    siblings,
    currentFieldSlug,
    lang,
    defaultOptions,
    optionedType,
  });

  if (type === 'boolean') {
    return {
      main: merge(
        fg.labelOnly({ labelLanguages }),
        optionalGroup,
        fg.allowFalse(),
        fieldOrder(['label', 'optional', 'allowFalse']),
      ),
      accordions: [acc.info, acc.placeholderSub, acc.help, acc.conditional],
    };
  }

  if (
    ['text', 'textarea', 'markdown', 'link', 'email', 'integer'].includes(type)
  ) {
    return {
      main: merge(
        fg.labelOnly({ labelLanguages }),
        optionalGroup,
        fieldOrder(['label', 'optional']),
      ),
      accordions: [
        acc.minMax,
        acc.info,
        acc.placeholderSub,
        acc.help,
        acc.conditional,
      ].filter(Boolean),
    };
  }

  if (
    OPTIONED_TYPES.includes(type)
    || OPTIONED_TYPES.includes(parentsField?.fieldType)
  ) {
    const optionsGroup = parentsField ? null : fg.options({ labelLanguages });
    return {
      main: merge(
        fg.labelOnly({ labelLanguages }),
        optionalGroup,
        optionsGroup,
        fieldOrder(['label', 'optional', 'options']),
      ),
      accordions: [
        acc.placeholderSub,
        acc.defaultValue,
        acc.help,
        acc.conditional,
      ],
    };
  }

  if (['file', 'image'].includes(type)) {
    return {
      main: merge(
        fg.labelOnly({ labelLanguages }),
        optionalGroup,
        fieldOrder(['label', 'optional']),
      ),
      accordions: [acc.info, acc.placeholderSub, acc.help, acc.conditional],
    };
  }

  return { main: fg.labels({ labelLanguages }), accordions: [] };
};

export default class FieldForm extends Component {
  constructor(props) {
    super(props);

    const { labelLanguages, field, lang, initFieldType, siblings } = props;

    const fieldType = field?.fieldType ?? field?.type ?? initFieldType;
    const currentFieldSlug = field?.field ?? null;
    const { accordions } = buildSchema(fieldType, {
      labelLanguages,
      parentsField: props.parentsField,
      customFieldConfigurationSchemas: props.customFieldConfigurationSchemas,
      siblings,
      currentFieldSlug,
      lang,
    });

    const expanded = {};
    accordions.forEach((a) => {
      expanded[a.id] = hasValueIn(field, a.fieldKeys);
    });

    const baseValues = labelLanguages.length
      ? unflattenLabels(field, labelLanguages)
      : flattenLabels(field, lang);

    this.state = {
      values: { ...baseValues, conditional: deriveConditionalValue(field) },
      errors: [],
      expanded,
    };

    this.mainFormRef = createRef();
    this.accordionRefs = {};
    accordions.forEach((a) => {
      this.accordionRefs[a.id] = createRef();
    });

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.toggleAccordion = this.toggleAccordion.bind(this);
  }

  onChange({ values, errors }) {
    this.setState({ errors, values });
  }

  onSubmit() {
    const {
      lang,
      field,
      initFieldType,
      labelLanguages,
      onSubmit,
      parentsField,
      customFieldConfigurationSchemas,
      siblings,
      isOwn = true,
    } = this.props;

    const { values, errors: stateErrors } = this.state;
    const fieldType = field?.fieldType ?? initFieldType;
    const currentFieldSlug = field?.field
      ?? (fieldType !== 'section' ? slugFromLabel(values?.label, lang) : null);
    const { accordions } = buildSchema(fieldType, {
      labelLanguages,
      parentsField,
      customFieldConfigurationSchemas,
      siblings,
      currentFieldSlug,
      lang,
      values,
    });

    const mainResult = this.mainFormRef.current
      ? this.mainFormRef.current.sanitize(values)
      : { errors: [] };
    const errorsByGroup = {};
    let collected = mainResult.errors || [];

    accordions.forEach((a) => {
      const ref = this.accordionRefs[a.id];
      if (ref?.current) {
        const result = ref.current.sanitize(values);
        const errs = result.errors || [];
        if (errs.length) errorsByGroup[a.id] = errs;
        collected = collected.concat(errs);
      }
    });

    const conditional = values?.conditional;
    const conditionalEditable = isOwn && accordions.some((a) => a.id === 'conditional');
    if (
      conditionalEditable
      && conditional?.mode
      && conditional.mode !== 'none'
    ) {
      const condErrors = [];
      if (!conditional.field) {
        condErrors.push({
          field: 'conditional',
          code: 'missingField',
          label: getLabel('fieldConditionalMissingFieldError', lang),
          fieldLabel: getLabel('fieldConditionalSection', lang),
        });
      } else if (conditional.field === currentFieldSlug) {
        condErrors.push({
          field: 'conditional',
          code: 'selfReference',
          label: getLabel('fieldConditionalSelfReferenceError', lang),
          fieldLabel: getLabel('fieldConditionalSection', lang),
        });
      } else if (
        detectConditionalCycle({
          startSlug: conditional.field,
          currentFieldSlug,
          siblings: siblings || [],
        })
      ) {
        condErrors.push({
          field: 'conditional',
          code: 'cycle',
          label: getLabel('fieldConditionalCycleError', lang),
          fieldLabel: getLabel('fieldConditionalSection', lang),
        });
      } else if (
        conditional.valueMode === 'specific'
        && !(conditional.value && conditional.value.length)
      ) {
        condErrors.push({
          field: 'conditional',
          code: 'missingValue',
          label: getLabel('fieldConditionalMissingValueError', lang),
          fieldLabel: getLabel('fieldConditionalSection', lang),
        });
      }
      if (condErrors.length) {
        errorsByGroup.conditional = condErrors;
        collected = collected.concat(condErrors);
      }
    }

    if (collected.length) {
      return this.setState((prev) => {
        const expanded = { ...prev.expanded };
        Object.entries(errorsByGroup).forEach(([id, errs]) => {
          if (errs.length) expanded[id] = true;
        });
        return { errors: collected, expanded };
      });
    }

    if ((stateErrors || []).length) return;

    const item = restrictLabelLanguages(values, labelLanguages);

    if (fieldType === 'section') {
      item.type = 'section';
      item.slug = slugFromLabel(values?.label, lang);
    } else {
      item.fieldType = fieldType;
      item.field = field?.field || slugFromLabel(values?.label, lang);
    }

    if (conditionalEditable) {
      const serialized = serializeConditional(conditional);
      item.enableWith = serialized.enableWith;
      item.optionalWith = serialized.optionalWith;
    }
    delete item.conditional;

    if (
      OPTIONED_TYPES.includes(fieldType)
      || OPTIONED_TYPES.includes(parentsField?.fieldType)
    ) {
      const { options: effectiveOptions } = resolveOptioned(
        fieldType,
        parentsField,
        values,
      );
      item.default = scrubDefaultValue(item.default, effectiveOptions);
    }

    onSubmit(item);
  }

  toggleAccordion(id) {
    this.setState((s) => ({
      expanded: { ...s.expanded, [id]: !s.expanded[id] },
    }));
  }

  render() {
    const {
      labelLanguages,
      lang,
      field: propsField,
      initFieldType,
      actionComponent,
      customFieldConfigurationSchemas,
      components,
      parentsField,
      enable = true,
      siblings,
      isOwn = true,
    } = this.props;
    const { values, errors, expanded } = this.state;

    const field = propsField ?? {
      fieldType: initFieldType,
    };

    const fieldType = field.fieldType ?? field.type;
    const currentFieldSlug = field.field ?? null;

    const { main, accordions } = buildSchema(fieldType, {
      labelLanguages,
      parentsField,
      customFieldConfigurationSchemas,
      siblings,
      currentFieldSlug,
      lang,
      values,
    });

    const mainSchema = assignConstraintsToFields(main, parentsField);

    if (!enable) {
      mainSchema.fields.forEach((f) => {
        f.enable = false;
      });
    }

    const customs = components
      ? Object.keys(components).reduce(
        (prev, curr) => ({ ...prev, [curr]: passValidator }),
        {},
      )
      : null;
    mainSchema.custom = {
      ...customs,
      options: optionsValidator,
      conditional: passValidator,
      defaultValue: passValidator,
    };

    const accordionSchemas = accordions.map((a) => {
      const s = assignConstraintsToFields(a.schema, parentsField);
      if (!enable || (a.id === 'conditional' && !isOwn)) {
        s.fields.forEach((f) => {
          f.enable = false;
        });
      }
      s.custom = {
        ...s.custom,
        conditional: passValidator,
        defaultValue: passValidator,
      };
      return { ...a, schema: s };
    });

    const noBottomAction = [{ position: 'bottom', Component: () => null }];

    const componentsMap = {
      options: Options,
      conditional: ConditionalLogic,
      defaultValue: DefaultValue,
      ...components,
    };

    return (
      <div className="margin-top-sm">
        <FormSchemaComponent
          ref={this.mainFormRef}
          stateless
          requireLabels={false}
          values={values}
          errors={errors}
          components={componentsMap}
          onChange={this.onChange}
          lang={lang}
          schema={mainSchema}
          actionComponents={noBottomAction}
        />
        {accordionSchemas.map((a) => {
          const sectionDisabled = a.id === 'conditional' && !isOwn;
          if (sectionDisabled) {
            return (
              <div
                key={a.id}
                style={{ marginLeft: -8, marginRight: -8 }}
                title={getLabel('fieldConditionalSectionDisabledReason', lang)}
              >
                <div className="accordion">
                  <div className="accordion-item" style={{ opacity: 0.55 }}>
                    <button
                      type="button"
                      className="button"
                      disabled
                      aria-disabled="true"
                      style={{
                        cursor: 'not-allowed',
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      <div className="accordion-head">
                        <div className="head-item">
                          <AccordionHeader
                            title={getLabel(a.labelKey, lang)}
                            subtitle={getLabel(a.infoKey, lang)}
                          />
                        </div>
                        <i
                          className="control fa fa-chevron-down down"
                          aria-hidden="true"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={a.id} style={{ marginLeft: -8, marginRight: -8 }}>
              <Accordion
                active={!!expanded[a.id]}
                onToggle={() => this.toggleAccordion(a.id)}
                head={(
                  <AccordionHeader
                    title={getLabel(a.labelKey, lang)}
                    subtitle={getLabel(a.infoKey, lang)}
                  />
                )}
                content={(
                  <div className="margin-top-lg">
                    <FormSchemaComponent
                      ref={this.accordionRefs[a.id]}
                      stateless
                      requireLabels={false}
                      values={values}
                      errors={errors}
                      components={componentsMap}
                      onChange={this.onChange}
                      lang={lang}
                      schema={a.schema}
                      actionComponents={noBottomAction}
                    />
                  </div>
                )}
              />
            </div>
          );
        })}
        <div
          className="margin-top-md"
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#fff',
            paddingTop: '0.75em',
            paddingBottom: '0.75em',
            borderTop: '1px solid #eee',
            zIndex: 1,
          }}
        >
          {actionComponent({ onSubmit: this.onSubmit })}
        </div>
      </div>
    );
  }
}
