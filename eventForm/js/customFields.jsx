"use strict";

var React = require( 'react' ),

TextField = require( './textField.jsx' ),

CheckboxField = require( './checkboxField.jsx' ),

RadioFields = require( './radioFields.jsx' ),

rUtils = require( './reactUtils' ),

defaults = {
  canvas: '.js_form_canvas',
  fields: [],
  labelsLang: 'fr',
  events: {
    get: 'ecustomfieldsfetch',
    send: 'ecustomfieldssend',
    languageChange: 'languagechange',
    fetchLanguages: 'languagesfetch'
  }
};

module.exports = function( options ) {

  var params = rUtils.extend( {}, defaults, options ),

  fields = typeof params.fields == 'string' ? JSON.parse( params.fields ) : params.fields;

  React.render( <CustomFields
    fields={ fields }
    labelsLang={ params.labelsLang }
    update={ rUtils.ehUpdate( params.events.send ) }
    defaultLanguage= { params.defaultLanguage }
    languageChange={ rUtils.ehSubscriber( params.events.languageChange ) } />,
    rUtils.createCanvas( rUtils.el( params.canvas ) ) 
  );

  // for init using legacy event form, languages are fetched through eh
  rUtils.eh.trigger( params.events.fetchLanguages, function( err, languages ) {

    rUtils.eh.trigger( params.events.languageChange, {
      set: languages,
      selected: params.defaultLanguage
    });

  } );

}

var CustomFields = React.createClass({

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

    var update = rUtils.extend( {}, this.state.fields );

    for ( var i in this.props.fields ) {

      update[ this.props.fields[ i ].name ].label = this.props.fields[ i ].label[ this.props.labelsLang ];
    
    }

    this.props.update( update );

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
            labelsLang= { self.props.labelsLang } 
            type= { field.fieldType } 
            value= { self.state.fields[ field.name ].value } 
            error= { self.state.fields[ field.name ].error }
            languages= { self.state.languages }
            onChange= { self.fieldValueUpdater( field.name ) }/>;

        } else {

          return <TextField 
            field= { field } 
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
        <ul className="cform">{this.props.fields.map( createField )}</ul>
        <div className="separator"></div>
      </div>
    );

  }

});