import { Component } from 'react';
import find from 'lodash/find.js';
import throttle from 'lodash/throttle.js';
import { connect, ReactReduxContext } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { withContext, withLayoutData, Spinner } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext.js';
import {
  MessageList,
  MessageForm,
  AuthorAvatar,
  ActionsList,
  Link,
  ConversationTitle,
  Breadcrumb,
} from '../components/index.js';
import * as conversationActions from '../reducers/conversation.js';
import * as inboxActions from '../reducers/inbox.js';
import * as modalActions from '../reducers/modals.js';
import showBackLink from '../utils/showBackLink.js';
import { enable as enableUserContext } from '../utils/userContext.js';

const getAuthorName = (obj) => obj.inboxUser?.name ?? obj.inbox.name;

function asyncLoad({
  store: { getState, dispatch },
  history,
  conversationId,
  agenda,
}) {
  const state = getState();
  const promises = [];

  const { prefix } = state.settings;
  const query = { total: true };

  if (!inboxActions.isLoaded(state)) {
    promises.push(dispatch(inboxActions.load(query, agenda)));
  }

  if (!conversationActions.isAuthorLoaded(state)) {
    promises.push(dispatch(conversationActions.loadAuthor(agenda)));
  }

  // if ( !conversationActions.isLoaded( state ) ) {
  promises.push(
    dispatch(conversationActions.load(conversationId, null, agenda)).catch(() =>
      history.replace(prefix.replace(':slug', agenda && agenda.slug))),
  );
  // }

  return Promise.all(promises);
}

class ConversationContainer extends Component {
  static contextType = I18nContext;

  componentDidMount() {
    const { reactReduxContext, location, history, agenda, match } = this.props;
    const { store } = reactReduxContext;

    asyncLoad({
      store,
      history,
      location,
      agenda,
      conversationId: match.params.conversationId,
    }).catch(() => null);
  }

  throttledNextPage = () => throttle(this.nextPage, 400, { trailing: false });

  nextPage = () => {
    const { lastPage, loading, nextLoading, messages, match, agenda } = this.props;

    if (!messages?.length || loading || nextLoading || lastPage) {
      return;
    }

    this.props.nextPage(match.params.conversationId, agenda);
  };

  sendMessage = (data) => {
    const { match, sendMessage, agenda } = this.props;
    return sendMessage(match.params.conversationId, data, agenda);
  };

  FormWrapper = ({ children, handleSubmit, submitting, submitError }) => {
    const { author, messages, conversation } = this.props;
    const { getLabel } = this.context;

    const contextInbox = find(conversation.inboxes, [
      'id',
      conversation.inboxContextId,
    ]);

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

          <form
            onSubmit={handleSubmit}
            className="message-form margin-bottom-md"
          >
            {children}

            {submitError ? <p className="text-danger">{submitError}</p> : null}

            {author.inbox
            && author.inbox.type !== 'user'
            && author.inboxUser ? (
              <div className="margin-bottom-sm">
                {getLabel('yourMessageWillBeSigned')} <b>{author.inbox.name}</b>
              </div>
              ) : null}

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
          default:
            return null;
        }
      case 'edition_request':
        switch (conversation.store.resolvedWith) {
          case 'accept':
            return getLabel('editionRequestAccepted');
          case 'refuse':
            return getLabel('editionRequestRefused');
          default:
            return null;
        }
      default:
        return getLabel(
          conversation.closedAt
            ? 'conversationAreClosed'
            : 'conversationAreResolved',
        );
    }
  };

  reloadInbox = () => {
    const { inboxLoad, agenda } = this.props;
    inboxLoad({}, agenda).catch(() => null);
  };

  TitleEntityComponent = ({
    children,
    type,
    agendaUid,
    eventUid,
    locationUid,
  }) => {
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
        }
        return <b className="conversation-title-entity">{children}</b>;

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
      agenda,
    } = this.props;
    const { getLabel } = this.context;

    enableUserContext(res, messages, user);

    const { ContentWrapper } = settings;

    const origin = conversation?.store?.params?.origin
      ? decodeURIComponent(conversation.store.params.origin)
      : null;

    const content = loading || !loaded ? (
      <div className="text-center padding-v-md">
        <Spinner
          loading={loading}
          mode="inline"
          options={{
            width: 1,
            length: 6,
            radius: 10,
            color: '#666',
          }}
        />
      </div>
    ) : (
      <>
        <div className="inbox-head">
          <Breadcrumb
            agenda={agenda}
            breadParts={[
              {
                component: (
                  <ConversationTitle
                    agenda={agenda}
                    user={user}
                    conversation={conversation}
                    EntityComponent={this.TitleEntityComponent}
                  />
                ),
                className: 'text-muted',
              },
            ]}
            disableFirstPartLink={!showBackLink(settings, conversations)}
          />

          {origin ? (
            <div className="text-muted">
              ({getLabel('from')}{' '}
              <em>
                <a href={origin} target="_blank" rel="noreferrer">
                  {origin}
                </a>
              </em>
              )
            </div>
          ) : null}

          <div className="inbox-actions well margin-top-lg">
            {conversation.resolvedAt && (
            <>
              {conversation.closedAt && (
              <>
                <i className="fa fa-lock text-muted" aria-hidden="true" />{' '}
              </>
              )}
              {this.getResolvedLabel()}
              <br />
            </>
            )}

            {conversation.closedAt ? (
              <button
                type="button"
                className="btn btn-link btn-resume"
                onClick={() => resume(conversation.id, agenda)}
              >
                {getLabel('resumeConversation')}
              </button>
            ) : (
              <ActionsList
                onAction={(code) =>
                  triggerAction(conversation.id, code, agenda).then(
                    this.reloadInbox,
                  )}
                actions={conversation.actions}
                showModal={showModal}
              />
            )}
          </div>
        </div>

        {!conversation.closedAt && (
        <MessageForm
          Wrapper={this.FormWrapper}
          uploadEndpoint={res.messages.uploadAttachment
            .replace(':conversationId', conversation.id)
            .replace(':agendaUid', agenda && agenda.uid)}
          onSubmit={this.sendMessage}
          onMessageSent={() => {
            showModal('messageSent');
          }}
          onFileUploaded={attachFileToMessage}
          conversation={conversation}
          autoFocus={settings.autoFocus}
        />
        )}

        {messages && messages.length ? (
          <MessageList
            messages={messages}
            res={res}
            domain={settings.domain}
          />
        ) : null}

        {!messages || !messages.length ? (
          <div className="text-center text-muted margin-v-md">
            {getLabel('noResult')}
          </div>
        ) : null}

        {nextLoading && (
        <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>
        )}

        <Waypoint onEnter={this.throttledNextPage} />
      </>
    );

    return ContentWrapper ? (
      <ContentWrapper>{content}</ContentWrapper>
    )
      : content;
  }
}

export default withLayoutData(
  'user',
  'agenda',
)(
  connect(
    (state) => ({
      settings: state.settings,
      author: state.conversation.author,
      conversations: state.inbox.data,
      conversation: state.conversation.data,
      messages: state.conversation.messages,
      loading: state.conversation.loading,
      loaded: state.conversation.loaded && state.conversation.author,
      nextLoading: state.conversation.nextLoading,
      lastPage: state.conversation.lastPage,
      res: state.res,
    }),
    { ...conversationActions, ...modalActions, inboxLoad: inboxActions.load },
  )(
    withContext(
      ReactReduxContext,
      'reactReduxContext',
    )(withRouter(ConversationContainer)),
  ),
);
