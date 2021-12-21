"use strict";

const du = require( '@openagenda/dom-utils' );
const React = require( 'react' );
const ReactDom = require( 'react-dom' );
const createReactClass = require( 'create-react-class' );
const { Modal } = require( '@openagenda/react-shared' );
const labels = require( '@openagenda/labels/event/remove' );

let warningThis, lang = 'en';

module.exports = ( canvas, elems, l ) => {

  let div = document.createElement( 'div' );

  canvas.insertAdjacentElement( 'beforeend', div );

  ReactDom.render( <WarningModal />, div );

  lang = l;

  du.forEach( elems, elem => {

    du.addEvent( elem, 'click', e => {

      e.preventDefault();

      setTimeout( () => {

        warningThis.displayModal( true, elem.getAttribute( 'href' ), !!elem.hasAttribute('data-delete') );

      }, 50 );

    } );

  } );

}


const WarningModal = createReactClass( {

  getInitialState: function() {

    warningThis = this;

    return {
      display: false,
      link: '#'
    }

  },

  displayModal: function( display, link = '#', isDelete = false ) {

    this.setState( {
      display,
      link,
      isDelete
    } );

  },

  render: function() {
    const isDelete = this.state.isDelete;

    return this.state.display ? <Modal onClose={() => this.displayModal( false )} title={labels[isDelete ? 'eventDeleteTitle' : 'eventRemoveTitle'][lang]}>
      <p className="text-center margin-top-sm">{labels[isDelete ? 'eventDeleteDetails' : 'eventRemoveDetails'][lang]}</p>
      <div className="text-center margin-top-md">
        <a className="btn btn-primary" href={this.state.link}>{labels.confirm[lang]}</a>
      </div>
    </Modal> : null;
  }

});
