import _ from 'lodash';
import React, { Component } from 'react';
import { render } from 'react-dom';
import store from 'store';
import VError from 'verror';

if ( module.hot ) module.hot.accept();

import EventForm from './EventForm';
import SchemaEditorComponent from './SchemaEditorComponent';
import validateFormField from '@openagenda/form-schemas/iso/validateField';

const storeKey = 'eventFormSandbox';

console.log( '***** CHANGE ******' );

class Main extends Component {

  constructor( props ) {

    super( props );

    const stored = store.get( storeKey );

    if ( _.isObject( stored ) ) {

      this.state = stored;

    }

  }

  getValidatErrors( schemas ) {

    try {

      schemas.forEach( schema => {

        // form schema needs better validation

        if ( !_.isArray( schema.fields ) ) throw new Error( 'schema is missing fields list' );

        schema.fields.forEach( field => {

          try {

            validateFormField( field )

          } catch ( e ) {

            throw new VError( e, 'field %s failed', field.field || 'nameless ( field missing )' );

          }

        } );

      } );

      return []

    } catch ( e ) {

      return [ e ];

    }

  }

  updateSchemas( update ) {

    const schemas = [].concat( update );

    const errors = this.getValidatErrors( schemas );

    if ( errors.length ) {

      console.error( 'not valid', errors );

      return;

    }

    console.log( 'valid' );

    this.setState( { schemas } );

    store.set( storeKey, { schemas } );

  }

  onJSONChange( { jsObject } ) {

    if ( jsObject ) this.updateSchemas( jsObject );

  }

  render() {

    const schemas = _.get( this, 'state.schemas', null );

    return <div className="container-fluid top-margined">
      <div className="row">
        <div className="col-sm-6">
          <SchemaEditorComponent onChange={this.onJSONChange.bind( this )} schemas={schemas} />
        </div>
        <div className="col-sm-6">
          <div className="row">
            <div className="col-md-10 col-md-offset-1">
              <EventForm schemaExtensions={schemas}/>
            </div>
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
