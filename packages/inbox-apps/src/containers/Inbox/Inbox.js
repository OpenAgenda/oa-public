import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { push } from 'react-router-redux';
import { getContext } from 'recompose';
import Waypoint from 'react-waypoint';
import Spinner from '@openagenda/react-components/build/Spinner';
import { ConversationList, LinkContainer, TitleComponent, MessageAvatar, ConversationForm } from '../../components';
import * as inboxActions from '../../redux/modules/inbox';
import * as conversationActions from '../../redux/modules/conversation';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

@asyncConnect( [ {
  key: 'inbox', // key is usefull for the redirection
  promise: ( { store: { dispatch, getState }, helpers: { redirect } } ) => {
    const state = getState();

    const { prefix, focusFistConversation, hideEmptyList, topListConversation } = state.settings;
    const query = focusFistConversation ? { limit: 1 } : {};

    return dispatch( inboxActions.load( query ) )
      .then( async result => {

        if ( topListConversation && !conversationActions.isAuthorLoaded( state ) ) {
          await dispatch( conversationActions.loadAuthor() );
        }

        if ( (hideEmptyList) && result.conversations && !result.conversations.length ) {
          return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
        }

        if ( focusFistConversation ) {
          if ( result.conversations && !result.conversations.length ) {
            return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
          } else if ( !result.conversations[ 0 ].resolvedAt ) {
            return redirect( `${removeTrailingSlash( prefix )}/conversation/${result.conversations[ 0 ].id}` );
          }
        }

      } );

    // const result = await dispatch( inboxActions.load( query ) );
    //
    // if ( topListConversation && !conversationActions.isAuthorLoaded( state ) ) {
    //   await dispatch( conversationActions.loadAuthor() );
    // }
    //
    // if ( (hideEmptyList) && result.conversations && !result.conversations.length ) {
    //   return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
    // }
    //
    // if ( focusFistConversation ) {
    //   if ( result.conversations && !result.conversations.length ) {
    //     return redirect( removeTrailingSlash( prefix ) + '/conversation/create' );
    //   } else if ( !result.conversations[ 0 ].resolvedAt ) {
    //     return redirect( `${removeTrailingSlash( prefix )}/conversation/${result.conversations[ 0 ].id}` );
    //   }
    // }
  }
} ] )
@connect(
  state => ({
    initialValues: state.settings.defaultQuery,
    settings: state.settings,
    conversations: state.inbox.data,
    loading: state.inbox.loading,
    nextLoading: state.inbox.nextLoading,
    lastPage: state.inbox.lastPage,
    author: state.conversation.author
  }),
  { ...inboxActions, ...conversationFormActions, push }
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class Inbox extends Component {
  constructor( props ) {
    super( props );
    this.FromWrapper = ::this.FromWrapper;
  }

  FromWrapper( { handleSubmit, children } ) {
    const { getLabel } = this.props;

    return (
      <form onSubmit={handleSubmit} className="conversation-form">
        <div className="margin-bottom-md">
          {children}
        </div>

        <button type="submit" className="btn btn-primary">{getLabel( 'send' )}</button>
      </form>
    );
  }

  nextPage = () => {
    const { lastPage, loading, nextLoading, conversations } = this.props;

    if (
      !conversations || !conversations.length
      || loading || nextLoading
      || lastPage
    ) {
      return;
    }

    this.props.nextPage();
  };

  throttledNextPage = _.throttle( this.nextPage, 400, { trailing: false } );

  render() {
    const {
      conversations, nextLoading, push, getLabel, createConversation, author, initialValues,
      settings: { TitleComponent, ContentWrapper, allowCreateConversation, topListConversation, prefix }
    } = this.props;

    const allConversationsPast = conversations && conversations.length && conversations[ 0 ].resolvedAt;

    const content = (
      <Fragment>
        {topListConversation && allConversationsPast ? <Fragment>
          <TitleComponent>
            {getLabel( 'newConversation' )}
          </TitleComponent>

          <div className="media">
            <div className="media-left">
              <MessageAvatar message={author}/>
            </div>
            <div className="media-body">
              <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

              <ConversationForm
                onSubmit={data => createConversation( data )
                  .then( async result => {
                    const url = removeTrailingSlash( prefix ) + `/conversation/${result.conversation.id}`;
                    await push( url );
                    return result;
                  } )
                }
                initialValues={initialValues}
                Wrapper={this.FromWrapper}
              />
            </div>
          </div>
        </Fragment> : null}

        {allowCreateConversation && !topListConversation && <div className="pull-right">
          <LinkContainer to="/conversation/create">
            {path => (
              <button
                className="btn btn-info btn-creation"
                onClick={() => push( path )}
              >
                {getLabel( 'createConversation' )}
              </button>
            )}
          </LinkContainer>
        </div>}

        <TitleComponent className="text-left margin-bottom-md">
          {getLabel( allConversationsPast ? 'pastConversations' : 'conversations' )}
        </TitleComponent>

        {conversations && conversations.length ? <ConversationList conversations={conversations}/> : null}

        {!conversations || !conversations.length ?
          <div className="text-center text-muted padding-v-md">
            {getLabel( 'noResult' )}
          </div> :
          null}

        {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner/>
        </div>}

        <Waypoint onEnter={this.throttledNextPage}/>
      </Fragment>
    );

    return ContentWrapper
      ? <ContentWrapper>{content}</ContentWrapper>
      : content;
  }
};

function getAuthorName( obj ) {
  if ( obj.inboxUser ) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}
