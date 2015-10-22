"use strict";

var React = require( 'react' ),

validators = require( './validators' ),

renderHelpers = require( './renderHelpers.jsx' ),

ERR = {
  NOTEMPTY: 1
},

utils = require( 'utils' );

module.exports = function( funcs ) {

  return React.createClass( utils.extend( {}, funcs, {

    getInitialState: function() {

      return {
        userHasTyped: false
      };

    },

    componentDidMount: function() {

      this.update( this.props.value );

    },

    onChange: function( value ) {

      this.setState( { userHasTyped: true } );

      this.update( value );

    },

    update: function( value ) {

      this.props.onChange( 
        value, 
        this.validate( value )
      );

    },

    render: function() {

      return <div className="cform">
        <label>{this.props.field.label[this.props.lang]}{this.props.field.optional ? '' : ' (*)'}</label>
        {renderHelpers.errorOrInfo.apply( this )}
        <ul>
          <li>
            { this.renderField() }
          </li>
        </ul>
      </div>;

    },

    validate: function( value ) {

      if ( value === undefined ) value = '';

      if ( !this.props.optional && !( value + '').length ) {

        return {
          field: this.props.field,
          label: this.props.label[ this.props.lang ],
          message: this.message( ERR.NOTEMPTY )
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