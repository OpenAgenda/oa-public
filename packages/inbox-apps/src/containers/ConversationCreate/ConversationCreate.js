import React, { Component, Fragment } from 'react';
import { connect, ReactReduxContext } from 'react-redux';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import { withContext, withLayoutData, Spinner } from '@openagenda/react-shared';
import I18nContext from '../../contexts/I18nContext';
import { ConversationForm, AuthorAvatar, Breadcrumb } from '../../components';
import * as conversationFormActions from '../../reducers/conversationForm';
import * as inboxActions from '../../reducers/inbox';
import * as conversationActions from '../../reducers/conversation';
import * as modalActions from '../../reducers/modals';
import removeTrailingSlash from '../../utils/removeTrailingSlash';
import showBackLink from '../../utils/showBackLink';
import setFlashMessage from '../../utils/setFlashMessage';

async function asyncLoad( { store: { dispatch, getState }, agenda } ) {
  const state = getState();

  const { focusFistConversation } = state.settings;
  const query = focusFistConversation ? { limit: 1 } : {};

  if ( !inboxActions.isLoaded( state ) ) {
    await dispatch( inboxActions.load( query, agenda ) );
  }

  if ( !conversationActions.isAuthorLoaded( state ) ) {
    return dispatch( conversationActions.loadAuthor(agenda) );
  }
}

@withLayoutData('agenda')
@connect(
  ( state, props ) => {
    const query = qs.parse( props.location.search, { ignoreQueryPrefix: true } );

    return {
      initialValues: query.origin
        ? _.merge( state.settings.defaultQuery, { params: { origin: query.origin } } )
        : state.settings.defaultQuery,
      settings: state.settings,
      conversations: state.inbox.data,
      author: state.conversation.author,
      loading: state.inbox.loading || state.conversation.authorFetching,
      loaded: state.inbox.loaded && state.conversation.author,
      res: state.res
    };
  },
  {
    ...conversationFormActions,
    ...modalActions,
    attachFileToMessage: conversationActions.attachFileToMessage
  }
)
@withContext(ReactReduxContext, 'reactReduxContext')
@withRouter
class ConversationCreate extends Component {
  static contextType = I18nContext;

  componentDidMount() {
    const { reactReduxContext, agenda } = this.props;
    const { store } = reactReduxContext;

    asyncLoad({ store, agenda }).catch(() => null);
  }

  FormWrapper = ( { handleSubmit, children, submitting, error } ) => {
    const { settings, author } = this.props;
    const { getLabel } = this.context;
    const { belowMessageDesc } = settings;

    return (
      <form onSubmit={handleSubmit} className="conversation-form margin-bottom-md">
        {children}

        {error ? <p className="text-danger">{error}</p> : null}

        {author.inbox && author.inbox.type !== 'user' && author.inboxUser
          ? <div className="margin-bottom-xs">{getLabel( 'yourMessageWillBeSigned' )} <b>{author.inbox.name}</b></div>
          : null}

        {belowMessageDesc
          ? <div className="margin-bottom-xs" dangerouslySetInnerHTML={{ __html: belowMessageDesc }}/>
          : null}

        <button type="submit" className="btn btn-primary margin-top-xs">
          {getLabel( 'send' )}

          {submitting && (
            <span className="margin-h-sm">
              <Spinner mode="inline" />
            </span>
          )}
        </button>
      </form>
    );
  }

  render() {
    const {
      loading, loaded, createConversation, initialValues, res,
      settings, conversations, author, history, showModal,
      attachFileToMessage, agenda
    } = this.props;
    const { getLabel } = this.context;

    const {
      prefix, ContentWrapper, creationDescriptionLabel,
      maskCreationSubtitle, creationSubtitle, creationDesc,
      onConversationCreateRedirect, onConversationCreateFlash
    } = settings;

    const content = loading || !loaded
      ? <div className="text-center padding-v-md">
        <Spinner loading={loading} mode="inline" options={{
          width: 1,
          length: 6,
          radius: 10,
          color: '#666'
        }}/>
      </div>
      : (
        <Fragment>
          {maskCreationSubtitle
            ? (
              <div className="inbox-head">
                <Breadcrumb agenda={agenda} />
              </div>
            ) : (
              <div className="inbox-head">
                <Breadcrumb
                  agenda={agenda}
                  breadParts={[ {
                    component: creationSubtitle ? creationSubtitle : getLabel( 'newConversation' )
                  } ]}
                  disableFirstPartLink={!showBackLink( settings, conversations )}
                />
              </div>
            )}

          {creationDesc ? <p dangerouslySetInnerHTML={{ __html: creationDesc }}/> : null}

          {creationDescriptionLabel ? <p>{creationDescriptionLabel}</p> : null}

          <div className="media">
            <div className="media-left">
              <AuthorAvatar author={author}/>
            </div>
            <div className="media-body">
              <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

              <ConversationForm
                initialValues={initialValues}
                Wrapper={this.FormWrapper}
                onSubmit={values => createConversation(values, agenda)}
                uploadEndpoint={res.messages.prepareAttachment.replace( ':agendaUid', agenda && agenda.uid ) + '/s3/params'}
                onConversationCreate={conversation => {
                  if ( onConversationCreateRedirect ) {
                    if ( onConversationCreateFlash ) {
                      setFlashMessage( onConversationCreateFlash );
                    }

                    window.location.href = onConversationCreateRedirect;
                  } else {
                    const url = removeTrailingSlash(prefix.replace(':slug', agenda && agenda.slug) )
                      + `/conversation/${conversation.id}`;
                    history.push( url );

                    if ( onConversationCreateFlash ) {
                      showModal( 'messageSent', { message: onConversationCreateFlash } );
                    } else {
                      showModal( 'messageSent' );
                    }
                  }
                }}
                onFileUploaded={(...args) => attachFileToMessage(...args, agenda)}
                autoFocus={settings.autoFocus}
              />
            </div>
          </div>
        </Fragment>
      );

    return ContentWrapper
      ? <ContentWrapper>{content}</ContentWrapper>
      : content;
  }
}

function getAuthorName( obj ) {
  if ( obj.inboxUser ) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}

export default ConversationCreate;
