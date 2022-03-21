import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { connect, ReactReduxContext } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import qs from 'qs';
import { withContext, nl2br, withLayoutData, Spinner } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext';
import { Breadcrumb, ConversationList, LinkContainer, AuthorAvatar, ConversationForm } from '../../components';
import * as inboxActions from '../../reducers/inbox';
import * as conversationActions from '../../reducers/conversation';
import * as conversationFormActions from '../../reducers/conversationForm';
import * as modalActions from '../../reducers/modals';
import removeTrailingSlash from '../../utils/removeTrailingSlash';
import setFlashMessage from '../../utils/setFlashMessage';

function asyncLoad({ store: { getState, dispatch }, location, history, agenda }) {
  const state = getState();
  const { prefix, focusFistConversation, hideEmptyList, topListForm } = state.settings;
  const query = { total: true };

  let promise;

  query.total = true;

  if (topListForm && !conversationActions.isAuthorLoaded(state)) {
    promise = Promise.all([
      dispatch(conversationActions.loadAuthor(agenda)),
      dispatch(inboxActions.load(query, agenda))
    ]);
  } else {
    promise = dispatch(inboxActions.load(query, agenda));
  }

  return promise
    .then(async result => {

      if (location.state && location.state.showListAllowed) {
        return true;
      }

      const baseUrl = prefix.replace(':slug', agenda && agenda.slug);

      if ((hideEmptyList) && result.conversations && !result.conversations.length) {
        return history.replace(baseUrl + '/conversation/create');
      }

      if (focusFistConversation) {
        if (!result.conversations?.length) {
          return history.replace(baseUrl + '/conversation/create');
        } else if (result.conversations.filter(conv => !conv.closedAt).length === 1) {
          return history.replace(`${baseUrl}/conversation/${result.conversations[0].id}`);
        }
      }
    });

  // return dispatch(inboxActions.load(query))
  //   .then(async result => {
  //
  //     if (topListForm && !conversationActions.isAuthorLoaded(state)) {
  //       await dispatch(conversationActions.loadAuthor());
  //     }
  //
  //     if (location.state && location.state.showListAllowed) {
  //       return true;
  //     }
  //
  //     if ((hideEmptyList) && result.conversations && !result.conversations.length) {
  //       return history.replace(prefix + '/conversation/create');
  //     }
  //
  //     if (focusFistConversation) {
  //       if (result.conversations && !result.conversations.length) {
  //         return history.replace(prefix + '/conversation/create');
  //       } else if (result.conversations && result.conversations.length && !result.conversations[0].closedAt) {
  //         return history.replace(`${prefix}/conversation/${result.conversations[0].id}`);
  //       }
  //     }
  //   });
}

@withLayoutData('user', 'agenda')
// @provideHooks({
//   defer: ({ store, location, history, ...others }) => {
//     console.log(others);
//     // asyncLoad({ store, location, history, agenda }).catch(() => null);
//   }
// })
@connect(
  (state, props) => {
    const query = qs.parse(props.location.search, { ignoreQueryPrefix: true });

    return {
      initialValues: query.origin
        ? _.merge(state.settings.defaultQuery, { params: { origin: query.origin } })
        : state.settings.defaultQuery,
      settings: state.settings,
      conversations: state.inbox.data,
      total: state.inbox.total,
      totalOpened: state.inbox.totalOpened,
      totalClosed: state.inbox.totalClosed,
      loading: state.inbox.loading,
      loaded: state.inbox.loaded,
      nextLoading: state.inbox.nextLoading,
      lastPage: state.inbox.lastPage,
      author: state.conversation.author,
      res: state.res
    };
  },
  { ...conversationActions, ...inboxActions, ...conversationFormActions, ...modalActions }
)
@withContext(ReactReduxContext, 'reactReduxContext')
@withRouter
class Inbox extends Component {
  static contextType = I18nContext;

  componentDidMount() {
    const { reactReduxContext, location, history, agenda } = this.props;
    const { store } = reactReduxContext;

    asyncLoad({ store, location, history, agenda }).catch(() => null);
  }

  FormWrapper = ({ handleSubmit, error, children }) => {
    const { settings, author } = this.props;
    const { getLabel } = this.context;
    const { belowMessageDesc } = settings;

    return (
      <form onSubmit={handleSubmit} className="conversation-form margin-bottom-md">
        {children}

        {error ? <p className="text-danger">{error}</p> : null}

        {author.inbox && author.inbox.type !== 'user' && author.inboxUser
          ? <div className="margin-bottom-sm">
            {getLabel('yourMessageWillBeSigned')} <b>{author.inbox.name}</b>
          </div>
          : null}

        {belowMessageDesc
          ? <div className="margin-bottom-xs" dangerouslySetInnerHTML={{ __html: belowMessageDesc }} />
          : null}

        <button type="submit" className="btn btn-primary margin-top-xs">{getLabel('send')}</button>
      </form>
    );
  };

  nextPage = () => {
    const { lastPage, loading, nextLoading, conversations, agenda } = this.props;

    if (
      !conversations || !conversations.length
      || loading || nextLoading
      || lastPage
    ) {
      return;
    }

    this.props.nextPage(agenda);
  };

  throttledNextPage = _.throttle(this.nextPage, 400, { trailing: false });

  renderCreationButton = ({ unclosedConvs }) => {
    const { settings, history, agenda } = this.props;
    const { getLabel } = this.context;
    const { allowCreateConversation, topListForm, creationButtonLabel, allClosedForCreate } = settings;

    const creationButton = (
      <LinkContainer to="/conversation/create" agenda={agenda}>
        {path => (
          <button
            className="btn btn-info btn-creation pull-right"
            onClick={() => history.push(path)}
          >
            {creationButtonLabel ? creationButtonLabel : getLabel('createConversation')}
          </button>
        )}
      </LinkContainer>
    );

    if (allClosedForCreate && unclosedConvs.length) {
      return null;
    }

    return allowCreateConversation && !topListForm ? creationButton : null;
  };

  render() {
    const {
      loading, loaded,
      conversations, nextLoading, history, showModal,
      createConversation, author, initialValues, settings, user,
      attachFileToMessage, res, agenda, totalOpened, totalClosed
    } = this.props;
    const { getLabel } = this.context;

    const {
      ContentWrapper, topListForm, prefix, emptyInboxLabel,
      creationSubtitle, maskCreationSubtitle, creationDesc,
      onConversationCreateRedirect, onConversationCreateFlash,
      displayHelp, allowCreateConversation, focusFistConversation,
      hideTitle, hideEmptyList
    } = settings;

    const [unclosedConvs, closedConvs] = _.partition(conversations, o => !o.closedAt);

    const content = loading || !loaded
      ? (
        <div className="padding-v-md" style={{ position: 'relative' }}>
          <Spinner />
        </div>
      ) : (
        <Fragment>
          <div className="inbox-head">
            {this.renderCreationButton({ unclosedConvs })}

            {topListForm && ((allowCreateConversation && !focusFistConversation) || !unclosedConvs.length) && !maskCreationSubtitle
              ? (
                <Breadcrumb
                  hideTitle={hideTitle}
                  breadParts={[
                    {
                      component: creationSubtitle ? creationSubtitle : getLabel('newConversation')
                    }
                  ]}
                  disableFirstPartLink
                />
              ) : <Breadcrumb hideTitle={hideTitle} />}

            {displayHelp ? (
              <a
                title={getLabel('needHelp')}
                target="_blank"
                href="https://doc.openagenda.com/la-messagerie/"
                className="pull-right"
              >
                <i className="fa fa-question-circle" />
              </a>
            ) : null}
          </div>

          {topListForm && ((allowCreateConversation && !focusFistConversation) || !unclosedConvs.length) ? <Fragment>
            {creationDesc ? <p dangerouslySetInnerHTML={{ __html: creationDesc }} /> : null}

            <div className="media">
              <div className="media-left">
                <AuthorAvatar author={author} />
              </div>
              <div className="media-body">
                <h4 className="media-heading margin-bottom-sm">{getAuthorName(author)}</h4>

                <ConversationForm
                  initialValues={initialValues}
                  Wrapper={this.FormWrapper}
                  onSubmit={values => createConversation(values, agenda)}
                  uploadEndpoint={res.messages.prepareAttachment.replace(
                    ':agendaUid',
                    agenda && agenda.uid
                  ) + '/s3/params'}
                  onConversationCreate={conversation => {
                    if (onConversationCreateRedirect) {
                      if (onConversationCreateFlash) {
                        setFlashMessage(onConversationCreateFlash);
                      }

                      window.location.href = onConversationCreateRedirect;
                    } else {
                      const url = removeTrailingSlash(prefix.replace(':slug', agenda && agenda.slug))
                        + `/conversation/${conversation.id}`;
                      history.push(url);

                      if (onConversationCreateFlash) {
                        showModal('messageSent', { message: onConversationCreateFlash });
                      } else {
                        showModal('messageSent');
                      }
                    }
                  }}
                  onFileUploaded={(...args) => attachFileToMessage(...args, agenda)}
                />
              </div>
            </div>
          </Fragment> : null}

          {conversations && conversations.length ? <h4 className="margin-bottom-md">
            {unclosedConvs.length ? totalOpened : totalClosed}{' '}
            {getLabel(
              unclosedConvs.length
                ? 'ongoingConversation' + (unclosedConvs.length > 1 ? 's' : '')
                : 'pastConversation' + (closedConvs.length > 1 ? 's' : '')
            )}
          </h4> : null}

          {unclosedConvs.length
            ? <ConversationList conversations={unclosedConvs} user={user} agenda={agenda} />
            : <ConversationList conversations={closedConvs} user={user} agenda={agenda} />}

          {unclosedConvs.length && closedConvs.length ? <Fragment>
            <h4 className="margin-bottom-md">
              {totalClosed}{' '}
              {getLabel('pastConversation' + (closedConvs.length > 1 ? 's' : ''))}
            </h4>

            <ConversationList conversations={closedConvs} user={user} agenda={agenda} />
          </Fragment> : null}

          {/*{conversations && conversations.length ? <ConversationList conversations={conversations} agenda={agenda}/> : null}*/}

          {!conversations?.length && !(hideEmptyList && topListForm) ?
            <div className="padding-v-md">
              {nl2br(getLabel(emptyInboxLabel || 'noResult'))}
            </div> :
            null}

          {nextLoading && (
            <div className="padding-v-md" style={{ position: 'relative' }}>
              <Spinner />
            </div>
          )}

          <Waypoint onEnter={this.throttledNextPage} />
        </Fragment>
      );

    return ContentWrapper
      ? <ContentWrapper>{content}</ContentWrapper>
      : content;
  }
}

function getAuthorName(obj) {
  if (obj.inboxUser) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}

export default Inbox;
