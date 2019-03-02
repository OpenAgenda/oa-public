import React, { Component } from 'react';

import FormSchemaComponent from '../';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import labels from '../lib/builderLabels';
import updateSchemaFieldLanguages from '../lib/updateSchemaFieldLanguages';
import unflattenLabels from '../lib/unflattenLabels';
import labelsSchema from '../lib/labelsSchema';

const getLabel = makeLabelGetter( labels );

export default class EditFieldLabels extends Component {

  constructor( props ) {

    super( props );

    const { labelLanguages, field } = props;

    this.state = {
      field: unflattenLabels( field, labelLanguages )
    }

  }

  onChange( { values, errors } ) {

    this.setState( { field: values } );

  }

  render() {

    const { lang, labelLanguages } = this.props;

    const { field, schema } = this.state;

    return <div>
      <h3>{getLabel( 'editFieldLabels', lang )}</h3>
      <FormSchemaComponent
        stateless={true}
        onChange={this.onChange.bind( this )}
        values={field}
        lang={lang}
        schema={labelsSchema( { labelLanguages } )}
        actionComponents={[ {
          position: 'bottom',
          Component: ( { onSubmit } ) => <div className="padding-v-sm padding-h-sm">
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
