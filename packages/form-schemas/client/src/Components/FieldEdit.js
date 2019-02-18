import React, { Component } from 'react';

import FormSchemaComponent from '../';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from '../lib/builderLabels';
import fieldLanguages from '../lib/fieldLanguages';
import updateSchemaFieldLanguages from '../lib/updateSchemaFieldLanguages';
import unflattenLabels from '../lib/unflattenLabels';
import Languages from '../Components/Languages';

const getLabel = makeLabelGetter( labels );

export default class FieldEdit extends Component {

  constructor( props ) {

    super( props );

    const labelLanguages = fieldLanguages( this.props.field, this.props.lang );

    this.state = {
      addLabelLanguages: false,
      labelLanguages,
      field: unflattenLabels( props.field, labelLanguages ),
      schema: {
        fields: [ {
          field: 'label',
          fieldType: 'text',
          optional: false,
          languages: labelLanguages,
          label: labels.fieldLabel
        }, {
          field: 'info',
          fieldType: 'text',
          languages: labelLanguages,
          label: labels.fieldInfo,
          info: labels.fieldInfoInfo
        }, {
          field: 'placeholder',
          fieldType: 'text',
          languages: labelLanguages,
          label: labels.fieldPlaceholder,
          placeholder: labels.fieldPlaceholderPlaceholder
        }, {
          field: 'sub',
          fieldType: 'text',
          languages: labelLanguages,
          label: labels.fieldSub,
          sub: labels.fieldSubSub
        } ]
      }
    }

  }

  onChange( { values, errors } ) {

    this.setState( { field: values } );

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
      <Languages
        className="language-bar thin"
        lang={lang}
        value={labelLanguages}
        onChange={this.onLabelLanguagesChange.bind( this )}
      />
    </div>

  }

  render() {

    const { lang } = this.props;

    const { field, schema, labelLanguages, addLabelLanguages } = this.state;

    const showLanguageBar = labelLanguages.length > 1 || addLabelLanguages;

    return <div className="field-edit margin-v-sm">
      {showLanguageBar ? this.renderLanguageMenu() : null}
      <FormSchemaComponent
        stateless={true}
        onChange={this.onChange.bind( this )}
        values={field}
        lang={lang}
        schema={schema}
        actionComponents={[ {
          position: 'bottom',
          Component: ( { onSubmit } ) => <div className="padding-top-sm padding-h-sm">
            <div>
              {!showLanguageBar ?
                <a href="#" onClick={this.onDefineLabelLanguages.bind( this )}>{getLabel( 'addLanguages', lang )}</a>
                : null }
            </div>
            <div className="margin-v-sm">
              <button onClick={this.props.onCancel} className="btn btn-default">{getLabel( 'editFieldCancel', lang )}</button>
              <button onClick={() => this.props.onSave( this.state.field )} className="btn btn-primary pull-right">{getLabel( 'editFieldSave', lang )}</button>
            </div>
          </div>
        } ]}
      />
    </div>

  }

}
