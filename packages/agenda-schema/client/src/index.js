if ( !window._babelPolyfill ) require( '@babel/polyfill' );

import _ from 'lodash';

import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      schema: props.schema
    }

  }

  onUpdate( updatedSchema ) {

    //this.setState( { schema: updatedSchema } );

  }

  render() {

    const { lang, extensions, schema } = this.props;

    return <FormSchemaBuilder
      lang={lang}
      addEnabled={false}
      devState={{
        //editedField: 'title'
      }}
      schema={schema}
      extendedFrom={extensions}
      onUpdate={this.onUpdate.bind( this )}
    />

  }

}


const props = JSON.parse(
  document.getElementById( 'props' ).innerHTML,
  ( k, v ) => _.isString( v ) ? v.replace( '<CLOSINGSCRIPTTAG>', '</script>' ) : v
);

render( <Main {...props} />, document.getElementById( 'app' ) );
