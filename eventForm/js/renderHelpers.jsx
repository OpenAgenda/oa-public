"use strict";

var React = require( 'react' ),

Counter = require( './Counter.jsx' ),

du = require( '../../js/lib/domUtils' ),

utils = require( 'utils' );

module.exports = {
  multilingual: {
    render: mRender,
    block: mBlock
  },
  renderInfo: renderInfo,
  renderError: renderError,
  errorOrInfo: errorOrInfo
}



function mBlock( l ) {

  var value,

  count = this.props.languages.length;

  if ( typeof this.props.value == 'string' ) {

    value = this.props.value;

  } else {

    value = this.props.value ? ( this.props.value[ l ] ? this.props.value[ l ] : '' ) : '';

  }

  if ( count > 1 ) {

    return <li className='lang-unit'>
      <label>{l}</label>
      <div>
        {this.renderField( value, l )}
        {renderError.call( this, l )}
        {_counter( this.props, value )}
      </div>
    </li>

  } else {

    return <div>
      { this.renderField( value, l ) }
      {renderError.call( this, l )}
      { _counter( this.props, value ) }
    </div>;

  }

}

function errorOrInfo() {

  var errorRender = renderError.call( this );

  if ( errorRender ) return errorRender;

  return renderInfo.call( this );
  
}

function renderError( l ) {

  var message = false;

  if ( !this.state.userHasTyped ) return;

  if ( !this.props.error ) return;

  message = l ? this.props.error[ l ] : this.props.error;

  if ( !message ) return;

  return <span className="error">{message}</span>;

}


function renderInfo() {

  if ( !this.props.info ) return;

  var infos = this.props.info[this.props.lang].split( '\n' );

  return <span className="info">
    {infos.map( function( info ) { return <span>{info}</span> } )}
  </span>

}

function mRender() {

  if ( this.props.languages.length > 1 ) {

    return <ul>
      <li>
        <label>{this.props.label[this.props.lang]}{ this.props.optional ? '' : ' (*)' }</label>
        {renderInfo.call( this )}
      </li>
      {this.props.languages.map(this.renderBlock)}
    </ul>

  } else {

    return <ul>
      <li>
        <label>{this.props.label[this.props.lang]}{ this.props.optional ? '' : ' (*)' }</label>
        { renderInfo.call( this ) }
        {this.props.languages.map(this.renderBlock)}
      </li>
    </ul>

  }

}


function _counter( props, value ) {

  var max = props.constraints && props.constraints.max ? props.constraints.max : false;

  if ( !max ) return;

  return <Counter max={max} value={value} />;

}