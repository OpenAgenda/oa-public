import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider, connect } from 'react-redux';
import { compose } from 'recompose';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/inboxes';
import fixturesData from './01_ConversationTitle.data';

import { ConversationTitle } from '../src/components';
import I18nContext from '../src/contexts/I18nContext';

const mockStore = configureStore();
let store;

function wrapWithApp( element ) {
  const WrappedComponent = compose(
    connect( state => ({
      settings: state.settings
    }) )
  )( () => element );

  return (
    <Provider store={store}>
      <I18nContext.Provider value={{
        lang: 'fr',
        getLabel: ( label, values = {} ) => makeGetterLabel( labels )( label, values, 'fr' )
      }}>
        <WrappedComponent />
      </I18nContext.Provider>
    </Provider>
  );
}

function makeTest( state, props ) {
  store = mockStore( _.merge( state, { user: props.user } ) );

  const wrapper = mount( wrapWithApp(
    <p><ConversationTitle {...props} /></p>
  ) );

  expect( wrapper.text() ).to.matchSnapshot();
}

it( 'returns null', () => {
  makeTest(
    { settings: {} },
    {
      user: {},
      conversation: { inboxes: [] }
    }
  );
} );


describe( 'conversation of type event', () => {
  describe( 'context event', () => {
    const initialState = {
      settings: {
        context: 'event'
      }
    };

    it( 'created by me, destinated to a user', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'event',
        creator: true,
        destination: 'me'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by me, destinated to the agenda', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'event',
        creator: true,
        destination: 'agenda'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'event',
        creator: false,
        destination: 'me'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to contributor+agenda', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'event',
        creator: false,
        destination: 'contributor+agenda'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to contributor', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'event',
        creator: false,
        destination: 'contributor'
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context agenda', () => {
    const initialState = {
      settings: {
        context: 'agenda'
      }
    };

    it( 'created by me, destinated to contributor', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'agenda',
        creator: true,
        destination: 'contributor'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by me, destinated to the agenda', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'agenda',
        creator: true,
        destination: 'agenda'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to contributor', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'agenda',
        creator: false,
        destination: 'contributor'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to contributor+agenda', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'agenda',
        creator: false,
        destination: 'contributor+agenda'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'agenda',
        creator: false,
        destination: 'me'
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context user', () => {
    const initialState = {
      settings: {
        context: 'user'
      }
    };

    it( 'created by me, destinated to contributor', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'user',
        creator: true,
        destination: 'contributor'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by me, destinated to the agenda', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'user',
        creator: true,
        destination: 'agenda'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to contributor', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'user',
        creator: false,
        destination: 'contributor'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to contributor+agenda', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'user',
        creator: false,
        destination: 'contributor+agenda'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'event',
        context: 'user',
        creator: false,
        destination: 'me'
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );
} );

describe( 'conversation of type contact_form', () => {
  describe( 'context agenda', () => {
    const initialState = {
      settings: {
        context: 'agenda'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_form',
        context: 'agenda',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_form',
        context: 'agenda',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context user', () => {
    const initialState = {
      settings: {
        context: 'user'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_form',
        context: 'user',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_form',
        context: 'user',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );
} );

describe( 'conversation of type request_contribute', () => {
  describe( 'context agenda', () => {
    const initialState = {
      settings: {
        context: 'agenda'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'request_contribute',
        context: 'agenda',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'request_contribute',
        context: 'agenda',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context user', () => {
    const initialState = {
      settings: {
        context: 'user'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'request_contribute',
        context: 'user',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'request_contribute',
        context: 'user',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );
} );

describe( 'conversation of type edition_request', () => {
  describe( 'context event', () => {
    const initialState = {
      settings: {
        context: 'event'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'edition_request',
        context: 'event',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'edition_request',
        context: 'event',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context agenda', () => {
    const initialState = {
      settings: {
        context: 'agenda'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'edition_request',
        context: 'agenda',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'edition_request',
        context: 'agenda',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context user', () => {
    const initialState = {
      settings: {
        context: 'user'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'edition_request',
        context: 'user',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'edition_request',
        context: 'user',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );
} );

describe( 'conversation of type suggest_location_change', () => {
  describe( 'context agenda', () => {
    const initialState = {
      settings: {
        context: 'agenda'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'suggest_location_change',
        context: 'agenda',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'suggest_location_change',
        context: 'agenda',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context user', () => {
    const initialState = {
      settings: {
        context: 'user'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'suggest_location_change',
        context: 'user',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'suggest_location_change',
        context: 'user',
        creator: false
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );
} );

describe( 'conversation of type contact_member', () => {
  describe( 'context agenda', () => {
    const initialState = {
      settings: {
        context: 'agenda'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_member',
        context: 'agenda',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_member',
        context: 'agenda',
        creator: false,
        destination: 'me'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to other', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_member',
        context: 'agenda',
        creator: false,
        destination: 'member'
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );

  describe( 'context user', () => {
    const initialState = {
      settings: {
        context: 'user'
      }
    };

    it( 'created by me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_member',
        context: 'user',
        creator: true
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to me', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_member',
        context: 'user',
        creator: false,
        destination: 'me'
      } );

      makeTest( initialState, { user, conversation } );
    } );

    it( 'created by someone else, destinated to other', () => {
      const { user, conversation } = _.find( fixturesData, {
        type: 'contact_member',
        context: 'user',
        creator: false,
        destination: 'member'
      } );

      makeTest( initialState, { user, conversation } );
    } );
  } );
} );

describe( 'conversation of type support', () => {
  const initialState = {
    settings: {
      context: 'user'
    }
  };

  it( 'created by me', () => {
    const { user, conversation } = _.find( fixturesData, {
      type: 'support',
      creator: true
    } );

    makeTest( initialState, { user, conversation } );
  } );

  it( 'created by someone else', () => {
    const { user, conversation } = _.find( fixturesData, {
      type: 'support',
      creator: false
    } );

    makeTest( initialState, { user, conversation } );
  } );
} );
