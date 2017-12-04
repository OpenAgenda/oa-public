import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { reset as resetForm } from 'redux-form';
import Waypoint from 'react-waypoint';
import { getContext } from 'recompose';
import Spinner from '@openagenda/react-components/build/Spinner';
import { MessageList, MessageForm, MessageAvatar, ActionsList, Link } from '../../components';
import * as conversationActions from '../../redux/modules/conversation';
import * as inboxActions from '../../redux/modules/inbox';

@asyncConnect( [ {
  promise: ( { store: { dispatch, getState }, router } ) => {
    const state = getState();
    const promises = [];

    const { focusFistConversation } = state.settings;
    const query = focusFistConversation ? { limit: 1 } : {};

    // if ( !inboxActions.isLoaded( state ) ) {
      promises.push( dispatch( inboxActions.load( query ) ) );
    // }

    if ( !conversationActions.isAuthorLoaded( state ) ) {
      promises.push( dispatch( conversationActions.loadAuthor() ) );
    }

    // if ( !conversationActions.isLoaded( state ) ) {
    promises.push( dispatch( conversationActions.load( router.params.conversationId ) ) );
    // }

    return Promise.all( promises );
  }
} ] )
@asyncConnect( [ {
  promise: ( { store: { dispatch, getState } } ) => {
    const state = getState();

    if ( !conversationActions.isAuthorLoaded( state ) ) {
      return dispatch( conversationActions.loadAuthor() );
    }
  }
} ] )
@connect(
  state => ({
    settings: state.settings,
    author: state.conversation.author,
    conversations: state.inbox.data,
    conversation: state.conversation.data,
    messages: state.conversation.messages,
    loading: state.conversation.loading,
    nextLoading: state.conversation.nextLoading,
    lastPage: state.conversation.lastPage,
    res: state.res
  }),
  { ...conversationActions, resetForm }
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class Conversation extends Component {
  constructor( props ) {
    super( props );
    this.renderForm = ::this.renderForm;
    this.FromWrapper = ::this.FromWrapper;
  }

  nextPage = () => {
    const { lastPage, loading, nextLoading, messages, router } = this.props;

    if (
      !messages || !messages.length
      || loading || nextLoading
      || lastPage
    ) {
      return;
    }

    this.props.nextPage( router.params.conversationId );
  };

  sendMessage = async data => {
    const { router, sendMessage, resetForm } = this.props;
    await sendMessage( router.params.conversationId, data );

    resetForm( 'message' );
  }

  throttledNextPage = _.throttle( this.nextPage, 400, { trailing: false } );

  FromWrapper( { children, handleSubmit, submitting } ) {
    const { getLabel, author, messages } = this.props;

    return (
      <div className="media">
        <div className="media-left media-top">
          <MessageAvatar message={author}/>
        </div>

        <div className="media-body">
          <p className="author-name">{getAuthorName( author )}</p>

          <form onSubmit={handleSubmit} className="message-form">
            {children}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary margin-bottom-sm"
            >
              {getLabel( messages && messages.length ? 'reply' : 'submit' )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  renderForm() {
    const { conversation, triggerAction, getLabel } = this.props;

    if ( conversation.resolvedAt ) {
      return (
        <div className="conversation-resolved well text-center margin-top-md">
          <i className="fa fa-lock text-muted" aria-hidden="true"></i>{' '}
          {getLabel( 'conversationAreResolved' )}
        </div>
      );
    }

    if ( !conversation.actions ) {
      return (
        <MessageForm
          form="message"
          onSubmit={this.sendMessage}
          Wrapper={this.FromWrapper}
        />
      );
    }

    return (
      <div className="row">
        <div className="col-sm-10">
          <MessageForm
            form="message"
            onSubmit={this.sendMessage}
            Wrapper={this.FromWrapper}
          />
        </div>
        <div className="col-sm-2">
          <p><b>{getLabel( 'actions' )}</b></p>

          <div className="text-center">
            <ActionsList
              onAction={triggerAction.bind( null, conversation.id )}
              actions={conversation.actions}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      conversations, messages, nextLoading, getLabel,
      settings: { TitleComponent, ContentWrapper, focusFistConversation, hideEmptyList }
    } = this.props;

    const showBackLink = (!focusFistConversation && (!hideEmptyList && conversations && !conversations.length))
      || (conversations && conversations.length && conversations[ 0 ].resolvedAt);

    const content = (
      <Fragment>
        <TitleComponent>
          {getLabel( 'conversation' )}
        </TitleComponent>

        {showBackLink ? <div>
          <Link to="/">{getLabel( 'backToConversations' )}</Link>
        </div> : null}

        {this.renderForm()}

        {messages && messages.length ? <MessageList messages={messages}/> : null}

        {!messages || !messages.length ? <div className="text-center text-muted margin-v-md">
          {getLabel( 'noResult' )}
        </div> : null}

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
}

function getAuthorName( author ) {
  if ( author.inboxUser ) {
    return author.inboxUser.name;
  }

  return author.inbox.name;
}
