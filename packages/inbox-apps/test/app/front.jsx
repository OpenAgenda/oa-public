import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import du from '@openagenda/dom-utils';
import dl from '@openagenda/dom-utils/documentLocation';
import inboxApp from '../../src/apps/inbox';
import lazyInboxApp from '../../src/apps/lazyInbox';
import conversationFormApp from '../../src/apps/conversationForm';
// import openConversationForm from '../../src/apps/conversationForm/openConversationForm';

window.onload = () => {

  const renderApp = ( app, options ) => {
    ReactDOM.hydrate(
      app( _.merge( {}, du.parseJsonAttribute( 'body', 'data-options' ), options ) ),
      du.el( '.js_canvas' )
    );
  };

  switch ( dl.getQueryPart( '_app', 'agendaAdmin' ) ) {
    case 'agendaAdmin':
      return renderApp( inboxApp, { selectMenuItem: true } );
    case 'user':
      return renderApp( inboxApp );
    case 'event': {
      lazyInboxApp( {
        selector: '.js_inbox_event',
        state: {
          settings: {
            prefix: '/',
            lang: 'fr',
            apiRoot: '',
            perPageLimit: 20,
            // Specific to this app
            allowCreateConversation: true,
            initialValues: {
              destinationInbox: {
                type: 'agenda',
                identifier: 90049545
              },
              type: 'event',
              typeIdentifier: 8798421,
              params: {}
            },
          },
          res: {
            inboxHome: '/?_app=event',
            conversations: {
              create: '/agenda/90049545/conversations', // with initialValues.typeIdentifier
              list: '/event/:eventUid/conversations', // with initialValues.typeIdentifier
              action: '/event/:eventUid/conversations/:conversationId/action/:code',
            },
            messages: {
              list: '/event/:eventUid/conversations/:conversationId/messages',
              create: '/event/:eventUid/conversations/:conversationId/messages'
            }
          },
          agenda: {
            id: 12288,
            uid: 90049545
          },
          event: {
            id: 45678,
            uid: 8798421
          }
        }
      } );
    }
    case 'conversationForm': {
      // openConversationForm( { lang: 'fr', subject: 'invitationMessage', agenda: 'test' } );

      conversationFormApp();

      du.addEvent( du.el( '#raw-conversation-form' ), 'click', window.openConversationForm );
    }
  }

};
