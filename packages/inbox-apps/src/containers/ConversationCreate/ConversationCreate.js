import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { getContext } from 'recompose';
import { Title, ConversationForm, Link, MessageAvatar } from '../../components';
import * as conversationFormActions from '../../redux/modules/conversationForm';
import * as conversationActions from '../../redux/modules/conversation';
import removeTrailingSlash from '../../utils/removeTrailingSlash';

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
    initialValues: state.settings.defaultQuery,
    settings: state.settings,
    conversations: state.inbox.data,
    author: state.conversation.author
  }),
  conversationFormActions
)
@getContext( {
  getLabel: PropTypes.func
} )
export default class ConversationCreate extends Component {
  constructor( props ) {
    super( props );
    this.renderForm = ::this.renderForm;
  }

  state = {
    defaultValues: this.props.defaultValues
  };

  renderForm( { FormComponent, handleSubmit } ) {
    const { getLabel } = this.props;

    return (
      <form onSubmit={handleSubmit} className="conversation-form">
        <FormComponent className="margin-bottom-md" />

        <button type="submit" className="btn btn-primary">{getLabel( 'send' )}</button>
      </form>
    );
  }

  render() {
    const {
      createConversation, initialValues, getLabel,
      settings, conversations, author, router
    } = this.props;

    const { prefix, focusFistConversation, hideEmptyList, TitleComponent, ContentWrapper } = settings;

    const showBackLink = !focusFistConversation && !(hideEmptyList && (conversations && !conversations.length));

    // display MessageAvatar with settings.conversationCreator

    const content = [
      showBackLink && <div key="back-to-list">
        <Link to="/">{getLabel( 'backToConversations' )}</Link>
      </div>,

      <div className="media" key="form">
        <div className="media-left">
          <MessageAvatar message={author} />
        </div>
        <div className="media-body">
          <h4 className="media-heading margin-bottom-sm">{getAuthorName( author )}</h4>

          <ConversationForm
            key="form"
            onSubmit={data => createConversation( data )
              .then( result => {
                const url = removeTrailingSlash( prefix ) + `/conversation/${result.conversation.id}`;
                router.push( url );
              } )
            }
            initialValues={initialValues}
            className="margin-top-md margin-bottom-lg"
          >
            {this.renderForm}
          </ConversationForm>
        </div>
      </div>
    ];

    return [
      <Title
        tab="createConversation"
        key="title"
        Component={TitleComponent}
      />,

      ...(ContentWrapper
          ? [ <ContentWrapper key="contentWrapper">{content}</ContentWrapper> ]
          : content
      )
    ];
  }
}

function getAuthorName( obj ) {
  if ( obj.inboxUser ) {
    return obj.inboxUser.name;
  }

  return obj.inbox.name;
}
