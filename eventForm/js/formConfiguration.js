"use strict";

const _ = {
  get: require( 'lodash/get' ),
  extend: require( 'lodash/extend' )
};

module.exports = function( formConfiguration, options ) {

  var params = _.extend( {
    lang: 'en',
  }, options );

  return {
    field: field
  }

  function field( name ) {

    var configuration = getConfiguration();

    return _.extend( {}, configuration, {
      getLabel: getLabel,
      getPlaceholder: getPlaceholder,
      getInfo: getInfo,
      display: display,
      fixed: fixed,
      get: get
    } );

    function getConfiguration() {

      var fields = formConfiguration.fields || [],

      fieldConfiguration = fields.filter( function( f ) {

        return f.name == name;

      } );

      if ( !fieldConfiguration.length ) return false;

      return fieldConfiguration[ 0 ];

    }

    function get( namespace, defaultValue ) {

      return _.get( configuration, namespace, defaultValue );

    }

    function getLabel( translated, defaults ) {

      if ( configuration && configuration.label ) {

        return translated ? configuration.label[ params.lang ] : configuration.label;

      }

      if ( !defaults ) return null;

      return translated ? defaults[ name ][ params.lang ] : defaults[ name ];

    }

    function getPlaceholder( translated, defaults ) {

      if ( configuration && configuration.placeholder ) {

        return translated ? configuration.placeholder[ params.lang ] : configuration.placeholder;

      }

      if ( !defaults ) return null;

      return translated ? defaults[ name + 'Placeholder' ][ this.props.lang ] : defaults[ name + 'Placeholder' ];

    }

    function getInfo( translated, defaults ) {

      if ( configuration && configuration.info ) {

        return translated ? configuration.info[ params.lang ] : configuration.info;

      }

      if ( !defaults ) return null;

      return translated ? defaults[ name + 'Info' ][ this.props.lang ] : defaults[ name + 'Info' ];

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