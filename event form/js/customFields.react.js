"use strict";

var React = require( 'react' ),

TextField = require( './textField.react.js' ),

CheckboxField = require( './checkboxField.react.js' ),

RadioFields = require( './radioFields.react.js' ),

rUtils = require( './reactUtils' ),

defaults = {
  canvas: '.js_form_canvas',
  fields: [],
  lang: 'fr',
  events: {
    get: 'ecustomfieldsfetch',
    send: 'ecustomfieldssend'
  }
};

module.exports = function( options ) {

  var params = rUtils.extend( {}, defaults, options ),

  fields = typeof params.fields == 'string' ? JSON.parse( params.fields ) : params.fields;

  React.render(
    <CustomFields fields={fields} lang={params.lang} update={ rUtils.ehUpdate( params.events.send ) } />,
    rUtils.createCanvas( rUtils.el( params.canvas ) ) 
  );

}

var CustomFields = React.createClass({

  // state is basically just the value of each field,
  // indexed by field name
  getInitialState: function() {

    var fieldValues = {};

    for ( var i in this.props.fields ) {

      fieldValues[ this.props.fields[ i ].name ] = {
        value: this.props.fields[ i ].value,
        error: this.props.fields[ i ].error,
        label: this.props.fields[ i ].label
      };

    }
    
    return fieldValues;

  },

  componentDidUpdate: function() {

    var update = rUtils.extend( {}, this.state );

    for ( var i in this.props.fields ) {

      update[ this.props.fields[ i ].name ].label = this.props.fields[ i ].label[ this.props.lang ];
    
    }

    this.props.update( update );

  },

  fieldValueUpdater: function( field ) {

    var self = this;

    return function( value, error ) {

      var obj = {};

      obj[ field ] = {
        value: value,
        error: error
      }

      self.setState( obj );

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

        return <TextField 
          field= { field } 
          lang= { self.props.lang } 
          type= { field.fieldType } 
          value= { self.state[ field.name ].value } 
          error= { self.state[ field.name ].error } 
          handleUpdate= { self.fieldValueUpdater( field.name ) } />;

      } else if ( field.fieldType == 'checkbox' ) {

        return <CheckboxField
          field= { field }
          lang= { self.props.lang } 
          value= { self.state[ field.name ].value }
          handleUpdate= { self.fieldValueUpdater( field.name ) } />;

      } else if ( field.fieldType == 'radio' ) {

        return <RadioFields
          field= { field }
          lang= { self.props.lang }
          value= { self.state[ field.name ].value }
          error= { self.state[ field.name ].error }
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