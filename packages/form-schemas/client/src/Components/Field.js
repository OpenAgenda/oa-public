import classNames from 'classnames';
import debug from 'debug';

import flattenFieldLabels from '../lib/flatten.js';
import isFieldEnabled from '../lib/isFieldEnabled.js';
import isFieldOptional from '../lib/isFieldOptional.js';
import hasHelp from '../lib/hasHelp.js';
import FieldCounter from './FieldCounter.js';
import Help from './Help.js';
import Info from './Info.js';
import Sub from './Sub.js';
import MultilingualField from './Multilingual.js';
import TextField from './TextField.js';
import HTMLField from './HTMLField.js';
import MarkdownField from './MarkdownField.js';
import SlateField from './SlateField.js';
import RadioField from './RadioField.js';
import SingleSelectField from './SingleSelectField.js';
import MultiSelectField from './MultiSelectField.js';
import CheckboxField from './CheckboxField.js';
import BooleanField from './BooleanField.js';
import DateField from './DateField.js';
import FileField from './FileField.js';
import ImageField from './ImageField.js';

const FieldComponents = {
  text: TextField,
  integer: TextField,
  number: TextField,
  textarea: TextField,
  link: TextField,
  email: TextField,
  phone: TextField,
  html: HTMLField,
  markdown: MarkdownField,
  slate: SlateField,
  radio: RadioField,
  select: SingleSelectField,
  multiselect: MultiSelectField,
  checkbox: CheckboxField,
  boolean: BooleanField,
  date: DateField,
  file: FileField,
  image: ImageField,
};

const log = debug('Field');

const decoratedByFieldComponent = (field, key) => {
  if (['boolean'].includes(field.fieldType)) return true;
  if (field.selfHandled.length === 0) return false;
  return field.selfHandled.includes(key);
};

function getFieldComponent(props) {
  const {
    field: { fieldType, field },
    customComponents = {},
  } = props;

  const CustomComponent = customComponents[fieldType];

  if (CustomComponent) {
    return CustomComponent;
  }

  if (FieldComponents[fieldType]) {
    return FieldComponents[fieldType];
  }

  throw new Error(
    `Field ${field} type has no associated component: ${fieldType}`,
  );
}

export default function Field(props) {
  const {
    field: schemaField,
    disabled,
    value,
    onChange,
    error,
    labels,
    lang,
    className,
    relatedValues,
    role,
  } = props;

  const field = flattenFieldLabels(schemaField, lang);
  const isMultilingual = Array.isArray(field.languages);

  const hasMaxCounter = field.max
    && !isMultilingual
    && !['integer', 'number'].includes(field.fieldType);

  // field is decorated with labels

  const FieldComponent = getFieldComponent(props);

  const isEnabled = isFieldEnabled(field, relatedValues.enable, disabled);
  const isOptional = isFieldOptional(field, relatedValues.optional);
  log(
    'field %s is %s and %s',
    field.field,
    isOptional ? 'optional' : 'required',
    isEnabled ? 'enabled' : 'disabled',
  );

  const fieldComponentsProps = {
    enabled: isEnabled,
    lang,
    field,
    value,
    error,
    onChange,
    relatedValues,
    labels,
    userRole: role,
  };

  return (
    <div
      className={classNames({
        [className]: true,
        disabled: !isEnabled,
        'has-error': !!error,
        'multilingual-input-field': isMultilingual,
      })}
      key={field.field}
    >
      {!decoratedByFieldComponent(field, 'label') && field.label ? (
        <label
          htmlFor={field.field}
          className={classNames({
            'control-label': true,
            'margin-right-xs': !isOptional || hasHelp(field),
          })}
        >
          {field.label}
        </label>
      ) : null}
      {!decoratedByFieldComponent(field, 'label') && !isOptional ? (
        <span
          className={classNames({
            'margin-right-xs': hasHelp(field),
            error: !!error,
          })}
        >
          {`(${labels.required})`}
        </span>
      )
        : ''}
      {!decoratedByFieldComponent(field, 'help') && hasHelp(field) ? (
        <Help
          id={`help-${field.field}`}
          label={field.help}
          lang={lang}
          link={field.helpLink}
          content={field.helpContent}
        />
      ) : null}
      {!decoratedByFieldComponent(field, 'info') ? (
        <Info value={field.info} />
      ) : null}
      {isMultilingual ? (
        <MultilingualField
          {...fieldComponentsProps}
          FieldComponent={FieldComponent}
        />
      ) : (
        <FieldComponent {...fieldComponentsProps} />
      )}
      {hasMaxCounter ? <FieldCounter value={value} max={field.max} /> : null}
      {!isMultilingual && !decoratedByFieldComponent(field, 'sub') ? (
        <Sub label={field.sub} error={error} />
      ) : null}
    </div>
  );
}
