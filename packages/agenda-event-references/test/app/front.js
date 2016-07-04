"use strict";

const config = require( '../../testconfig' ),

du = require( 'dom-utils' ),

React = require( 'react' ),

ReactDom = require( 'react-dom' ),

//Show = require( '../../react/src/Show' ),

Editor = require( '../../react/src/Editor' );

let Wrapper;

window.onload = () => { ReactDom.render( <Wrapper />, du.el( '.js_canvas' ) ); }

Wrapper = React.createClass( {

  render() {

    return <div>
      <div className="top-margined wsq">
        <div className="content">
          
        </div>
      </div>
      <div className="top-margined wsq">
        <div className="content">
          <Editor initUids={[111]} />
        </div>
      </div>
    </div>

  }

} );