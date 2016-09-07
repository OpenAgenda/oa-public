"use strict";

var utils = require( 'utils' );

module.exports = function( formConfiguration, options ) {

  var params = utils.extend( {
    lang: 'en',
  }, options );

  return {
    field: field
  }

  function field( name ) {

    var configuration = getConfiguration();

    return utils.extend( {}, configuration, {
      getLabel: getLabel,
      getPlaceholder: getPlaceholder,
      display: display,
      fixed: fixed 
    } );

    function getConfiguration() {

      var fields = formConfiguration.fields || [],

      fieldConfiguration = fields.filter( function( f ) {

        return f.name == name;

      } );

      if ( !fieldConfiguration.length ) return false;

      return fieldConfiguration[ 0 ];

    }

    function getLabel( translated, defaults ) {

      if ( configuration && configuration.label ) {

        return translated ? configuration.label[ params.lang ] : configuration.label;

      }

      return translated ? defaults[ name ][ params.lang ] : defaults[ name ];

    }

    function getPlaceholder( translated, defaults ) {

      if ( configuration && configuration.placeholder ) {

        return translated ? configuration.placeholder[ params.lang ] : configuration.placeholder;

      }

      return translated ? defaults[ name + 'Placeholder' ][ this.props.lang ] : defaults[ name + 'Placeholder' ];

    }

    function display( defaultValue ) {

      if ( defaultValue === undefined ) defaultValue = true;      

      if ( !configuration || configuration.display === undefined ) return defaultValue;

      return configuration.display;

    }


    function fixed() {

      if ( !configuration || configuration.fixed === undefined ) return false;

      return configuration.fixed;

    }

  }

}