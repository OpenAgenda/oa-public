import classNames from 'classnames';
import React, { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';
import fieldLanguages from '../lib/fieldLanguages';
import getFieldTypeLabel from '../lib/getFieldTypeLabel';
import getPreferredLang from '../lib/getPreferredLang';

const getLabel = makeLabelGetter( labels );

export default class FieldPreview extends Component {

  render() {

    const {
      field,
      lang,
      disabled,
      schemaInfo,
      ordering,
      isOwnField
    } = this.props;

    return <div
      className={classNames( {
      'field-preview' : true,
      'padding-top-xs' : true,
      disabled
    } )}>
      <div className="padding-h-sm">
        <label className="margin-right-xs">{getPreferredLang( field.label, lang )}</label>
        { schemaInfo ?
          <span title={getPreferredLang( schemaInfo.detail, lang )} className="badge badge-default">{getPreferredLang( schemaInfo.label, lang )}</span>
        : null }
        <ul className="list-inline margin-bottom-xs">
          <li>
            <span>{getFieldTypeLabel( field, lang )}</span>
          </li>
        </ul>
        { ordering ? <ul className="field-actions list-inline">
          <li><span className="btn btn-link">{getLabel( 'orderField', lang )}</span></li>
        </ul> : <div className="field-actions padding-h-xs">
          <button
            onClick={()=>disabled ? ()=>{} : this.props.onEdit()}
            className="btn btn-link"
            disabled={disabled}>{getLabel( 'editField', lang )}</button>
          { isOwnField ? <button
            onClick={()=>disabled ? ()=>{} : this.props.onRemove()}
            className="btn btn-link">
            <span className="text-danger">{getLabel( 'removeField', lang )}</span>
          </button> : null }
        </div> }
      </div>
    </div>

  }

}
