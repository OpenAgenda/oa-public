"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

utils = require( 'utils' ),

errors = require( './errors' );

module.exports = React.createClass({

  getInitialState: function() {

    return {
      userHasTyped: false
    };

  },

  onChange: function( l ) {

    var self = this;

    return function( e ) {

      var value = JSON.parse( JSON.stringify( self.props.value ) );

      value[ l ] = e.target.value;

      self.setState( { userHasTyped: true } );

      self.props.onChange( value, self.validate( value ) );

    }

  },

  render: function() {

    var self = this,

    count = this.props.languages.length,

    renderField = function( l ) {

      var value = self.props.value[ l ] ? self.props.value[ l ] : '';

      return <li className={count>1?'lang-unit':''}>
        {count>1?<label>{l}</label>:''}
        <div>
          { self.props.type !== 'textarea' ?
            <input type="text" value={ value } onChange={ self.onChange( l ) }/>
            : <textarea value={ value } onChange={ self.onChange( l ) }/>
          }
          { self.props.error && self.props.error[ l ] && self.state.userHasTyped ? <span className="error">{ self.props.error[ l ] }</span> : '' }
        </div>
      </li>

    };

    return ( 
      <ul className="cform">
        <li>
          <label>{this.props.label[this.props.labelsLang]}{ this.props.optional ? '' : ' (*)' }</label>
          { this.props.info && !( this.props.error && self.state.userHasTyped ) ? <span className="info">{this.props.info[this.props.labelsLang]}</span> : '' }
        </li>
        {this.props.languages.map(renderField)}
      </ul>
    );
    
  },

  validate: function( value ) {

    var currentMessages = {},

    messages = errors.messages( this.props.labelsLang ),

    self = this,

    has = false;

    this.props.languages.forEach( function( l ) {

      var v = value[ l ] || '',

      message;

      if ( !v.length && self.props.optional===false ) {

        message = messages.notEmpty();

      } else if ( ( self.props.constraints.max !== undefined ) && ( v.length > self.props.constraints.max ) ) {

        message = messages.tooLong( self.props.constraints.max );

      } else if ( ( self.props.constraints.min !== undefined ) && ( v.length < self.props.constraints.min ) ) {

        message = messages.tooShort( self.props.constraints.min );

      }

      if ( message ) {

        currentMessages[ l ] = message;

        has = true;

      }

    });

    return has ? currentMessages : false;

  }

});