"use strict";

import React, { Component } from 'react';
const ReactDom = require( 'react-dom' );
const update = require( 'react-addons-update' );
const List = require( '../../components/List' );
const Modal = require( '../../components/Modal' );

class Wrapper extends Component {

  state = {
    modal: false
  };

  displayModal = bool => {
    this.setState( {
      modal: bool
    } );
  };

  render() {
    const items = [
      {
        title: 'First post',
        owner: 'bibiche'
      },
      {
        title: 'First blowjob',
        owner: 'pupuce'
      },
      {
        title: 'First fisting',
        owner: 'pupute'
      }
    ];

    return (

      <div>
        <h2>Simple List</h2>
        <List
          items={items}
          renderItem={( item, i ) =>
            <div key={i}>
              <strong>{item.title}</strong> by{' '}
              <small><strong>{item.owner}</strong></small>
            </div>}
        />

        <hr />

        <div>
          <button onClick={() => this.displayModal( true )}>
            Clique ici pour ouvrir un joli modal au milieu de la page... Et puis clique sur j'aime et partage !
          </button>

          <Modal
            title="Wahou"
            visible={this.state.modal}
            onClose={() => this.displayModal( false )}
            classNames={{ overlay: 'popup-overlay big' }}
          >
            <p>Wahou, je suis bluffé</p>
            <img src="http://m.memegen.com/fptbj1.jpg" alt="wahou" style={{ maxWidth: '100%' }} />
          </Modal>
        </div>

      </div>

    );

  }

}


window.onload = function () {

  ReactDom.render( <Wrapper />, document.getElementsByClassName( 'js_canvas' )[ 0 ] );

};