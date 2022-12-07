import classNames from 'classnames';
import { Component } from 'react';
import Accordion from '@openagenda/react-shared/lib/components/Accordion';
import { getLocaleValue } from '@openagenda/intl';

import getFieldTypeLabel from '../lib/getFieldTypeLabel';

import {
  isFieldLinked,
  isFieldEditable,
  isFieldMultilingual,
  getLabel,
  getDefaultValueLabel,
  getFieldTypeIcon,
} from './utils';

import {
  getSummary as getLinkedFieldSummaryLabel,
  getDetailed as getLinkedFieldDetailedLabel,
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

export default class FieldPreview extends Component {
  getInfoLabel() {
    const {
      editable,
      lang,
      disabled,
    } = this.props;
    if (!editable) {
      return getLabel('uneditableFieldInfo', lang);
    }
    if (disabled) {
      return null;
    }
    return getLabel('editFieldInfo', lang);
  }

  isFieldOptional() {
    const {
      field,
    } = this.props;

    return field?.optional ?? true;
  }

  isFieldDisplayed() {
    const {
      field,
    } = this.props;

    return field?.display ?? true;
  }

  renderToggleHidden() {
    const {
      field,
      onShow,
      onHide,
      lang,
    } = this.props;
    return (
      this.isFieldDisplayed() ? (
        <button
          type="button"
          onClick={() => onHide()}
          className="btn btn-link"
        >
          {getLabel('hideField', lang)}
        </button>
      ) : (
        <button
          type="button"
          name={`show-${field.field}`}
          className="btn btn-link"
          onClick={() => onShow()}
        >
          {getLabel('showField', lang)}
        </button>
      )
    );
  }

  renderToggleRemove() {
    const {
      isDisabled,
      onRemove,
      lang,
    } = this.props;
    return (
      this.isFieldDisplayed() ? (
        <button
          type="button"
          onClick={() => (isDisabled ? null : onRemove())}
          className="btn btn-link"
        >
          <span className="text-danger">{getLabel('removeField', lang)}</span>
        </button>
      ) : null
    );
  }

  renderDisplayed() {
    const {
      field,
      lang,
      disabled,
      schemaInfo,
      ordering,
      editableExtensions,
      isOwn,
      onEdit,
      onAccordionToggle,
      active,
      schema,
    } = this.props;

    const editable = isFieldEditable(field, { isOwn, editableExtensions });
    const isDisabled = !editable || disabled;

    const {
      has: hasIcon,
      className: iconClassName,
    } = getFieldTypeIcon(field);

    return (
      <div
        className={classNames({
          'field-preview': true,
        })}
      >
        <Accordion
          head={(
            <>
              <label
                className="margin-right-xs margin-top-xs"
                htmlFor={this.isFieldDisplayed() ? `edit-${field.field}` : `show-${field.field}`}
              >
                {getLocaleValue(field.label, lang)}
              </label>
              {this.isFieldOptional() ? null
                : (
                  <span className="form-tooltip-icon icon-hide margin-right-xs">
                    <i className="obligatoire" />
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"> </div>
                      <div className="tooltip-inner">{getLabel('requiredField', lang)}</div>
                    </div>
                  </span>
                )}
              {this.isFieldDisplayed() ? null
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
          )}
          content={(
            <>
              <div className="margin-top-xs">
                {this.isFieldOptional() ? null
                  : (
                    <span className="form-icon margin-right-sm">
                      <i className="obligatoire" />
                      <span className="optional">{getLabel('requiredField', lang)}</span>
                    </span>
                  )}
                {this.isFieldDisplayed() ? null
                  : (
                    <span className="form-icon margin-right-sm">
                      <i className="hidden-field" />
                      <span className="optional">{getLabel('hiddenField', lang)}</span>
                    </span>
                  )}
                {field.fieldType ? (
                  <span className="form-icon margin-right-sm">
                    {hasIcon ? <i className={iconClassName} /> : null}
                    <span className="fieldtype">{getFieldTypeLabel(field, lang)}</span>
                  </span>
                ) : null }
                {isFieldMultilingual(field) ? (
                  <span className="form-icon margin-right-sm">
                    <i className="languages" />
                    <span className="multilingual-label">{getLabel('isMultilingual', lang)}</span>
                  </span>
                ) : null}
                {isFieldLinked(field) ? (
                  <>
                    <span className="form-tooltip-icon icon-hide form-icon">
                      <i className="linked" />
                      <div className="tooltip right" role="tooltip">
                        <div className="tooltip-arrow"> </div>
                        <div className="tooltip-inner">{getLinkedFieldDetailedLabel({ field, lang, schema })}</div>
                      </div>
                    </span>
                    <span className="linked-label">{getLinkedFieldSummaryLabel({ field, lang, schema })}</span>
                  </>
                ) : null}
              </div>
              {field.field ? (
                <div className="margin-top-xs" title={getLabel('jsonKey', lang)}>{getLabel('jsonKey', lang)}: {field.field}</div>
              ) : null }
              {'default' in field ? (
                <div className="margin-top-xs" title={getLabel('defaultValue', lang)}>{getLabel('defaultValue', lang)} : {getDefaultValueLabel(field, lang)}</div>
              ) : null }
              {field.max ? (
                <div className="margin-top-xs" title={getLabel('maxLength', lang)}>{getLabel('maxLength', lang)}: {field.max}</div>
              ) : null }
              {ordering ? (
                <ul className="form-item-actions list-inline">
                  <li><span className="btn btn-link">{getLabel('orderField', lang)}</span></li>
                </ul>
              ) : (
                <div className="form-item-actions padding-h-xs">
                  {this.isFieldDisplayed() ? (
                    <button
                      type="button"
                      name={`edit-${field.field}`}
                      title={this.getInfoLabel()}
                      onClick={() => (!isDisabled ? onEdit() : null)}
                      className="btn btn-link"
                      disabled={!editable || disabled}
                    >
                      {getLabel('editField', lang)}
                    </button>
                  ) : null}
                  {this.isFieldOptional() ? this.renderToggleHidden() : null}
                  {isOwn ? this.renderToggleRemove() : null }
                </div>
              )}
            </>
          )}
          onToggle={onAccordionToggle}
          active={active}
          schema={schema}
        />
      </div>
    );
  }

  render() {
    return this.renderDisplayed();
  }
}
