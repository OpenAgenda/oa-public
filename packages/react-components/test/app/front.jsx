"use strict";

window.onload = function() {

  ReactDom.render( <Wrapper />, document.getElementsByClassName( 'js_canvas' )[ 0 ] );

};

var React = require( 'react' ),

  ReactDom = require( 'react-dom' ),

  update = require( 'react-addons-update' ),

  Wrapper = React.createClass( {

    onChange: function( name, value ) {

      var change = { values: {} };

      change.values[ name ] = { $set: value };

      this.setState( update( this.state, change ) );

    },

    render: function() {

      return <div>

        <div className="separator"></div>

        <div className="separator"></div>

      </div>

    }

  } );