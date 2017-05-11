"use strict";

var React = require( 'react' ),

createReactClass = require( 'create-react-class' ),

validators = require( './validators' ),

renderHelpers = require( './renderHelpers.jsx' ),

ERR = {
  NOTEMPTY: 1
},

utils = require( 'utils' );

module.exports = function( funcs ) {

  return createReactClass( utils.extend( {}, funcs, {

    getInitialState: function() {

      return {
        userHasTyped: false
      };

    },

    componentDidMount: function() {

      this.update( this.props.value );

    },

    onChange: function( value ) {

      var i, newValue;

      this.setState( { userHasTyped: true } );

      if ( this.props.type == 'multichoice' ) {

        i = this.props.value.indexOf( value );

        newValue = ( this.props.value || [] ).concat();

        if ( i == -1 ) {

          newValue.push( value );

        } else {

          newValue.splice( i, 1 );

        }

        this.update( newValue );

      } else {

        this.update( value );

      }

    },

    update: function( value ) {

      this.props.onChange( 
        value, 
        this.validate( value )
      );

    },

    render: function() {

      return <div className="form-group">
        <label>{this.props.field.label[this.props.lang]}{this.props.field.optional ? '' : ' (*)'}</label>
        {renderHelpers.errorOrInfo.apply( this )}
        { this.renderField() }
      </div>;

    },

    validate: function( value ) {

      if ( this.props.type == 'multichoice' ) {

        if ( value === undefined ) value = [];

      } else {

        if ( value === undefined ) value = '';

        if ( !this.props.optional && !( value + '').length ) {

          return this.message( ERR.NOTEMPTY );

        }
        
      }

      return false;

    },

    message: function( code ) {

      var messages = {};

      messages[ ERR.NOTEMPTY ] = {
        en: 'this field cannot be empty',
        fr: 'ce champ ne peut pas rester vide'
      };

      return messages[ code ][ this.props.lang ];

    }

  } ) );

}