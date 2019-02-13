import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaBuilder from '../../client/src/FormSchemaBuilder'

if ( module.hot ) module.hot.accept();

class Main extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      schema: {
        fields:[ {
          field: 'title',
          fieldType: 'text',
          label: 'Title'
        }, {
          field: 'description',
          fieldType: 'text',
          label: 'Description'
        } ]
      },
      extensions: []
    }

  }

  onUpdate( updatedSchema ) {

    this.setState( {
      schema: updatedSchema
    } );

  }

  render() {

    return <div className="container top-margined">

      <div className="row margin-v-md">
        <div className="col-sm-6">
          <div className="margin-h-md wsq padding-all-md">
            <FormSchemaBuilder
              lang="fr"
              addEnabled={true}
              devState={{
                editedField: 'title'
              }}
              schema={this.state.schema}
              extendedFrom={[]}
              onUpdate={this.onUpdate.bind( this )}
            />
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );

/* <div className="row margin-v-md">
        <div className="col-sm-6">
          <div className="margin-h-md wsq padding-all-md">
            <FormSchemaBuilder
              lang="fr"
              addEnabled={true}
              schema={{fields:[]}}
              extendedFrom={[]}
              onUpdate={this.onUpdate.bind( this )}
            />
          </div>
        </div>
        <div className="col-sm-6">
          <div className="margin-h-md wsq padding-all-md">
            <FormSchemaBuilder
              lang="fr"
              addEnabled={false}
              schema={{fields:[]} }
              extendedFrom={[]}
              onSchemaUpdate={this.onUpdate.bind( this )}
            />
          </div>
        </div>
      </div>*/
