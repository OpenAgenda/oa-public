import { Component, createRef } from 'react';
import passValidator from '@openagenda/validators/pass';
import { Accordion } from '@openagenda/react-shared';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import FormSchemaComponent from '../index.js';

import merge from '../iso/merge.js';
import flattenLabels from '../lib/flatten.js';
import slugFromLabel from './lib/slugFromLabel.js';
import fg from './lib/fieldGroups.js';
import Options from './Options.js';
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

const accordionDescriptors = ({ labelLanguages, parentsField }) => {
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
  return { minMax, info, placeholderSub, help };
};

const AccordionHeader = ({ title, subtitle }) => (
  <div>
    <div>{title}</div>
    <div className="text-muted">{subtitle}</div>
  </div>
);

const buildSchema = (
  type,
  { labelLanguages, parentsField, customFieldConfigurationSchemas },
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
  const acc = accordionDescriptors({ labelLanguages, parentsField });

  if (type === 'boolean') {
    return {
      main: merge(
        fg.labelOnly({ labelLanguages }),
        optionalGroup,
        fg.allowFalse(),
        fieldOrder(['label', 'optional', 'allowFalse']),
      ),
      accordions: [acc.info, acc.placeholderSub, acc.help],
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
      accordions: [acc.minMax, acc.info, acc.placeholderSub, acc.help].filter(
        Boolean,
      ),
    };
  }

  if (['radio', 'checkbox', 'select', 'multiselect'].includes(type)) {
    const optionsGroup = parentsField ? null : fg.options({ labelLanguages });
    return {
      main: merge(
        fg.labelOnly({ labelLanguages }),
        optionalGroup,
        optionsGroup,
        fieldOrder(['label', 'optional', 'options']),
      ),
      accordions: [acc.placeholderSub, acc.help],
    };
  }

  if (['file', 'image'].includes(type)) {
    return {
      main: merge(
        fg.labelOnly({ labelLanguages }),
        optionalGroup,
        fieldOrder(['label', 'optional']),
      ),
      accordions: [acc.info, acc.placeholderSub, acc.help],
    };
  }

  return { main: fg.labels({ labelLanguages }), accordions: [] };
};

export default class FieldForm extends Component {
  constructor(props) {
    super(props);

    const { labelLanguages, field, lang, initFieldType } = props;

    const fieldType = field?.fieldType ?? field?.type ?? initFieldType;
    const { accordions } = buildSchema(fieldType, {
      labelLanguages,
      parentsField: props.parentsField,
      customFieldConfigurationSchemas: props.customFieldConfigurationSchemas,
    });

    const expanded = {};
    accordions.forEach((a) => {
      expanded[a.id] = hasValueIn(field, a.fieldKeys);
    });

    this.state = {
      values: labelLanguages.length
        ? unflattenLabels(field, labelLanguages)
        : flattenLabels(field, lang),
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
    } = this.props;

    const { values, errors: stateErrors } = this.state;
    const fieldType = field?.fieldType ?? initFieldType;
    const { accordions } = buildSchema(fieldType, {
      labelLanguages,
      parentsField,
      customFieldConfigurationSchemas,
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
    } = this.props;
    const { values, errors, expanded } = this.state;

    const field = propsField ?? {
      fieldType: initFieldType,
    };

    const fieldType = field.fieldType ?? field.type;

    const { main, accordions } = buildSchema(fieldType, {
      labelLanguages,
      parentsField,
      customFieldConfigurationSchemas,
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
    };

    const accordionSchemas = accordions.map((a) => {
      const s = assignConstraintsToFields(a.schema, parentsField);
      if (!enable) {
        s.fields.forEach((f) => {
          f.enable = false;
        });
      }
      return { ...a, schema: s };
    });

    const noBottomAction = [{ position: 'bottom', Component: () => null }];

    return (
      <div className="margin-top-sm">
        <FormSchemaComponent
          ref={this.mainFormRef}
          stateless
          requireLabels={false}
          values={values}
          errors={errors}
          components={{
            options: Options,
            ...components,
          }}
          onChange={this.onChange}
          lang={lang}
          schema={mainSchema}
          actionComponents={noBottomAction}
        />
        {accordionSchemas.map((a) => (
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
                    onChange={this.onChange}
                    lang={lang}
                    schema={a.schema}
                    actionComponents={noBottomAction}
                  />
                </div>
              )}
            />
          </div>
        ))}
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
