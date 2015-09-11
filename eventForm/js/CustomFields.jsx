"use strict";

var React = require( 'react' ),

TextField = require( './TextField.jsx' ),

MultilingualTextField = require( './MultilingualTextField.jsx' ),

CheckboxField = require( './CheckboxField.jsx' ),

RadioFields = require( './RadioFields.jsx' );

module.exports = React.createClass({

  onChange: function( field ) {

    var self = this;

    return function( value, error ) {

      var values = JSON.parse( JSON.stringify( self.props.values ) ),

      errors = JSON.parse( JSON.stringify( self.props.errors ) );

      values[ field ] = value;

      errors[ field ] = error;

      self.props.onChange( values, errors );

    }

  },

  isValid: function() {

    var valid = true;

    for( var f in this.state ) {

      if ( this.state[ f ].error ) valid = false;

    }

    return valid;

  },

  render: function() {

    var self = this,

    createField = function( field ) {

      if ( [ 'integer', 'text', 'textarea', 'number', 'url', 'email' ].indexOf( field.fieldType ) !== -1 ) {

        if ( field.multilingual ) {

          return <MultilingualTextField
            constraints= { field } 
            label= { field.label }
            info= { field.info }
            optional= { field.optional }
            lang= { self.props.lang } 
            type= { field.fieldType } 
            value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : {} }
            error= { self.props.errors[ field.name ] || false }
            languages= { self.props.languages }
            onChange= { self.onChange( field.name ) }/>;

        } else {

          return <TextField 
            constraints= { field }
            label= { field.label }
            info= { field.info } 
            optional= { field.optional }
            lang= { self.props.lang } 
            type= { field.fieldType } 
            value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
            error= { self.props.errors[ field.name ] || false }
            onChange= { self.onChange( field.name ) } />;

        }

      } else if ( field.fieldType == 'checkbox' ) {

        return <CheckboxField
          field= { field }
          lang= { self.props.lang } 
          value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
          handleUpdate= { self.onChange( field.name ) } />;

      } else if ( field.fieldType == 'radio' ) {

        return <RadioFields
          field= { field }
          lang= { self.props.lang }
          value= { self.props.values[ field.name ] ? self.props.values[ field.name ] : '' }
          error= { self.props.errors[ field.name ] || false }
          handleUpdate= { self.onChange( field.name ) } />;

      }

    };

    return (
      <div>
        {this.props.fields.map( createField )}
        <div className="separator"></div>
      </div>
    );

  }

});