import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { reset as resetForm, SubmissionError } from 'redux-form';
import Waypoint from 'react-waypoint';
import { getContext } from 'recompose';
import Spinner from '@openagenda/react-components/build/Spinner';
import {
  MessageList, MessageForm, AuthorAvatar, ActionsList,
  Link, ConversationTitle, Breadcrumb
} from '../../components';
import * as conversationActions from '../../redux/modules/conversation';
import * as inboxActions from '../../redux/modules/inbox';
import * as modalActions from '../../redux/modules/modals';
import showBackLink from '../../utils/showBackLink';

function asyncLoad( { store: { getState, dispatch }, router, redirect } ) {
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

@asyncConnect( [ {
  key: 'asyncConnectConversation',
  promise: ( { store, router, helpers: { redirect } } ) => {
    if ( !__SERVER__ ) return { needLoad: true };
    return asyncLoad( { store, router, redirect } );
  }
} ] )
@connect(
  state => ({
    settings: state.settings,
    user: state.user,
    author: state.conversation.author,
    conversations: state.inbox.data,
    conversation: state.conversation.data,
    messages: state.conversation.messages,
    loading: state.conversation.loading,
    nextLoading: state.conversation.nextLoading,
    lastPage: state.conversation.lastPage,
    agenda: state.agenda,
    res: state.res
  }),
  { ...conversationActions, ...modalActions, resetForm, inboxLoad: inboxActions.load }
)
@getContext( {
  getLabel: PropTypes.func,
  store: PropTypes.object
} )
export default class Conversation extends Component {
  constructor( props ) {
    super( props );
    this.FromWrapper = ::this.FromWrapper;
    this.getClosedLabel = ::this.getClosedLabel;
    this.TitleEntityComponent = ::this.TitleEntityComponent;
  }

  state = {
    loading: false,
    loaded: this.props.asyncConnectConversation ? !this.props.asyncConnectConversation.needLoad : false,
    error: null
  };

  componentDidMount() {
    const { store, router } = this.props;

    if ( !this.state.loaded && !this.state.loading ) {
      this.setState( {
        loading: true,
        loaded: false,
        error: null
      } );

      asyncLoad( { store, router, redirect: router.replace } )
        .then( () => {
          this.setState( {
            loading: false,
            loaded: true,
            error: null
          } );
        }, error => {
          this.setState( {
            loading: false,
            loaded: false,
            error
          } );
        } );
    }
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

  sendMessage = data => {
    const { router, sendMessage, getLabel } = this.props;
    return sendMessage( router.params.conversationId, data )
      .catch( () => {
        throw new SubmissionError( { _error: getLabel( 'sendMessageError' ) } );
      } );
  }

  throttledNextPage = _.throttle( this.nextPage, 400, { trailing: false } );

  FromWrapper( { children, handleSubmit, submitting, error } ) {
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

            {error ? <p className="text-danger">{error}</p> : null}

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

    switch ( conversation.type ) {
      case 'request_contribute':
        switch ( conversation.store.resolvedWith ) {
          case 'accept':
            return getLabel( 'requestContributeAccepted' );
          case 'refuse':
            return getLabel( 'requestContributeRefused' );
        }
      case 'edition_request':
        switch ( conversation.store.resolvedWith ) {
          case 'accept':
            return getLabel( 'editionRequestAccepted' );
          case 'refuse':
            return getLabel( 'editionRequestRefused' );
        }
    }

    return getLabel( 'conversationAreResolved' );
  }

  TitleEntityComponent( { children, type, agendaUid, eventUid, locationUid } ) {
    const { context } = this.props.settings;

    switch ( type ) {
      case 'agenda':
        return (
          <Link
            to={`/agendas/${agendaUid}`}
            className="conversation-title-entity"
            external
          >
            {children}
          </Link>
        );
      case 'event':
        return (
          <Link
            to={`/agendas/${agendaUid}/events/${eventUid}`}
            className="conversation-title-entity"
            external
          >
            {children}
          </Link>
        );
      case 'location':
        if ( context === 'agenda' ) {
          return (
            <Link
              to={`/agendas/${agendaUid}/admin/locations?uids[]=${locationUid}`}
              className="conversation-title-entity"
              external
            >
              {children}
            </Link>
          );
        } else {
          return <b className="conversation-title-entity">{children}</b>
        }
      default:
        return <span className="conversation-title-entity">{children}</span>;
    }
  }

  render() {
    const {
      conversations, conversation, messages, user,
      inboxLoad, triggerAction, showModal, nextLoading,
      resume, getLabel, settings, res, attachFileToMessage,
      agenda
    } = this.props;

    const { ContentWrapper, focusFistConversation } = settings;

    const content = this.state.loading || !this.state.loaded
      ? <div className="text-center padding-v-md">
        <Spinner loading={this.state.loading} mode="inline" options={{
          width: 1,
          length: 6,
          radius: 10,
          color: '#666'
        }}/>
      </div>
      : (
        <Fragment>
          <div className="inbox-head">
            <Breadcrumb
              breadParts={[ {
                component: <ConversationTitle
                  user={user}
                  conversation={conversation}
                  EntityComponent={this.TitleEntityComponent}
                />,
                className: 'text-muted'
              } ]}
              disableFirstPartLink={!showBackLink( settings, conversations )}
            />

            {conversation.store && conversation.store.params && conversation.store.params.origin ? (
              <div className="text-muted">
                ({getLabel( 'from' )} <em>{decodeURIComponent( conversation.store.params.origin )})</em>
              </div>
            ) : null}

            {conversation.actions && conversation.actions.length ? (
              <div className="inbox-actions margin-top-lg">
                <ActionsList
                  onAction={
                    code => triggerAction( conversation.id, code )
                      .then( () => inboxLoad( focusFistConversation ? { limit: 1 } : {} ) )
                  }
                  actions={conversation.actions}
                  showModal={showModal}
                />
              </div>
            ) : null}

            {conversation.closedAt && (
              <div className="conversation-resolved well text-center margin-top-lg">
                <i className="fa fa-lock text-muted" aria-hidden="true"></i>{' '}
                {this.getClosedLabel()}<br/>
                <button className="btn btn-link btn-resume" onClick={() => resume( conversation.id )}>
                  {getLabel( 'resumeConversation' )}
                </button>
              </div>
            )}
          </div>

          {!conversation.closedAt && (
            <MessageForm
              form="message"
              Wrapper={this.FromWrapper}
              uploadEndpoint={
                res.messages.prepareAttachment
                  .replace( ':conversationId', conversation.id )
                  .replace( ':agendaUid', agenda && agenda.uid )
              }
              onSubmit={this.sendMessage}
              onMessageSent={() => {
                // resetForm( 'message' );
                showModal( 'messageSent' );
              }}
              onFileUploaded={attachFileToMessage}
              conversation={conversation}
            />
          )}

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
