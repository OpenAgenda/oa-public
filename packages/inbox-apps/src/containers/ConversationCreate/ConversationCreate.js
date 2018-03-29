import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { getContext } from 'recompose';
import { ConversationForm, AuthorAvatar, Breadcrumb } from '../../components';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import * as inboxActions from '../../redux/modules/inbox';
import * as conversationActions from '../../redux/modules/conversation';
import * as modalActions from '../../redux/modules/modals';
import removeTrailingSlash from '../../utils/removeTrailingSlash';
import showBackLink from '../../utils/showBackLink';
import setFlashMessage from '../../utils/setFlashMessage';

@asyncConnect( [ {
  promise: async ( { store: { dispatch, getState } } ) => {
    const state = getState();

    const { focusFistConversation } = state.settings;
    const query = focusFistConversation ? { limit: 1 } : {};

    if ( !inboxActions.isLoaded( state ) ) {
      await dispatch( inboxActions.load( query ) );
    }

    if ( !conversationActions.isAuthorLoaded( state ) ) {
      return dispatch( conversationActions.loadAuthor() );
    }
  }
} ] )
@connect(
  ( state, props ) => ({
    initialValues: props.location.query.origin
      ? _.merge( state.settings.defaultQuery, { params: { origin: props.location.query.origin } } )
      : state.settings.defaultQuery,
    settings: state.settings,
    conversations: state.inbox.data,
    author: state.conversation.author,
    agenda: state.agenda,
    res: state.res
  }),
  {
    ...conversationFormActions,
    ...modalActions,
    attachFileToMessage: conversationActions.attachFileToMessage
  }
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class ConversationCreate extends Component {
  constructor( props ) {
    super( props );
    this.FromWrapper = ::this.FromWrapper;
  }

  FromWrapper( { handleSubmit, children, error } ) {
    const { getLabel, settings, author } = this.props;
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

        <button type="submit" className="btn btn-primary margin-top-xs">{getLabel( 'send' )}</button>
      </form>
    );
  }

  render() {
    const {
      createConversation, initialValues, getLabel, res,
      settings, conversations, author, router, showModal,
      attachFileToMessage, agenda
    } = this.props;

    const {
      prefix, ContentWrapper, creationDescriptionLabel,
      maskCreationSubtitle, creationSubtitle, creationDesc,
      onConversationCreateRedirect, onConversationCreateFlash
    } = settings;

    const content = (
      <Fragment>
        {maskCreationSubtitle
          ? (
            <div className="inbox-head">
              <Breadcrumb/>
            </div>
          ) : (
            <div className="inbox-head">
              <Breadcrumb
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
              form="conversation-create"
              initialValues={initialValues}
              Wrapper={this.FromWrapper}
              onSubmit={createConversation}
              uploadEndpoint={res.messages.prepareAttachment.replace( ':agendaUid', agenda && agenda.uid ) + '/s3/params'}
              onConversationCreate={conversation => {
                if ( onConversationCreateRedirect ) {
                  if ( onConversationCreateFlash ) {
                    setFlashMessage( onConversationCreateFlash );
                  }

                  window.location.href = onConversationCreateRedirect;
                } else {
                  const url = removeTrailingSlash( prefix ) + `/conversation/${conversation.id}`;
                  router.push( url );

                  if ( onConversationCreateFlash ) {
                    showModal( 'messageSent', { message: onConversationCreateFlash } );
                  } else {
                    showModal( 'messageSent' );
                  }
                }
              }}
              onFileUploaded={attachFileToMessage}
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
