import classNames from 'classnames';
import React, { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from './lib/labels';
import getFieldTypeLabel from './lib/getFieldTypeLabel';
import getPreferredLang from './lib/getPreferredLang';

const getLabel = makeLabelGetter(labels);

const renderSchemaInfo = (schemaInfo, lang) => {
  if (!schemaInfo) {
    return null;
  }

  return (
    <span
      title={getPreferredLang(schemaInfo.detail, lang)}
      className="badge badge-default margin-right-xs pull-right margin-top-xs"
    >{getPreferredLang(schemaInfo.label, lang)}
    </span>
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
      onRemove
    } = this.props;

    const editable = defineIsEditable(field, { isOwn, editableExtensions });
    const isDisabled = !editable || disabled;

    return (
      <div
        className={classNames({
          'field-preview': true
        })}
      >
        <div>
          <label
            className="margin-right-xs padding-top-xs"
            htmlFor={`edit-${field.field}`}
          >
            {getPreferredLang(field.label, lang)}
          </label>
          {this.isFieldOptional() ? null : <span className="text-muted margin-right-xs">{getLabel('requiredField', lang)}</span>}
          {renderSchemaInfo(schemaInfo, lang)}
          <ul className="list-inline margin-bottom-xs">
            <li><span>{field.purpose ? getPreferredLang(field.purpose, lang) : getFieldTypeLabel(field, lang)}</span></li>
            <li className="text-muted" title="Code du champ">{field.field}</li>
          </ul>
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
        </div>
      </div>
    );
  }

  renderHidden() {
    const {
      field,
      lang,
      schemaInfo,
      onShow
    } = this.props;

    return (
      <div
        className={classNames({
          'field-preview': true
        })}
      >
        <label
          htmlFor={`show-${field.field}`}
          className="margin-right-xs padding-top-xs"
        >
          {getPreferredLang(field.label, lang)}
        </label>
        {renderSchemaInfo(schemaInfo, lang)}
        <span>{getLabel('hiddenField', lang)}</span>
        {field.purpose ? (
          <ul className="list-inline margin-bottom-xs">
            <li>
              <span>{getPreferredLang(field.purpose, lang)}</span>
            </li>
            <li className="text-muted" title="Code du champ">{field.field}</li>
          </ul>
        ) : null}
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
      </div>
    );
  }

  render() {
    const { field } = this.props;

    return (field?.display ?? true) ? this.renderDisplayed() : this.renderHidden();
  }
}
