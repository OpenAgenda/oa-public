import _ from 'lodash';
import classNames from 'classnames';
import React, { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from './lib/labels';
import fieldLanguages from './lib/fieldLanguages';
import getFieldTypeLabel from './lib/getFieldTypeLabel';
import getPreferredLang from './lib/getPreferredLang';

const getLabel = makeLabelGetter(labels);

export default class FieldPreview extends Component {
  getInfoLabel() {
    if (!this.props.editable) return getLabel('uneditableFieldInfo', this.props.lang);
    if (this.props.disabled) return null;
    return getLabel('editFieldInfo', this.props.lang);
  }

  isFieldOptional() {
    return _.get(this.props.field, 'optional', true);
  }

  renderSchemaInfo(schemaInfo, lang) {
    if (!schemaInfo) return null;

    return (
      <span
        title={getPreferredLang(schemaInfo.detail, lang)}
        className="badge badge-default margin-right-xs pull-right margin-top-xs">{getPreferredLang(schemaInfo.label, lang)}
      </span>
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
      isOwn
    } = this.props;

    const editable = isOwn || editableExtensions;

    return (
      <div
        className={classNames({
          'field-preview': true
        })}
      >
        <div>
          <label className="margin-right-xs padding-top-xs">{getPreferredLang(field.label, lang)}</label>
          {this.isFieldOptional() ? null : <span className="text-muted margin-right-xs">{getLabel('requiredField', lang)}</span>}
          {this.renderSchemaInfo(schemaInfo, lang)}
          <ul className="list-inline margin-bottom-xs">
            <li><span>{field.purpose ? getPreferredLang(field.purpose, lang) : getFieldTypeLabel(field, lang)}</span></li>
            <li className="text-muted" title="Code du champ">{field.field}</li>
          </ul>
          {ordering ? <ul className="form-item-actions list-inline">
            <li><span className="btn btn-link">{getLabel('orderField', lang)}</span></li>
          </ul> : <div className="form-item-actions padding-h-xs">
            <button
              title={this.getInfoLabel()}
              onClick={() => !editable || disabled ? () => { } : this.props.onEdit()}
              className="btn btn-link"
              disabled={!editable || disabled}>{getLabel('editField', lang)}</button>
            {this.isFieldOptional() ? <button
              onClick={() => this.props.onHide()}
              className="btn btn-link"
            >{getLabel('hideField', lang)}</button> : null}
            {isOwn ? <button
              onClick={() => disabled ? () => { } : this.props.onRemove()}
              className="btn btn-link">
              <span className="text-danger">{getLabel('removeField', lang)}</span>
            </button> : null}
          </div>}
        </div>
      </div>
    );
  }

  renderHidden() {
    const {
      field,
      lang,
      schemaInfo
    } = this.props;

    return (
      <div
        className={classNames({
          'field-preview': true
        })}
      >
        <label className="margin-right-xs padding-top-xs">{getPreferredLang(field.label, lang)}</label>
        {this.renderSchemaInfo(schemaInfo, lang)}
        <span>{getLabel('hiddenField', lang)}</span>
        {field.purpose ? <ul className="list-inline margin-bottom-xs">
          <li>
            <span>{getPreferredLang(field.purpose, lang)}</span>
          </li>
          <li className="text-muted" title="Code du champ">{field.field}</li>
        </ul> : null}
        <div className="form-item-actions padding-h-xs">
          <button className="btn btn-link" onClick={() => this.props.onShow()}>{getLabel('showField', lang)}</button>
        </div>
      </div>
    );
  }

  render() {
    const { field } = this.props;

    return _.get(field, 'display', true) ? this.renderDisplayed() : this.renderHidden();
  }
}

<div class="field-preview">
  <div>
    <label class="margin-right-xs padding-top-xs">Crédits de l'image</label>
    <span title="Champ événement standard" class="badge badge-default margin-right-xs pull-right margin-top-xs">Standard</span>
    <ul class="list-inline margin-bottom-xs">
      <li><span>Champ texte</span></li>
      <li class="text-muted" title="Code du champ">imageCredits</li>
    </ul>
    <div class="form-item-actions padding-h-xs">
      <button title="Ce champ ne peut pas être modifié" class="btn btn-link" disabled="">Editer</button>
      <button class="btn btn-link">Cacher</button>
    </div>
  </div>
</div>