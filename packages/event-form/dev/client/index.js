import _ from 'lodash';
import React, { Component } from 'react';
import { render } from 'react-dom';
import store from 'store';
import VError from '@openagenda/verror';

import extendedSchema from './extendedSchema.json';

const schemas = [extendedSchema];

if ( module.hot ) module.hot.accept();

import EventForm from './EventForm';
import validateFormField from '@openagenda/form-schemas/iso/validateField';
import {
  tiles
} from '../../testconfig';


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

  onValuesChange( changed ) {

    console.log( changed );

    this.setState( {
      values: changed
    } );

  }

  render() {
    
    const values = _.get( this, 'state.values', null );

    return <div className="container-fluid top-margined">
      <div className="row">
        <div className="col-sm-4">
          <EventForm tiles={tiles} schemaExtensions={schemas} devOnChange={this.onValuesChange.bind( this )} /> 
        </div>
        <div className="col-sm-4">
          <pre>
            <code>{JSON.stringify( values, null, 2 ) }</code>
          </pre>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
