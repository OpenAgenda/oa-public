import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { shallow, render, mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider, connect } from 'react-redux';
import { compose, withContext } from 'recompose';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/inboxes';
import fixturesData from './01_ConversationTitle.data';

import { ConversationTitle } from '../src/components';

const mockStore = configureStore();
let store;

function wrapWithApp( element ) {
  const WrappedComponent = compose(
    connect( state => ({
      settings: state.settings
    }) ),
    withContext(
      {
        lang: PropTypes.string,
        getLabel: PropTypes.func
      },
      ( { settings } ) => ({
        lang: settings.lang,
        getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, settings.lang )
      })
    )
  )( () => element );

  return (
    <Provider store={store}>
      <WrappedComponent/>
    </Provider>
  );
}

const user = {
  culture: 'fr',
  uid: 31046551,
  name: 'Kévin Berthommier - OpenAgenda',
  thumbnail: null
};
const conversation = {
  id: 135,
  type: 'event',
  typeIdentifier: 25404061,
  store: {
    params: {
      agendaTitle: 'Test convs 12622',
      eventTitle: 'Contactez-moi !',
      agendaUid: 17388451
    }
  },
  createdAt: '2018-02-02T15:57:40.000Z',
  updatedAt: null,
  resolvedAt: null,
  closedAt: null,
  inboxContextId: 62817,
  creatorInboxUser: {
    id: 68431,
    inboxId: 62817,
    userUid: 31046551,
    leftAt: null,
    uid: 31046551,
    name: 'Kévin Berthommier - OpenAgenda',
    avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
  creatorInbox: {
    id: 62817,
    type: 'agenda',
    identifier: 17388451,
    uid: 17388451,
    name: 'Test convs 12622',
    avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
  latestMessage: {
    id: 214,
    conversationId: 135,
    body: 'Salut !',
    createdAt: '2018-02-02T15:57:40.000Z',
    inboxUser: {
      id: 68431,
      inboxId: 62817,
      userUid: 31046551,
      leftAt: null,
      uid: 31046551,
      name: 'Kévin Berthommier - OpenAgenda',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    inbox: {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    }
  },
  inboxes: [
    {
      id: 152,
      type: 'user',
      identifier: 7339049,
      uid: 7339049,
      name: 'Yacine Bensalem - OpenAgenda',
      avatar: 'https://cibuldev.s3.amazonaws.com/profile7339049.jpg'
    },
    {
      id: 62817,
      type: 'agenda',
      identifier: 17388451,
      uid: 17388451,
      name: 'Test convs 12622',
      avatar: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    }
  ],
  actions: [
    {
      code: 'default',
      label: {
        fr: 'Fermer la conversation',
        en: 'Close the conversation'
      },
      kind: 'success'
    }
  ]
};

function makeTest( state, props ) {
  store = mockStore( state );

  const wrapper = mount( wrapWithApp(
    <ConversationTitle {...props} />
  ) );

  expect( wrapper.text() ).to.matchSnapshot();
}


describe( 'conversation of type event', () => {

  describe( 'context event', () => {
    it( 'created by me, destinated to a user', () => {
      const initialState = {
        settings: {
          lang: 'fr',
          context: 'event'
        }
      };

      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'event',
        creator: true,
        destination: 'user'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by me, not destinated to a user', () => {
      //
    } );

    it( 'created by someone else, destinated to me or my agenda', () => {
      //
    } );

    it( 'created by someone else, not destinated to me or my agenda', () => {
      //
    } );

  } );

} );
