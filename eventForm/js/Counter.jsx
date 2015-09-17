"use strict";

var React = require( 'react' );

module.exports = React.createClass({

  render: function() {

    var diff = this.props.max-this.props.value.length;

    return <span className={'counter' + (diff<0?' error':'')}>{diff}</span>

  }

});