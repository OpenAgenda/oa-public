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
      editing,
      disabled,
      onSave,
      onCancel,
      schemaInfo
    } = this.props;

    return <div title={!disabled && !editing ? getLabel( 'draggableField', lang ) : null} className={classNames( {
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
          { fieldLanguages( field ).map( l => (
          <li key={`field-lang-${l}`}>
            <span className="badge badge-default">{l}</span>
          </li>
          ) ) }
        </ul>
      </div>
      { editing ?
        <FieldEdit
          field={field}
          lang={lang}
          onSave={onSave}
          onCancel={onCancel}
        /> : <ul className="field-actions list-inline padding-h-sm">
          <li><a
            onClick={()=>disabled ? ()=>{} : this.props.onEdit()}
            className="btn btn-link"
            disabled={disabled}
            href="#">{getLabel( 'editField', lang )}</a>
          </li>
        </ul>
      }
    </div>

  }

}
