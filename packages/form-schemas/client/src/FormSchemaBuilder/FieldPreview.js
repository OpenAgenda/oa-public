import classNames from 'classnames';
import _ from 'lodash';
import React, { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import Accordion from '@openagenda/react-shared/lib/components/Accordion';
import { getLocaleValue } from '@openagenda/intl';

import labels from './lib/labels';
import getFieldTypeLabel from './lib/getFieldTypeLabel';

const getLabel = makeLabelGetter(labels);

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

const defineIsEditable = (field, { isOwn, editableExtensions }) => {
  if (isOwn) {
    return true;
  }

  if (Array.isArray(editableExtensions)) {
    return editableExtensions.includes(field.field);
  }

  return editableExtensions;
};

const renderOptionsInfo = (options, lang) => {
  if (!options) {
    return null;
  }
  if (options.length >= 4) {
    return (
      <div className="margin-top-xs text-muted">
        {options?.slice(0, 4).map(option => <span key={getLocaleValue(option.label, lang)}>{getLocaleValue(option.label, lang)},</span>)}
        <span> + {options.length - 4} choix.</span>
      </div>
    );
  }
  return (
    <div className="margin-top-xs text-muted">
      {options?.map(option => <span key={getLocaleValue(option.label, lang)}>{getLocaleValue(option.label, lang)},</span>)}
    </div>
  );
};

const isMultilingual = languages => {
  if (languages !== undefined) {
    return (
      <span className="form-tooltip-icon icon-hide margin-right-xs">
        <i className="multilingual fa fa-globe"> </i>
        <div className="tooltip right" role="tooltip">
          <div className="tooltip-arrow"> </div>
          <div className="tooltip-inner">multilingue</div>
        </div>
      </span>
    );
  }
};
const isLinked = (related, enableWith, optionalWith, field) => {
  for (let i = 0; i < related?.enable?.length; i++) {
    if (related?.enable[i] === 'image') {
      return (
        <span className="form-tooltip-icon icon-hide margin-right-xs">
          <i className="linked"> </i>
          <div className="tooltip right" role="tooltip">
            <div className="tooltip-arrow"> </div>
            <div className="tooltip-inner">actif avec le chargement d&apos;une image</div>
          </div>
        </span>
      );
    }
    if (!related?.enable[i] !== 'image' && related?.enable.length > 0) {
      return (
        <span className="form-tooltip-icon icon-hide">
          <i className="linked"> </i>
          <div className="tooltip right" role="tooltip">
            <div className="tooltip-arrow"> </div>
            <div className="tooltip-inner">actif lorsque le champ {related?.enable[i]} est saisi</div>
          </div>
        </span>
      );
    }
  }
  if (enableWith?.field === 'attendanceMode') {
    return (
      <span className="form-tooltip-icon icon-hide">
        <i className="linked"> </i>
        <div className="tooltip right" role="tooltip">
          <div className="tooltip-arrow"> </div>
          <div className="tooltip-inner">actif lorsque le champ {enableWith?.field} à la valeur &quot;en ligne&quot;</div>
        </div>
      </span>
    );
  }
  if (optionalWith?.field === 'attendanceMode') {
    field.optional = true;
    return (
      <span className="form-tooltip-icon icon-hide">
        <i className="linked"> </i>
        <div className="tooltip right" role="tooltip">
          <div className="tooltip-arrow"> </div>
          <div className="tooltip-inner">optionel si le champ attendanceMode prend la valeur &quot;en ligne&quot;</div>
        </div>
      </span>
    );
  }
};

function getDefaultLabel(field, lang) {
  if (field.options) {
    const defaultOption = field.options.find(option => option.id === field.default);
    return getLocaleValue(defaultOption.label, lang);
  }

  if (typeof field.default === 'boolean') {
    if (field.default === true) {
      return 'séléctionné';
    }
    return 'non séléctionné';
  }

  return getLocaleValue(field.default, lang);
}

export default class FieldPreview extends Component {
  getInfoLabel() {
    const {
      editable,
      lang,
      disabled
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
      field
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
    } = this.props;

    const editable = defineIsEditable(field, { isOwn, editableExtensions });
    const isDisabled = !editable || disabled;

    return (
      <div
        className={classNames({
          'field-preview': true
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
              {field.type ? (
                <span className="form-tooltip-icon margin-right-xs">
                  <i className={field.type}> </i>
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow"> </div>
                    <div className="tooltip-inner">{field.type}</div>
                  </div>
                </span>
              ) : null }
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
                    <div className="tooltip-inner">{field.fieldType}</div>
                  </div>
                </span>
              ) : null}
              {isMultilingual(field.languages) ? isMultilingual(field.languages) : null}
              {isLinked(field.related, field.enableWith, field.optionalWith, field.field)}
              {renderSchemaInfo(schemaInfo, lang)}
              {renderOptionsInfo(field.options)}
            </>
          )}
          content={(
            <>
              <div className="margin-bottom-xs margin-top-xs">{field.purpose ? getLocaleValue(field.purpose, lang) : getFieldTypeLabel(field, lang)}</div>
              <div className="margin-bottom-xs">
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
                    <span className="fieldtype">{field.fieldType}</span>
                  </span>
                ) : null }
                {isMultilingual(field.languages) ? (
                  <span className="form-icon margin-right-sm">
                    <i className="multilingual fa fa-globe"> </i>
                    <span className="multilingual-label">multilingue</span>
                  </span>
                ) : null}
                {isLinked(field.related, field.enableWith, field.optionalWith, field.field)}
              </div>
              {field.field ? (
                <div title="Code du champ">Clé JSON: {field.field}</div>
              ) : null }
              {'default' in field ? (
                <div className="margin-top-xs" title="Longueur du champ">Valeur par défault: {String(getDefaultLabel(field, lang))}</div>
              ) : null }
              {field.max ? (
                <div className="margin-top-xs" title="Longueur du champ">Longueur max: {field.max}</div>
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
    } = this.props;

    return (
      <div
        className={classNames({
          'field-preview': true
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
                {field.type ? (
                  <span className="form-tooltip-icon margin-right-xs">
                    <i className={field.type}> </i>
                    <div className="tooltip right" role="tooltip">
                      <div className="tooltip-arrow"> </div>
                      <div className="tooltip-inner">{field.type}</div>
                    </div>
                  </span>
                ) : null }
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
                      <div className="tooltip-inner">{field.fieldType}</div>
                    </div>
                  </span>
                ) : null}
                {isMultilingual(field.languages) ? isMultilingual(field.languages) : null}
                {isLinked(field.related, field.enableWith, field.optionalWith, field.field)}
                {renderSchemaInfo(schemaInfo, lang)}
                {renderOptionsInfo(field.options)}
              </>
            )}
            content={(
              <>
                <div className="margin-bottom-xs margin-top-xs">{field.purpose ? getLocaleValue(field.purpose, lang) : getFieldTypeLabel(field, lang)}</div>
                <div className="margin-bottom-xs">
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
                      <span className="fieldtype">{field.fieldType}</span>
                    </span>
                  ) : null }
                  {isMultilingual(field.languages) ? (
                    <span className="form-icon margin-right-sm">
                      <i className="multilingual fa fa-globe"> </i>
                      <span className="multilingual-label">multilingue</span>
                    </span>
                  ) : null}
                  {isLinked(field.related, field.enableWith, field.optionalWith, field.field)}
                </div>
                {field.field ? (
                  <div title="Code du champ">Clé JSON: {field.field}</div>
                ) : null }
                {'default' in field ? (
                  <div className="margin-top-xs" title="Longueur du champ">Valeur par défault: {String(getDefaultLabel(field, lang))}</div>
                ) : null }
                {field.max ? (
                  <div className="margin-top-xs" title="Longueur du champ">Longueur max: {field.max}</div>
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
          />
        </div>
      </div>
    );
  }

  render() {
    const { field } = this.props;

    return (field?.display ?? true) ? this.renderDisplayed() : this.renderHidden();
  }
}
