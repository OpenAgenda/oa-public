"use strict";

var React = require( 'react' ),

TextField = require( './textField.react.js' ),

CheckboxField = require( './checkboxField.react.js' ),

RadioFields = require( './radioFields.react.js' ),

cn = require( '../../js/lib/common/common.mod' ),

defaults = {
  canvas: '.js_form_canvas',
  fields: [],
  lang: 'fr',
  events: {
    get: 'ecustomfieldsfetch',
    send: 'ecustomfieldssend'
  }
},

eh;

module.exports = function( options ) {

  var params = cn.extend( {}, defaults, options ),

  fields = typeof params.fields == 'string' ? JSON.parse( params.fields ) : params.fields,

  _update = function( v ) {

    window.sEventHandler.getInstance().trigger( params.events.send, v );

  };

  React.render(
    <CustomFields fields={fields} lang={params.lang} update={ _update } />,
    _createReactCanvas( cn.el( params.canvas ) ) 
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

    var update = cn.extend( {}, this.state );

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

      if ( [ 'integer', 'text', 'textarea' ].indexOf( field.fieldType ) !== -1 ) {

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

function _createReactCanvas( parent ) {

  var div = document.createElement( 'div' );

  parent.appendChild( div );

  return div;

}