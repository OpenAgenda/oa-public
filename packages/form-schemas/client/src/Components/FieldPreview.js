import classNames from 'classnames';
import React, { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';

import labels from '../lib/builderLabels';
import fieldLanguages from '../lib/fieldLanguages';
import getFieldTypeLabel from '../lib/getFieldTypeLabel';
import getPreferredLang from '../lib/getPreferredLang';
import FieldEdit from './FieldEdit';

const getLabel = makeLabelGetter( labels );

export default class FieldPreview extends Component {

  render() {

    const {
      field,
      lang,
      labelLanguages,
      editing,
      disabled,
      onSave,
      onCancel,
      schemaInfo,
      ordering
    } = this.props;

    return <div
      id={'field-preview-' + field.field}
      className={classNames( {
      'field-preview' : true,
      'padding-top-xs' : true,
      disabled,
      editing
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
      </div>
      { editing ?
        <FieldEdit
          field={field}
          lang={lang}
          labelLanguages={labelLanguages}
          onSave={onSave}
          onCancel={onCancel}
        /> : <ul className="field-actions list-inline padding-h-sm">
          { ordering ? <li>
            <span className="btn btn-link">{getLabel( 'orderField', lang )}</span>
          </li> : <li><button
            onClick={()=>disabled ? ()=>{} : this.props.onEdit()}
            className="btn btn-link"
            disabled={disabled}>{getLabel( 'editField', lang )}</button>
          </li> }
        </ul>
      }
    </div>

  }

}
