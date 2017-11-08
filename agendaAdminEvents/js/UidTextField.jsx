"use strict";

var React = require('react'),

createReactClass = require( 'create-react-class' ),

PropTypes = require( 'prop-types' ),

utils = require( '@openagenda/utils' ),

get = require( '@openagenda/utils/get' ); 

module.exports = function( textName, uidName ) {

  return createReactClass( {

    propTypes: {
      res: PropTypes.string,
      getQueryPart: PropTypes.func,
      onChange: PropTypes.func,
      onKeyUp: PropTypes.func,
      placeholder: PropTypes.string
    },

    getInitialState: function() {

      return {
        value: this.props.getQueryPart( textName )
      }

    },

    componentDidMount: function() {

      var self = this,

      uid = this.props.getQueryPart( uidName ),

      res = this.props.res;

      if ( !uid ) return;

      get( res.replace( ':uid', uid ), function( err, data ) {

        if ( err ) return console.error( err );

        if ( data === null ) return;

        self.setState( { value: data.name } );

      } );

    },

    onChange: function( e ) {

      this.setState( {

        value: e.target.value

      } );

      this.props.onChange( e );

    },

    render: function() {

      return <input

        className="form-control"

        placeholder={this.props.placeholder}

        value={this.state.value}

        onChange={this.onChange}

        onBlur={this.props.onBlur}

        onKeyUp={this.props.onKeyUp} />

    }

  } );

}