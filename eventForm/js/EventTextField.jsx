"use strict";

var React = require( 'react' )

module.exports = React.createClass( {

  onChange: function( l ) {

    var self = this;

    return function( e ) {

      var changed = JSON.parse( JSON.stringify( self.props.initValue ) );

      changed[ l ] = e.target.value;

      self.props.onChange( changed );

    }

  },

  render: function() {

    var self = this,

    count = this.props.languages.length,

    renderField = function( l ) {

      return <li className={count>1?'lang-unit':''}>
        {count>1?<label>{l}</label>:''}
        <div>
          <input type="text" value={self.props.initValue[ l ]} onChange={self.onChange( l )} />
        </div>
      </li>

    };

    return <ul className="cform">
      <li><label>{this.props.label} (*)</label></li>
      {this.props.languages.map(renderField)}
    </ul>

  }

} )