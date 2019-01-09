import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import createApp from '../src/client';
import openRequestForm from '../src/client/openRequestForm';

import '@openagenda/bs-templates/compiled/main.css';


class Wrapper extends Component {
  componentDidMount() {
    const { onDidMount } = this.props;

    const canvas = document.querySelector( '.js_call_to_action_canvas' );

    if ( canvas ) {
      canvas.remove();
    }

    createApp();

    if ( onDidMount ) {
      onDidMount();
    }
  }

  render() {
    return this.props.children;
  }
}


storiesOf( 'Call to action', module )
  .add( 'data-* attributes', () => {
    return (
      <Wrapper>
        <div className="js_call_to_action btn btn-link" data-subject="aggregator" data-agenda="federation-aqua-poney">
          Cliquez ici !
        </div>
      </Wrapper>
    );
  } )
  .add( 'event listener', () => {
    return (
      <Wrapper
        onDidMount={() => {
          document
            .querySelector( '#raw-call-to-action' )
            .addEventListener( 'click', openRequestForm );
        }}
      >
        <div
          id="raw-call-to-action"
          className="btn btn-link"
          data-subject="raw-request"
          data-agenda="fete-des-petits-poneys"
        >
          Brut !
        </div>
      </Wrapper>
    );
  } );
