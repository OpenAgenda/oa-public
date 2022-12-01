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
} from './utils';

import {
  getSummary as getLinkedFieldSummaryLabel,
  getDetailed as getLinkedFieldDetailedLabel,
} from './linkedFieldLabels';

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
  if (options.length >= 4) {
    return (
      <div className="margin-top-xs text-muted">
        {options?.slice(0, 4).map(option => <span key={getLocaleValue(option.label, lang)}>{getLocaleValue(option.label, lang)},</span>)}
        <span> + {options.length - 4} {getLabel('moreOptions', lang)}</span>
      </div>
    );
  }
  return (
    <div className="margin-top-xs text-muted">
      {options?.map(option => <span key={getLocaleValue(option.label, lang)}>{getLocaleValue(option.label, lang)},</span>)}
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
      onHide,
      onRemove,
      onAccordionToggle,
      active,
      schema,
    } = this.props;

    const editable = isFieldEditable(field, { isOwn, editableExtensions });
    const isDisabled = !editable || disabled;

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
                className="margin-right-xs margin-right-xs"
                htmlFor={`edit-${field.field}`}
              >
                {getLocaleValue(field.label, lang)}
              </label>
              {this.isFieldOptional() ? null
                : (
                  <span className="form-tooltip-icon icon-hide margin-right-xs">
                    <i className="obligatoire"> </i>
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"> </div>
                      <div className="tooltip-inner">{getLabel('requiredField', lang)}</div>
                    </div>
                  </span>
                )}
              {field.fieldType ? (
                <span className="form-tooltip-icon icon-hide margin-right-xs">
                  <i className={field.fieldType}> </i>
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow"> </div>
                    <div className="tooltip-inner">{getFieldTypeLabel(field, lang)}</div>
                  </div>
                </span>
              ) : null}
              {isFieldMultilingual(field) ? (
                <span className="form-tooltip-icon icon-hide margin-right-xs">
                  <i className="multilingual fa fa-globe"> </i>
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow"> </div>
                    <div className="tooltip-inner">{getLabel('isMultilingual', lang)}</div>
                  </div>
                </span>
              ) : null}
              {isFieldLinked(field) ? (
                <span className="form-tooltip-icon icon-hide">
                  <i className="linked"> </i>
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
                      <i className="obligatoire"> </i>
                      <span className="optional">{getLabel('requiredField', lang)}</span>
                    </span>
                  )}
                {field.fieldType ? (
                  <span className="form-icon margin-right-sm">
                    <i className={field.fieldType}> </i>
                    <span className="fieldtype">{getFieldTypeLabel(field, lang)}</span>
                  </span>
                ) : null }
                {isFieldMultilingual(field) ? (
                  <span className="form-icon margin-right-sm">
                    <i className="multilingual fa fa-globe"> </i>
                    <span className="multilingual-label">{getLabel('isMultilingual', lang)}</span>
                  </span>
                ) : null}
                {isFieldLinked(field) ? (
                  <>
                    <span className="form-tooltip-icon icon-hide form-icon">
                      <i className="linked"> </i>
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
                <div className="margin-top-xs" title="Code du champ">{getLabel('jsonKey', lang)}: {field.field}</div>
              ) : null }
              {'default' in field ? (
                <div className="margin-top-xs" title="Valeur par défaut">{getLabel('defaultValue', lang)}: {String(getDefaultValueLabel(field, lang))}</div>
              ) : null }
              {field.max ? (
                <div className="margin-top-xs" title="Longueur du champ">{getLabel('maxLength', lang)}: {field.max}</div>
              ) : null }
              {ordering ? (
                <ul className="form-item-actions list-inline">
                  <li><span className="btn btn-link">{getLabel('orderField', lang)}</span></li>
                </ul>
              ) : (
                <div className="form-item-actions padding-h-xs">
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
                  {this.isFieldOptional() ? (
                    <button
                      type="button"
                      onClick={() => onHide()}
                      className="btn btn-link"
                    >
                      {getLabel('hideField', lang)}
                    </button>
                  ) : null}
                  {isOwn ? (
                    <button
                      type="button"
                      onClick={() => (isDisabled ? null : onRemove())}
                      className="btn btn-link"
                    >
                      <span className="text-danger">{getLabel('removeField', lang)}</span>
                    </button>
                  ) : null}
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

  renderHidden() {
    const {
      field,
      lang,
      schemaInfo,
      onShow,
      onAccordionToggle,
      active,
      schema,
    } = this.props;

    return (
      <div
        className={classNames({
          'field-preview': true,
        })}
      >
        <div>
          <Accordion
            head={(
              <>
                <label
                  htmlFor={`show-${field.field}`}
                  className="margin-right-xs margin-top-xs"
                >
                  {getLocaleValue(field.label, lang)}
                </label>
                {this.isFieldOptional() ? null
                  : (
                    <span className="form-tooltip-icon icon-hide margin-right-xs">
                      <i className="obligatoire"> </i>
                      <div className="tooltip right" role="tooltip">
                        <div className="tooltip-arrow"> </div>
                        <div className="tooltip-inner">{getLabel('requiredField', lang)}</div>
                      </div>
                    </span>
                  )}
                <span className="form-tooltip-icon icon-hide margin-right-xs">
                  <i className="hidden-field"> </i>
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow"> </div>
                    <div className="tooltip-inner">{getLabel('hiddenField', lang)}</div>
                  </div>
                </span>
                {field.fieldType ? (
                  <span className="form-tooltip-icon icon-hide margin-right-xs">
                    <i className={field.fieldType}> </i>
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"> </div>
                      <div className="tooltip-inner">{getFieldTypeLabel(field, lang)}</div>
                    </div>
                  </span>
                ) : null}
                {isFieldMultilingual(field) ? (
                  <span className="form-tooltip-icon icon-hide margin-right-xs">
                    <i className="multilingual fa fa-globe"> </i>
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"> </div>
                      <div className="tooltip-inner">{getLabel('isMultilingual', lang)}</div>
                    </div>
                  </span>
                ) : null}
                {isFieldLinked(field) ? (
                  <span className="form-tooltip-icon icon-hide margin-right-xs">
                    <i className="linked"> </i>
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"> </div>
                      <div className="tooltip-inner">{getLinkedFieldDetailedLabel({ field, lang, schema })}</div>
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
                        <i className="obligatoire"> </i>
                        <span className="optional">{getLabel('requiredField', lang)}</span>
                      </span>
                    )}
                  <span className="form-icon margin-right-sm">
                    <i className="hidden-field"> </i>
                    <span className="optional">{getLabel('hiddenField', lang)}</span>
                  </span>
                  {field.fieldType ? (
                    <span className="form-icon margin-right-sm">
                      <i className={field.fieldType}> </i>
                      <span className="fieldtype">{getFieldTypeLabel(field, lang)}</span>
                    </span>
                  ) : null }
                  {isFieldMultilingual(field) ? (
                    <span className="form-icon margin-right-sm">
                      <i className="multilingual fa fa-globe"> </i>
                      <span className="multilingual-label">{getLabel('isMultilingual', lang)}</span>
                    </span>
                  ) : null}
                  {isFieldLinked(field) ? (
                    <>
                      <span className="form-tooltip-icon icon-hide form-icon">
                        <i className="linked"> </i>
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
                  <div className="margin-top-xs" title="Code du champ">{getLabel('jsonKey', lang)}: {field.field}</div>
                ) : null }
                {'default' in field ? (
                  <div className="margin-top-xs" title="Valeur par défaut">{getLabel('defaultValue', lang)}: {String(getDefaultValueLabel(field, lang))}</div>
                ) : null }
                {field.max ? (
                  <div className="margin-top-xs" title="Longueur du champ">{getLabel('maxLength', lang)}: {field.max}</div>
                ) : null }
                <div className="form-item-actions padding-h-xs">
                  <button
                    type="button"
                    name={`show-${field.field}`}
                    className="btn btn-link"
                    onClick={() => onShow()}
                  >
                    {getLabel('showField', lang)}
                  </button>
                </div>
              </>
              )}
            onToggle={onAccordionToggle}
            active={active}
            schema={schema}
          />
        </div>
      </div>
    );
  }

  render() {
    const { field } = this.props;

    return field?.display ?? true ? this.renderDisplayed() : this.renderHidden();
  }
}
