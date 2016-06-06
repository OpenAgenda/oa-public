"use strict";

var React = require('react'),

utils = require( 'utils' ),

get = require( 'utils/get' ); //function( res, data, cb )

module.exports = React.createClass( {


  propTypes: {

    res: React.PropTypes.object,
    getQueryPart: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    placeholder: React.PropTypes.string

  },


  getInitialState: function() {


    return {

      value: this.props.getQueryPart( 'locationName' )

    }


  },


  componentDidMount: function() {


    var self = this,


    locationUid = this.props.getQueryPart( 'locationUid' ),


    res = this.props.res.location;


    if ( !locationUid ) return;


    get( res.replace( ':uid', locationUid ), function( err, data ) {


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


});