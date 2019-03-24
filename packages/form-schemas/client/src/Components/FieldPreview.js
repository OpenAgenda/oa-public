import classNames from 'classnames';
import React, { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';
import fieldLanguages from '../lib/fieldLanguages';
import getFieldTypeLabel from '../lib/getFieldTypeLabel';
import getPreferredLang from '../lib/getPreferredLang';

const getLabel = makeLabelGetter( labels );

export default class FieldPreview extends Component {

  renderSchemaInfo( schemaInfo, lang ) {

    if ( !schemaInfo ) return null;

    return <span
      title={getPreferredLang( schemaInfo.detail, lang )}
      className="badge badge-default margin-right-xs">{getPreferredLang( schemaInfo.label, lang )}</span>

  }

  isFieldOptional() {

    return _.get( this.props.field, 'optional', true );

  }

  getInfoLabel() {

    if ( !this.props.editable ) return getLabel( 'uneditableFieldInfo', this.props.lang );

    if ( this.props.disabled ) return null;

    return getLabel( 'editFieldInfo', this.props.lang );

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

    return <div
      className={classNames( {
      'field-preview' : true
      } )}>
      <div>
        <label className="margin-right-xs padding-top-xs">{getPreferredLang( field.label, lang )}</label>
        {this.renderSchemaInfo( schemaInfo, lang )}
        <ul className="list-inline margin-bottom-xs">
          <li>
            <span>{getFieldTypeLabel( field, lang )}</span>
          </li>
          { this.isFieldOptional() ? null : <li>
            <span className="text-muted">{getLabel( 'requiredField', lang )}</span>
          </li> }
        </ul>
        { ordering ? <ul className="field-actions list-inline">
          <li><span className="btn btn-link">{getLabel( 'orderField', lang )}</span></li>
        </ul> : <div className="field-actions padding-h-xs">
          <button
            title={this.getInfoLabel()}
            onClick={()=>!editable || disabled ? ()=>{} : this.props.onEdit()}
            className="btn btn-link"
            disabled={!editable || disabled}>{getLabel( 'editField', lang )}</button>
          { this.isFieldOptional() ? <button
            onClick={()=>this.props.onHide()}
            className="btn btn-link"
          >{getLabel( 'hideField', lang )}</button> : null }
          { isOwn ? <button
            onClick={()=>disabled ? ()=>{} : this.props.onRemove()}
            className="btn btn-link">
            <span className="text-danger">{getLabel( 'removeField', lang )}</span>
          </button> : null }
        </div> }
      </div>
    </div>

  }

  renderHidden() {

    const {
      field,
      lang,
      schemaInfo
    } = this.props;

    return <div
      className={classNames( {
      'field-preview' : true
    } )}>
      <label className="margin-right-xs padding-top-xs">{getPreferredLang( field.label, lang )}</label>
      {this.renderSchemaInfo( schemaInfo, lang )}
      <ul className="list-inline margin-bottom-xs">
        <li><span>{getLabel( 'hiddenField', lang )}</span></li>
        <li>
          <button className="btn btn-link" onClick={()=>this.props.onShow()}>{getLabel( 'showField', lang )}</button>
        </li>
      </ul>
    </div>

  }

  render() {

    const { field } = this.props;

    return _.get( field, 'display', true ) ? this.renderDisplayed() : this.renderHidden();

  }

}
