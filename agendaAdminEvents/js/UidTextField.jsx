"use strict";

var React = require('react'),

utils = require( 'utils' ),

get = require( 'utils/get' ); 

module.exports = function( textName, uidName ) {

  return React.createClass( {

    propTypes: {
      res: React.PropTypes.string,
      getQueryPart: React.PropTypes.func,
      onChange: React.PropTypes.func,
      onKeyUp: React.PropTypes.func,
      placeholder: React.PropTypes.string
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

        onKeyUp={this.props.onKeyUp} />

    }

  } );

}