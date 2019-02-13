import React, { Component } from 'react';

import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from '../lib/builderLabels';
import fieldLanguages from '../lib/fieldLanguages';

const getLabel = makeLabelGetter( labels );

export default class FieldPreview extends Component {

  render() {

    const { field, lang } = this.props;

    return <div className="field-preview">
      <label>{field.label}</label>
      <ul className="list-inline margin-bottom-xs">
        <li>
          <span>{field.fieldType}</span>
        </li>
        { fieldLanguages( field ).map( l => (
        <li key={`field-lang-${l}`}>
          <span className="badge badge-default">{l}</span>
        </li>
        ) ) }
      </ul>
      <ul className="list-inline">
        <li><a onClick={()=>{this.props.onEdit()}} href="#">{getLabel( 'editField', lang )}</a></li>
      </ul>
    </div>

  }

}
