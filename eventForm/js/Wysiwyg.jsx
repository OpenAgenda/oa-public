"use strict";

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  MarkdownComponent = require( '@openagenda/react-form-components/build/MarkdownComponent' ),

  HTMLComponent = require( '@openagenda/react-form-components/build/HTMLComponent' ),

  du = require( '@openagenda/dom-utils' ),

  utils = require( '@openagenda/utils' );

module.exports = createReactClass( {

  onChange: function( l, updated ) {

    let changed = this.props.value ? JSON.parse( JSON.stringify( this.props.value ) ) : {}; 

    changed[ l ] = updated;
    
    this.props.onChange( changed, null, [ l ] );

  },

  renderComponent: function( l ) {

    if ( this.props.markdown ) {

      return <MarkdownComponent
        lang={this.props.lang}
        placeholder={ du.nl2br( this.props.placeholder[ this.props.lang ] ) }
        onChange={this.onChange.bind( null, l )}
        value={this.props.value ? ( this.props.value[ l ] ? this.props.value[ l ] : '' ) : '' }
      />

    } else {

      return <HTMLComponent
        lang={this.props.lang}
        placeholder={ du.nl2br( this.props.placeholder[ this.props.lang ] ) }
        onChange={this.onChange.bind( null, l )}
        value={this.props.value ? ( this.props.value[ l ] ? this.props.value[ l ] : '' ) : '' }
      />

    }

  },

  render: function() {

    if ( this.props.languages.length > 1 ) {

      return <ul className="list-unstyled">
        <li key={'wisywig_0'}>
          <label>{ this.props.label[ this.props.lang ] }</label>
        </li>
        {this.props.languages.map( l => <li className="lang-unit" key={'wisywig_' + l }>
          <label>{l}</label>
          {this.renderComponent( l )}
        </li> )}
      </ul>

    }

    return <ul className="list-unstyled">
      <li>
        <label>{ this.props.label[ this.props.lang ] }</label>
      </li>
      {this.renderComponent( this.props.languages[ 0 ] )}
    </ul>

  }

} );