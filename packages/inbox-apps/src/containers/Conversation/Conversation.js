import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { connect, ReactReduxContext } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { withContext, withLayoutData, Spinner } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext';
import {
  MessageList, MessageForm, AuthorAvatar, ActionsList,
  Link, ConversationTitle, Breadcrumb
} from '../../components';
import * as conversationActions from '../../reducers/conversation';
import * as inboxActions from '../../reducers/inbox';
import * as modalActions from '../../reducers/modals';
import showBackLink from '../../utils/showBackLink';

function asyncLoad({ store: { getState, dispatch }, history, conversationId, agenda }) {
  const state = getState();
  const promises = [];

  const { prefix } = state.settings;
  const query = { total: true };

  if ( !inboxActions.isLoaded( state ) ) {
    promises.push(dispatch(inboxActions.load(query, agenda)));
  }

  if (!conversationActions.isAuthorLoaded(state)) {
    promises.push(dispatch(conversationActions.loadAuthor(agenda)));
  }

  // if ( !conversationActions.isLoaded( state ) ) {
  promises.push(
    dispatch(conversationActions.load(conversationId, null, agenda))
      .catch(() => history.replace(prefix.replace(':slug', agenda && agenda.slug)))
  );
  // }

  return Promise.all(promises);
}

@withLayoutData('user', 'agenda')
@connect(
  state => ({
    settings: state.settings,
    author: state.conversation.author,
    conversations: state.inbox.data,
    conversation: state.conversation.data,
    messages: state.conversation.messages,
    loading: state.conversation.loading,
    loaded: state.conversation.loaded && state.conversation.author,
    nextLoading: state.conversation.nextLoading,
    lastPage: state.conversation.lastPage,
    res: state.res
  }),
  { ...conversationActions, ...modalActions, inboxLoad: inboxActions.load }
)
@withContext(ReactReduxContext, 'reactReduxContext')
@withRouter
class Conversation extends Component {
  static contextType = I18nContext;

  componentDidMount() {
    const { reactReduxContext, location, history, agenda, match } = this.props;
    const { store } = reactReduxContext;

    asyncLoad({ store, history, location, agenda, conversationId: match.params.conversationId }).catch(() => null);
  }

  nextPage = () => {
    const { lastPage, loading, nextLoading, messages, match, agenda } = this.props;

    if (
      !messages || !messages.length
      || loading || nextLoading
      || lastPage
    ) {
      return;
    }

    this.props.nextPage(match.params.conversationId, agenda);
  };

  sendMessage = data => {
    const { match, sendMessage, agenda } = this.props;
    return sendMessage(match.params.conversationId, data, agenda)
      // .then(v => {
      //   if (v[FORM_ERROR]) {
      //     throw v;
      //   } else {
      //     return v;
      //   }
      // })
      /*.catch( () => ({ [FORM_ERROR]: getLabel('sendMessageError') }) )*/;
  };

  throttledNextPage = _.throttle(this.nextPage, 400, { trailing: false });

  FormWrapper = ({ children, handleSubmit, submitting, submitError }) => {
    const { author, messages, conversation } = this.props;
    const { getLabel } = this.context;

    const contextInbox = _.find(conversation.inboxes, ['id', conversation.inboxContextId]);

    if (contextInbox) {
      author.inbox = contextInbox;
    }

    return (
      <div className="media">
        <div className="media-left media-top">
          <AuthorAvatar author={author} />
        </div>

        <div className="media-body">
          <p className="author-name">{getAuthorName(author)}</p>

          <form onSubmit={handleSubmit} className="message-form margin-bottom-md">
            {children}

            {submitError ? <p className="text-danger">{submitError}</p> : null}

            {author.inbox && author.inbox.type !== 'user' && author.inboxUser
              ? <div className="margin-bottom-sm">
                {getLabel('yourMessageWillBeSigned')} <b>{author.inbox.name}</b>
              </div>
              : null}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary margin-top-xs"
            >
              {getLabel(messages && messages.length ? 'reply' : 'submit')}

              {submitting && (
                <span className="margin-h-sm">
                  <Spinner mode="inline" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  getResolvedLabel = () => {
    const { conversation } = this.props;
    const { getLabel } = this.context;

    switch (conversation.type) {
      case 'request_contribute':
        switch (conversation.store.resolvedWith) {
          case 'accept':
            return getLabel('requestContributeAccepted');
          case 'refuse':
            return getLabel('requestContributeRefused');
        }
      case 'edition_request':
        switch (conversation.store.resolvedWith) {
          case 'accept':
            return getLabel('editionRequestAccepted');
          case 'refuse':
            return getLabel('editionRequestRefused');
        }
    }

    return getLabel(conversation.closedAt ? 'conversationAreClosed' : 'conversationAreResolved');
  };

  reloadInbox = () => {
    const { inboxLoad, agenda } = this.props;
    inboxLoad({}, agenda).catch(() => null);
  };

  TitleEntityComponent = ({ children, type, agendaUid, eventUid, locationUid }) => {
    const { agenda, settings } = this.props;
    const { context } = settings;

    switch (type) {
      case 'agenda':
        return (
          <Link
            to={`/agendas/${agendaUid}`}
            className="conversation-title-entity"
            agenda={agenda}
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
            agenda={agenda}
            external
          >
            {children}
          </Link>
        );
      case 'location':
        if (context === 'agenda') {
          return (
            <Link
              to={`/agendas/${agendaUid}/admin/locations?uids[]=${locationUid.split(/\.|,/).pop()}`}
              className="conversation-title-entity"
              agenda={agenda}
              external
            >
              {children}
            </Link>
          );
        } else {
          return <b className="conversation-title-entity">{children}</b>;
        }
      default:
        return <span className="conversation-title-entity">{children}</span>;
    }
  };

  render() {
    const {
      loading,
      loaded,
      conversations,
      conversation,
      messages,
      user,
      triggerAction,
      showModal,
      nextLoading,
      resume,
      settings,
      res,
      attachFileToMessage,
      agenda
    } = this.props;
    const { getLabel } = this.context;

    const { ContentWrapper, focusFistConversation } = settings;

    const content = loading || !loaded
      ? <div className="text-center padding-v-md">
        <Spinner
          loading={loading} mode="inline" options={{
          width: 1,
          length: 6,
          radius: 10,
          color: '#666'
        }}
        />
      </div>
      : (
        <Fragment>
          <div className="inbox-head">
            <Breadcrumb
              agenda={agenda}
              breadParts={[
                {
                  component: <ConversationTitle
                    agenda={agenda}
                    user={user}
                    conversation={conversation}
                    EntityComponent={this.TitleEntityComponent}
                  />,
                  className: 'text-muted'
                }
              ]}
              disableFirstPartLink={!showBackLink(settings, conversations)}
            />

            {conversation.store && conversation.store.params && conversation.store.params.origin ? (
              <div className="text-muted">
                ({getLabel('from')} <em>{decodeURIComponent(conversation.store.params.origin)})</em>
              </div>
            ) : null}

            <div className="inbox-actions well margin-top-lg">
              {conversation.resolvedAt && (
                <>
                  {conversation.closedAt && (
                    <>
                      <i className="fa fa-lock text-muted" aria-hidden="true"></i>{' '}
                    </>
                  )}
                  {this.getResolvedLabel()}
                  <br />
                </>
              )}

              {conversation.closedAt ? (
                <button className="btn btn-link btn-resume" onClick={() => resume(conversation.id, agenda)}>
                  {getLabel('resumeConversation')}
                </button>
              ) : (
                <ActionsList
                  onAction={
                    code => triggerAction(conversation.id, code, agenda)
                      .then(this.reloadInbox)
                  }
                  actions={conversation.actions}
                  showModal={showModal}
                />
              )}
            </div>
          </div>

          {!conversation.closedAt && (
            <MessageForm
              Wrapper={this.FormWrapper}
              uploadEndpoint={
                res.messages.prepareAttachment
                  .replace(':conversationId', conversation.id)
                  .replace(':agendaUid', agenda && agenda.uid)
              }
              onSubmit={this.sendMessage}
              onMessageSent={() => {
                showModal('messageSent');
              }}
              onFileUploaded={(...args) => attachFileToMessage(...args, agenda)}
              conversation={conversation}
              autoFocus={settings.autoFocus}
            />
          )}

          {messages && messages.length ? <MessageList messages={messages} /> : null}

          {!messages || !messages.length ? <div className="text-center text-muted margin-v-md">
            {getLabel('noResult')}
          </div> : null}

          {nextLoading && <div className="padding-v-md" style={{ position: 'relative' }}>
            <Spinner />
          </div>}

          <Waypoint onEnter={this.throttledNextPage} />
        </Fragment>
      );

    return ContentWrapper
      ? <ContentWrapper>{content}</ContentWrapper>
      : content;
  }
}

function getAuthorName(author) {
  if (author.inboxUser) {
    return author.inboxUser.name;
  }

  return author.inbox.name;
}

export default Conversation;
