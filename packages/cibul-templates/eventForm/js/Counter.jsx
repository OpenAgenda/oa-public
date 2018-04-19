"use strict";

var React = require( 'react' ),

  createReactClass = require( 'create-react-class' );

module.exports = createReactClass({

  render: function() {

    var diff = this.props.max-this.props.value.length;

    return <span className={'counter' + (diff<0?' error':'')}>{diff}</span>

  }

});