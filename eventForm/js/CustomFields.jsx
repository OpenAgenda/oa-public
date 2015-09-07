"use strict";

var React = require( 'react' ),

TextField = require( './TextField.jsx' ),

MultilingualTextField = require( './MultilingualTextField.jsx' ),

CheckboxField = require( './CheckboxField.jsx' ),

RadioFields = require( './RadioFields.jsx' );

module.exports = React.createClass({

  getInitialState: function() {

    var fieldValues = {};

    for ( var i in this.props.fields ) {

      fieldValues[ this.props.fields[ i ].name ] = {
        value: this.props.fields[ i ].value,
        error: this.props.fields[ i ].error,
        label: this.props.fields[ i ].label
      };

    }

    return {
      languages: [ this.props.defaultLanguage ],
      currentLanguage: this.props.defaultLanguage,
      fields: fieldValues
    }

  },

  componentDidUpdate: function() {

    var update = JSON.parse( JSON.stringify( this.state.fields ) );

    for ( var i in this.props.fields ) {

      update[ this.props.fields[ i ].name ].label = this.props.fields[ i ].label[ this.props.labelsLang ];
    
    }

    this.props.onChange( update );

  },

  fieldValueUpdater: function( field ) {

    var self = this;

    return function( value, error ) {

      var fields = self.state.fields;

      fields[ field ] = {
        value: value,
        error: error
      }

      self.setState( {
        fields: fields
      } );

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
            field= { field } 
            label= { field.label }
            info= { field.info }
            labelsLang= { self.props.labelsLang } 
            type= { field.fieldType } 
            value= { self.state.fields[ field.name ].value } 
            error= { self.state.fields[ field.name ].error }
            languages= { self.state.languages }
            onChange= { self.fieldValueUpdater( field.name ) }/>;

        } else {

          return <TextField 
            field= { field } 
            label= { field.label }
            info= { field.info } 
            labelsLang= { self.props.labelsLang } 
            type= { field.fieldType } 
            value= { self.state.fields[ field.name ].value } 
            error= { self.state.fields[ field.name ].error }
            handleUpdate= { self.fieldValueUpdater( field.name ) } />;

        }

      } else if ( field.fieldType == 'checkbox' ) {

        return <CheckboxField
          field= { field }
          labelsLang= { self.props.labelsLang } 
          value= { self.state.fields[ field.name ].value }
          handleUpdate= { self.fieldValueUpdater( field.name ) } />;

      } else if ( field.fieldType == 'radio' ) {

        return <RadioFields
          field= { field }
          labelsLang= { self.props.labelsLang }
          value= { self.state.fields[ field.name ].value }
          error= { self.state.fields[ field.name ].error }
          handleUpdate= { self.fieldValueUpdater( field.name ) } />;

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