import { getLocaleValue } from '@openagenda/intl';

import getFieldTypeLabel from '../lib/getFieldTypeLabel';

import {
  getLabel,
  isFieldOptional,
  isFieldDisplayed,
  isFieldMultilingual,
  isFieldLinked,
  getFieldTypeIcon,
  isAccessUnknown,
  getFieldAccess,
} from './utils';

import {
  getSummary as getLinkedFieldSummaryLabel,
} from './linkedFieldLabels';

const MAX_DISPLAYED_OPTIONS = 4;

const renderSchemaInfo = (schemaInfo, lang) => {
  if (!schemaInfo) {
    return null;
  }
  return (
    <div
      title={getLocaleValue(schemaInfo.detail, lang)}
      className="margin-top-xs"
    >{getLocaleValue(schemaInfo.label, lang)}
    </div>
  );
};

const renderOptionsInfo = (options, lang) => {
  if (!options) {
    return null;
  }
  if (options.length >= MAX_DISPLAYED_OPTIONS) {
    return (
      <div className="margin-top-xs text-muted">
        {options?.slice(0, MAX_DISPLAYED_OPTIONS).map((option, index) => <span key={getLocaleValue(option.label, lang)}>{getLocaleValue(option.label, lang)}{index <= MAX_DISPLAYED_OPTIONS ? ', ' : ''}</span>)}
        <span> + {options.length - MAX_DISPLAYED_OPTIONS} {getLabel('moreOptions', lang)}</span>
      </div>
    );
  }
  return (
    <div className="margin-top-xs text-muted">
      {options?.map((option, index) => <span key={getLocaleValue(option.label, lang)}>{getLocaleValue(option.label, lang)}{index < options.length - 1 ? ', ' : ''}</span>)}
    </div>
  );
};

const getLabelPrefix = (field, lang) => {
  if (field.type !== 'section') {
    return '';
  }

  if (!field.label) {
    return getLabel('section', lang);
  }

  return `${getLabel('section', lang)}: `;
};

export default function Head(props) {
  const {
    field,
    lang,
    schema,
    schemaInfo,
  } = props;

  const {
    has: hasIcon,
    className: iconClassName,
  } = getFieldTypeIcon(field);

  return (
    <>
      <label
        className="margin-right-xs margin-top-xs"
        htmlFor={isFieldDisplayed(field) ? `edit-${field.field}` : `show-${field.field}`}
      >
        {getLabelPrefix(field, lang)}{getLocaleValue(field.label, lang)}
      </label>
      {isAccessUnknown(field) ? null
        : (
          <span className="form-tooltip-icon icon-hide margin-right-xs">
            {hasIcon ? <i className="access" /> : null }
            <div className="tooltip right" role="tooltip">
              <div className="tooltip-arrow"> </div>
              <div className="tooltip-inner">{getFieldAccess(field, lang)}</div>
            </div>
          </span>
        )}
      {isFieldOptional(field) ? null
        : (
          <span className="form-tooltip-icon icon-hide margin-right-xs">
            <i className="obligatoire" />
            <div className="tooltip right" role="tooltip">
              <div className="tooltip-arrow"> </div>
              <div className="tooltip-inner">{getLabel('requiredField', lang)}</div>
            </div>
          </span>
        )}
      {isFieldDisplayed(field) ? null
        : (
          <span className="form-tooltip-icon icon-hide margin-right-xs">
            <i className="hidden-field" />
            <div className="tooltip right" role="tooltip">
              <div className="tooltip-arrow"> </div>
              <div className="tooltip-inner">{getLabel('hiddenField', lang)}</div>
            </div>
          </span>
        )}
      {field.fieldType ? (
        <span className="form-tooltip-icon icon-hide margin-right-xs">
          {hasIcon ? <i className={iconClassName} /> : null }
          <div className="tooltip right" role="tooltip">
            <div className="tooltip-arrow"> </div>
            <div className="tooltip-inner">{getFieldTypeLabel(field, lang)}</div>
          </div>
        </span>
      ) : null}
      {isFieldMultilingual(field) ? (
        <span className="form-tooltip-icon icon-hide margin-right-xs">
          <i className="languages" />
          <div className="tooltip right" role="tooltip">
            <div className="tooltip-arrow"> </div>
            <div className="tooltip-inner">{getLabel('isMultilingual', lang)}</div>
          </div>
        </span>
      ) : null}
      {isFieldLinked(field) ? (
        <span className="form-tooltip-icon icon-hide margin-right-xs">
          <i className="linked" />
          <div className="tooltip right" role="tooltip">
            <div className="tooltip-arrow"> </div>
            <div className="tooltip-inner">
              {getLinkedFieldSummaryLabel({ field, lang, schema })}
            </div>
          </div>
        </span>
      ) : null}
      {field.purpose ? (
        <div className="margin-top-xs">{getLocaleValue(field.purpose, lang)}</div>
      ) : renderSchemaInfo(schemaInfo, lang)}
      {renderOptionsInfo(field.options, lang)}
    </>
  );
}
