"use strict";

var React = require( 'react' ),

TagsInput = require( 'react-tagsinput' );

module.exports = React.createClass( {

  stringify: function( tArr ) {

    return tArr.join( ', ' );

  },

  parse: function( tString ) {

    return ( typeof tString == 'undefined' ? '' : tString ).split( ',' ).filter( function( s ) {

      return !!s.length;

    } ).map( function( t ) {

      return t.trim('');

    });

  },

  onChange: function( l ) {

    var self = this;

    return function( lTags ) {

      var tags = JSON.parse( JSON.stringify( self.props.tags ) );

      tags[ l ] = self.stringify( lTags );

      self.props.onChange( tags );

    }

  },

  render: function() {

    var self = this,

    count = this.props.languages.length,

    renderField = function( l ) {

      return <li className={count>1?'lang-unit':''}>
        {count>1?<label>{l}</label>:''}
        <div>
          <TagsInput 
            value= { self.parse( self.props.tags[ l ] ) }
            placeholder= {self.props.labels.keywordPlaceholder}
            onChange={ self.onChange( l ) }
            ref='tags' />
        </div>
      </li>

    };

    return <ul className="cform">

      <li>
        <label>{this.props.labels.keywords}</label>
      </li>
      {this.props.languages.map(renderField)}

    </ul>

  }

} );