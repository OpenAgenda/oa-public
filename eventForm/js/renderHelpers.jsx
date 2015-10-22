"use strict";

var React = require( 'react' ),

Counter = require( './Counter.jsx' ),

du = require( '../../js/lib/domUtils' ),

utils = require( 'utils' );

module.exports = {
  multilingual: {
    render: mRender,
    block: mBlock,
    error: mError
  },
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
        {_counter( this.props, value )}
        {this.renderError( l )}
      </div>
    </li>

  } else {

    return <div>
      { this.renderField( value, l ) }
      { _counter( this.props, value ) }
      {this.renderError( l )}
    </div>;

  }

}

function mError( l ) {

  if ( this.props.error && this.props.error[ l ] && this.state.userHasTyped ) {

    return <span className="error">{ this.props.error[ l ] }</span>;

  }

  return '';

}

function errorOrInfo() {

  var infos, 

  error = utils.isArray( this.props.error ) ? this.props.error[ 0 ] : this.props.error;

  if ( error && this.state.userHasTyped ) {
    
    return <span className="error">{error.message}</span>;

  } else if ( this.props.info ) {

    infos = this.props.info[this.props.lang].split( '\n' );

    return <span className="info">
      {infos.map( function( info ) { return <span>{info}</span> } )}
    </span>

  }

  return '';

}

function mRender() {

  if ( this.props.languages.length > 1 ) {

    return <ul className="cform">
      <li>
        <label>{this.props.label[this.props.lang]}{ this.props.optional ? '' : ' (*)' }</label>
        {errorOrInfo.apply( this )}
      </li>
      {this.props.languages.map(this.renderBlock)}
    </ul>

  } else {

    return <ul className="cform">
      <li>
        <label>{this.props.label[this.props.lang]}{ this.props.optional ? '' : ' (*)' }</label>
        { errorOrInfo.apply( this ) }
        { this.props.info && !( this.props.error && this.state.userHasTyped ) ? <span className="info">{this.props.info[this.props.lang]}</span> : '' }
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