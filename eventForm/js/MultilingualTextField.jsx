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

  componentDidMount: function() {

    this.update( this.props.value );

  },

  onChange: function( e ) {

    this.setState( { userHasTyped: true } );

    this.update( e.target.value );

  },

  update: function( value ) {

    var valueSet = utils.extend( {}, this.props.value );

    if ( typeof valueSet !== 'object' ) {

      valueSet = {};

    }

    // set current language value

    if ( typeof value == 'object' ) {

      utils.extend( valueSet, value );

    } else {

      valueSet[ this.props.currentLanguage ] = value;

    }

    this.props.handleUpdate(
      valueSet,
      validate( value )
    );

  },

  render: function() {

    var self = this,

    count = this.props.languages.length,

    renderField = function( l ) {

      var value = self.props.value[ l ] ? self.props.value[ l ] : '';

      return <li className={count>1?'lang-unit':''}>
        {count>1?<label>{l}</label>:''}
        <div>
          { self.props.type == 'textarea' ?
            <input type="text" value={ value } onChange={ self.onChange }/>
            : <textarea value={ value } onChange={ self.onChange }/>
          }
        </div>
      </li>

    };

    return ( 
      <ul className="cform">
        <li>
          <label>{this.props.label[this.props.labelsLang]}{ this.props.field.optional ? '' : ' (*)' }</label>
          { this.props.field.info && !( this.props.error && this.state.userHasTyped ) ? <span className="info">{this.props.field.info[this.props.labelsLang]}</span> : '' }
        </li>
        {this.props.languages.map(renderField)}
      </ul>
    );

    //{ this.props.error && this.state.userHasTyped ? <span className="error">{this.props.error}</span> : '' }
    
  },

  validate: function( value ) {

    var currentMessages = {},

    messages = errors.messages( this.props.labelsLang );

    self = this,

    has = false;

    this.props.languages.forEach( function( l ) {

      var v = value[ l ],

      message;

      if ( !( v + '').length ) {

        if ( !this.props.field.optional ) {

          return messages.notEmpty();

        }

        return false;

      }

      if ( ( this.props.field.max !== undefined ) && ( v.length > this.props.field.max ) ) {

        currentMessages[ l ] = messages.tooLong( this.props.field.max );

      } else if ( ( this.props.field.min !== undefined ) && ( v.length < this.props.field.min ) ) {

        currentMessages[ l ] = messages.tooShort( this.props.field.min );

      }

      if ( message ) {

        currentMessages[ l ] = message;

        has = true;

      }

    });

    return has ? currentMessages : false;

  }

});