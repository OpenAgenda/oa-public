import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { reset as resetForm } from 'redux-form';
import Waypoint from 'react-waypoint';
import { getContext } from 'recompose';
import Spinner from '@openagenda/react-components/build/Spinner';
import { MessageList, MessageForm, AuthorAvatar, ActionsList, Link, LinkContainer } from '../../components';
import * as conversationActions from '../../redux/modules/conversation';
import * as inboxActions from '../../redux/modules/inbox';
import * as modalActions from '../../redux/modules/modals';
import showBackLink from '../../utils/showBackLink';

@asyncConnect( [ {
  key: 'asyncConnectConversation',
  promise: ( { store: { dispatch, getState }, router, helpers: { redirect } } ) => {
    const state = getState();
    const promises = [];

    const { prefix, focusFistConversation } = state.settings;
    const query = focusFistConversation ? { limit: 1 } : {};

    // if ( !inboxActions.isLoaded( state ) ) {
    promises.push( dispatch( inboxActions.load( query ) ) );
    // }

    if ( !conversationActions.isAuthorLoaded( state ) ) {
      promises.push( dispatch( conversationActions.loadAuthor() ) );
    }

    // if ( !conversationActions.isLoaded( state ) ) {
    promises.push(
      dispatch( conversationActions.load( router.params.conversationId ) )
        .catch( () => redirect( prefix ) )
    );
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
  { ...conversationActions, ...modalActions, resetForm }
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class Conversation extends Component {
  constructor( props ) {
    super( props );
    this.renderForm = ::this.renderForm;
    this.renderTitle = ::this.renderTitle;
    this.FromWrapper = ::this.FromWrapper;
    this.getClosedLabel = ::this.getClosedLabel;
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
    const { router, sendMessage, resetForm, showModal } = this.props;
    await sendMessage( router.params.conversationId, data );

    resetForm( 'message' );
    showModal( 'messageSent' );
  }

  throttledNextPage = _.throttle( this.nextPage, 400, { trailing: false } );

  FromWrapper( { children, handleSubmit, submitting } ) {
    const { getLabel, author, messages, conversation } = this.props;

    const contextInbox = _.find( conversation.inboxes, [ 'id', conversation.inboxContextId ] );

    if ( contextInbox ) {
      author.inbox = contextInbox;
    }

    return (
      <div className="media">
        <div className="media-left media-top">
          <AuthorAvatar author={author}/>
        </div>

        <div className="media-body">
          <p className="author-name">{getAuthorName( author )}</p>

          <form onSubmit={handleSubmit} className="message-form margin-bottom-md">
            {children}

            {author.inbox && author.inbox.type !== 'user' && author.inboxUser
              ? <div className="margin-bottom-sm">
                {getLabel( 'yourMessageWillBeSigned' )} <b>{author.inbox.name}</b>
              </div>
              : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary margin-top-xs"
            >
              {getLabel( messages && messages.length ? 'reply' : 'submit' )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  getClosedLabel() {
    const { conversation, getLabel } = this.props;

    if ( conversation.type === 'request_contribute' ) {
      switch ( conversation.store.resolvedWith ) {
        case 'accept':
          return getLabel( 'requestContributeAccepted' );
        case 'refuse':
          return getLabel( 'requestContributeRefused' );
      }
    }

    return getLabel( 'conversationAreResolved' );
  }

  renderForm() {
    const { conversation, triggerAction, resume, getLabel, showModal } = this.props;

    if ( !conversation ) {
      return null;
    }

    if ( conversation.closedAt ) {
      return (
        <div className="conversation-resolved well text-center margin-top-md">
          <i className="fa fa-lock text-muted" aria-hidden="true"></i>{' '}
          {this.getClosedLabel()}<br/>
          <button className="btn btn-link btn-resume" onClick={() => resume( conversation.id )}>
            {getLabel( 'resumeConversation' )}
          </button>
        </div>
      );
    }

    if ( !conversation.actions || !conversation.actions.length ) {
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
              showModal={showModal}
            />
          </div>
        </div>
      </div>
    );
  }

  renderTitle() {
    const { settings, conversation, getLabel } = this.props;

    const { maskEventTitle } = settings;
    const { type, store, typeIdentifier } = conversation;

    if ( !maskEventTitle && store && store.params && store.params.eventTitle ) {
      return (
        <Fragment>
          {' '}
          <h4 className="inbox-title">
            <span className="text-muted">{_.upperFirst( getLabel( 'conversationInitiatedOn' ) )}</span>{' '}
            <Link to={`/agendas/${store.params.agendaUid}/events/${typeIdentifier}`} external>
              {store.params.eventTitle}
            </Link>
          </h4>
          <p className="margin-bottom-sm">{getLabel( 'by' )} <b>{getCreatorName( conversation )}</b></p>
        </Fragment>
      );
    }

    if ( type === 'contact_form' ) {
      return (
        <Fragment>
          {' '}
          <h4 className="inbox-title">
            <span className="text-muted">{_.upperFirst( getLabel( 'contactConversationInitiated' ) )}</span>
          </h4>
          <p className="margin-bottom-sm">{getLabel( 'by' )} <b>{getCreatorName( conversation )}</b></p>
        </Fragment>
      );
    }

    if ( type === 'request_contribute' ) {
      const contextInbox = getContextInbox( conversation );

      if ( contextInbox.type === 'agenda' ) {
        return (
          <h4 className="inbox-title text-muted margin-bottom-sm">
            <b>{getCreatorName( conversation )}</b> {getLabel( 'wouldLikeToContribute' )}
          </h4>
        );
      }

      return (
        <h4 className="inbox-title text-muted margin-bottom-sm">
          {getLabel( 'requestForContribution' )} <b>{store.params.agendaTitle}</b>
        </h4>
      );
    }

    return (
      <h4 className="inbox-title text-muted margin-bottom-sm">
        {getLabel( 'conversationInitiatedBy' )} <b>{getCreatorName( conversation )}</b>
      </h4>
    );
  }

  render() {
    const {
      conversations, messages,
      nextLoading, getLabel, settings, router
    } = this.props;

    const { ContentWrapper } = settings;

    const content = (
      <Fragment>
        {/* <TitleComponent>
          {getLabel( 'conversation' )}
        </TitleComponent> */}

        {showBackLink( settings, conversations ) ? <div className="text-right margin-bottom-sm">
          <LinkContainer to="/">
            {path => (
              <button
                className="btn btn-info btn-back"
                onClick={() => router.push( { pathname: path, state: { showListAllowed: true } } )}
              >
                {getLabel( 'showAllConversations' )}
              </button>
            )}
          </LinkContainer>
        </div> : null}

        {this.renderTitle()}

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

function getCreatorName( conversation ) {
  if ( conversation.creatorInboxUser ) {
    return conversation.creatorInboxUser.name;
  }

  return conversation.creatorInbox.name;
}

function getContextInbox( conversation ) {
  return _.find( conversation.inboxes, [ 'id', conversation.inboxContextId ] )
}
