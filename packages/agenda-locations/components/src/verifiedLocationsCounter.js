/**
 * this little module fetches the count
 * of locations to be verfied for a specific
 * agenda. The ressource it fetches the count
 * from is given in the data-options of the anchor
 * element
 */

"use strict";

const _ = {
  extend: require( 'lodash/extend' )
};
const createReactClass = require( 'create-react-class' );
const React = require( 'react' );
const ReactDom = require( 'react-dom' );

const get = require( '@openagenda/utils/get' );

const anchor = 'js_locations_counter';

if ( !window.oa ) window.oa = {};

let anchorElem,

  defaults = {
    res: '#restocounterresource'
  },

  Counter;

window.addEventListener( 'load', () => {

  anchorElem = document.getElementsByClassName( anchor )[ 0 ];

  if ( !_checkReqs() ) return;

  const params = {
    res: anchorElem.getAttribute( 'data-res' )
  };

  ReactDom.render( <Counter res={params.res} />, anchorElem );

} );

Counter = createReactClass( {

  getInitialState() {

    window.oa.verifiedLocationsCounter = this.sync;

    return {
      count: null
    }

  },

  componentWillMount() {

    this.sync();

  },

  sync() {

    get( this.props.res, ( err, result ) => {

      if ( err ) return console.log( 'error', err );

      this.setState( {
        count: result.count || null
      } );

    } );

  },

  render() {

    if ( !this.state.count ) return <span></span>;

    return <span className="badge badge-warning">{ this.state.count }</span>

  }

} );


function _checkReqs() {

  if ( !anchorElem ) {

    console.log( 'error', 'no anchor element was found for verified location counter' );

    return false;

  }

  return true;

}
