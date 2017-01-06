"use strict";

const du = require( 'dom-utils' );
const React = require( 'react' );
const ReactDom = require( 'react-dom' );
const Modal = require( 'react-components/build/Modal' );
const labels = require( 'labels/agenda-admin-events/list' );

let warningThis, lang = 'en';

module.exports = ( canvas, elems, l ) => {

  ReactDom.render( <WarningModal />, canvas );

  lang = l;

  du.forEach( elems, elem => {

    du.addEvent( elem, 'click', e => {

      e.preventDefault();

      setTimeout( () => {

        warningThis.displayModal( true, elem.getAttribute( 'href' ) );

      }, 50 );
      
    } );

  } );

}


const WarningModal = React.createClass( {

  getInitialState: function() {

    warningThis = this;

    return {
      display: false,
      link: '#'
    }

  },

  displayModal: function( display, link = '#' ) {

    this.setState( {
      display,
      link
    } );

  },

  render: function() {

    return this.state.display ? <Modal onClose={() => this.displayModal( false )} title={labels.removeEventTitle[ lang ]}>
      <p className="text-center margin-top-sm">{labels.removeEventDetails[lang]}</p>
      <div className="text-center margin-top-md">
        <a className="btn btn-primary" href={this.state.link}>{labels.removeEventConfirm[lang]}</a>
      </div>
    </Modal> : null;
    
  }

} );