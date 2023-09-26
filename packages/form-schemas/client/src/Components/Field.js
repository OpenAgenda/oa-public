import classNames from 'classnames';
import debug from 'debug';

import flattenFieldLabels from '../lib/flatten';
import isFieldEnabled from '../lib/isFieldEnabled';
import isFieldOptional from '../lib/isFieldOptional';
import hasHelp from '../lib/hasHelp';
import FieldCounter from './FieldCounter';
import Help from './Help';
import Info from './Info';
import Sub from './Sub';
import MultilingualField from './Multilingual';
import TextField from './TextField';
import HTMLField from './HTMLField';
import MarkdownField from './MarkdownField';
import SlateField from './SlateField';
import RadioField from './RadioField';
import SingleSelectField from './SingleSelectField';
import MultiSelectField from './MultiSelectField';
import CheckboxField from './CheckboxField';
import BooleanField from './BooleanField';
import DateField from './DateField';
import FileField from './FileField';
import ImageField from './ImageField';

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
  if (field.field === 'location' && key === 'sub' && field.disableChange) return true;
  if (['boolean'].includes(field.fieldType)) return true;
  if (field.selfHandled.length === 0) return false;
  return field.selfHandled.includes(key);
};

function getFieldComponent(props) {
  const {
    field: {
      fieldType,
      field,
    },
    customComponents = {},
  } = props;

  const CustomComponent = customComponents[fieldType];

  if (CustomComponent) {
    return CustomComponent;
  }

  if (FieldComponents[fieldType]) {
    return FieldComponents[fieldType];
  }

  throw new Error(`Field ${field} type has no associated component: ${fieldType}`);
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
      ) : ''}
      {!decoratedByFieldComponent(field, 'help') && hasHelp(field) ? (
        <Help
          id={`help-${field.field}`}
          label={field.help}
          lang={lang}
          link={field.helpLink}
          content={field.helpContent}
        />
      ) : null}
      {!decoratedByFieldComponent(field, 'info') ? <Info value={field.info} /> : null }
      {isMultilingual ? (<MultilingualField {...fieldComponentsProps} FieldComponent={FieldComponent} />) : (<FieldComponent {...fieldComponentsProps} />)}
      {hasMaxCounter ? <FieldCounter value={value} max={field.max} /> : null }
      {!isMultilingual && !decoratedByFieldComponent(field, 'sub') ? <Sub label={field.sub} error={error} /> : null}
    </div>
  );
}
