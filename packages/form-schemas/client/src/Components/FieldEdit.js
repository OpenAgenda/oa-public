import React, { Component } from 'react';

import FormSchemaComponent from '../';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from '../lib/builderLabels';
import fieldLanguages from '../lib/fieldLanguages';
import updateSchemaFieldLanguages from '../lib/updateSchemaFieldLanguages';
import Languages from '../Components/Languages';

const getLabel = makeLabelGetter( labels );

export default class FieldEdit extends Component {

  constructor( props ) {

    super( props );

    const labelLanguages = fieldLanguages( this.props.field, this.props.lang );

    this.state = {
      addLabelLanguages: false,
      labelLanguages,
      field: props.field,
      schema: {
        fields: [ {
          field: 'label',
          fieldType: 'text',
          languages: labelLanguages,
          label: labels.fieldLabel
        } ]
      }
    }

  }

  onDefineLabelLanguages( e ) {

    e.preventDefault();

    this.setState( { addLabelLanguages: true } );

  }

  onLabelLanguagesChange( newLanguages ) {

    this.setState( {
      labelLanguages: newLanguages,
      schema: updateSchemaFieldLanguages( this.state.schema, newLanguages )
    } );

  }

  renderLanguageMenu() {

    const { lang } = this.props;

    const { labelLanguages } = this.state;

    return <div className="margin-bottom-sm">
      <label className="control-label">{getLabel( 'fieldLabelLanguages', lang )}</label>
      <Languages className="language-bar thin" value={labelLanguages} onChange={this.onLabelLanguagesChange.bind( this )}/>
    </div>

  }

  render() {

    const { lang } = this.props;

    const { field, schema, labelLanguages, addLabelLanguages } = this.state;

    const showLanguageBar = labelLanguages.length > 1 || addLabelLanguages;

    return <div>
      {showLanguageBar ? this.renderLanguageMenu() : null}
      <FormSchemaComponent
        value={this.props.field}
        lang={lang}
        schema={this.state.schema}
      />
      <div>
        {!showLanguageBar ?
          <a href="#" onClick={this.onDefineLabelLanguages.bind( this )}>{getLabel( 'addLanguages', lang )}</a>
          : null }
      </div>
    </div>

  }

}
