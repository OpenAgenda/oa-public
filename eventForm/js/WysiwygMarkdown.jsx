"use strict";

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  MarkdownComponent = require( 'react-form-components/build/MarkdownComponent' ),

  du = require( 'dom-utils' ),

  utils = require( 'utils' );

module.exports = createReactClass( {

  onChange: function( l, updatedMarkdown ) {

    let changed = this.props.markdown ? JSON.parse( JSON.stringify( this.props.markdown ) ) : {}; 

    changed[ l ] = updatedMarkdown;
    
    this.props.onChange( changed, null, [ l ] );

  },

  renderComponent: function( l ) {

    return <MarkdownComponent
      lang={this.props.lang}
      placeholder={ du.nl2br( this.props.placeholder[ this.props.lang ] ) }
      onChange={this.onChange.bind( null, l )}
      value={this.props.markdown ? ( this.props.markdown[ l ] ? this.props.markdown[ l ] : '' ) : ''}
    />

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