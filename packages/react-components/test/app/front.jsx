"use strict";

import React, { Component } from 'react';
import ReactDom from 'react-dom';
import List from '../../components/List';
import Modal from '../../components/Modal';
import MoreInfo from '../../components/MoreInfo';
import Spinner from '../../components/Spinner';

class Wrapper extends Component {

  state = {
    modal: false,
    pageSpin: false
  };

  displayModal = bool => {

    this.setState( {
      modal: bool
    } );

  }

  startPageSpin() {

    this.setState( { pageSpin: true } );

    setTimeout( () => {

      this.setState( { pageSpin: false } );

    }, 2000 );

  }

  render() {

    const items = [
      {
        title: 'Efficacité',
        owner: 'jeff'
      },
      {
        title: 'Fiabilité',
        owner: 'steve'
      },
      {
        title: 'Top Contrôle',
        owner: 'ted'
      }
    ];

    return (

      <div>

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
        </div>

        <div className="separator"></div>

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

        <div className="margin-top-sm">
          <p>Juste un contenu en texte</p>
          <MoreInfo
            id="first-popover"
            content="N'importe quoi par là"
          />

          <p>Titre + contenu en texte</p>
          <MoreInfo
            id="second-popover"
            title="Un petit titre ici"
            content="N'importe quoi par là"
            placement="top"
          />

          <p>Avec un lien en plus</p>
          <MoreInfo
            id="third-popover"
            title="Un petit titre ici"
            content="N'importe quoi par là"
            link="https://openagenda.zendesk.com/"
            placement="bottom"
          />

          <p>Avec un p'tit t'enfant</p>
          <MoreInfo
            id="fourth-popover"
            content="Ce badge est un badge !"
          >
            <div className="badge">Un badge !</div>
          </MoreInfo>
        </div>

        <div className="separator"></div>

        <h2>Spinner</h2>

        <p><Spinner mode="inline" message="this is an inline spinner" /></p>

        <p>Simple central spinner</p>
        <div style={{ height: '140px', position: 'relative', border: '1px solid #ccc' }}>

          <Spinner />

        </div>

        <p>Spinner with a message</p>

        <div style={{ height: '140px', position: 'relative', border: '1px solid #ccc' }}>

          <Spinner message="Look ma', I'm spinning! Weeee!" />

        </div>

        <p>Full page spinner</p>

        <button onClick={() => this.startPageSpin()}>Launch page spinner</button>

        {this.state.pageSpin ? <Spinner page={true} message="this will close soon" /> : null }

      </div>

    );

  }

}


window.onload = function () {

  ReactDom.render( <Wrapper />, document.getElementsByClassName( 'js_canvas' )[ 0 ] );

};