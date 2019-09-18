import React, { Component, createElement, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { mapProps, getContext } from 'recompose';
import superagent from 'superagent';
import Uppy from 'uppy/lib/core';
import { Dashboard, StatusBar } from 'uppy/lib/react';
import AwsS3 from 'uppy/lib/plugins/AwsS3';
import Modal from '@openagenda/react-components/build/Modal';
import validate from './validate';
import { renderTextarea } from '../../utils/form';
import * as uppyLocales from '../../locales/uppyLocales';


function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

@mapProps(props => (props.initialValues ? {
  ...props,
  initialValues: {
    ...props.initialValues,
    destinationInbox: parseJsonValue(props.initialValues.destinationInbox),
    type: props.initialValues.type,
    params: parseJsonValue(props.initialValues.params)
  }
} : props))
@getContext({
  getLabel: PropTypes.func,
  lang: PropTypes.string,
  store: PropTypes.object
})
export default class ConversationForm extends Component {
  static propTypes = {
    Wrapper: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element
    ])
  };

  static defaultProps = {
    Wrapper: 'div',
    autoFocus: false
  };

  state = {
    modalOpen: false
  };

  constructor(props) {
    super(props);

    const { uploadEndpoint, lang } = props;

    const uppy = this.uppy = Uppy({
      restrictions: {
        maxNumberOfFiles: 4,
        allowedFileTypes: [
          'image/*',
          'text/csv',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf'
        ]
      },
      autoProceed: false,
      locale: uppyLocales.Core[lang] || uppyLocales.Core['fr']
    });

    uppy.use(AwsS3, {
      // host: uploadEndpoint,
      getUploadParameters(file) {
        return superagent
          .get(uploadEndpoint.replace(':conversationId', uppy.getState().meta.conversationId))
          .query({
            filename: file.name,
            type: file.type,
            meta: uppy.getState().meta
          })
          .then(response => response.body);
      }
    })
      .run();
  }

  componentWillUnmount() {
    this.uppy.close();
  }

  handleOpen = () => {
    this.setState({
      modalOpen: true
    });
  };

  handleClose = () => {
    this.setState({
      modalOpen: false
    })
  };

  handleSubmit = async (data, form) => {
    const { onSubmit, onConversationCreate, onFileUploaded, getLabel } = this.props;

    let conversation;

    try {
      ({ conversation } = await onSubmit(data));
    } catch (e) {
      return { [FORM_ERROR]: getLabel('sendMessageError') };
    }

    const { latestMessage: message } = conversation;
    form.change('message');

    this.uppy.setMeta({ messageId: message.id, conversationId: conversation.id });

    const uppyState = this.uppy.getState();
    const uncompleteUploads = Object.values(uppyState.files).filter(v => !v.progress.uploadComplete);

    if (uncompleteUploads.length) {
      try {
        const uploadResult = await this.uppy.upload();

        if (uploadResult.failed.length) { // or uppyState.totalProgress !== 100
          if (onConversationCreate) {
            onConversationCreate(conversation, form);
          }

          return { [FORM_ERROR]: getLabel('uploadError') };
        } else {
          for (const file of Object.values(uploadResult.successful)) {
            await onFileUploaded(conversation.id, message.id, file);
          }

          this.uppy.reset();
        }
      } catch (e) {
        if (onConversationCreate) {
          onConversationCreate(conversation, form);
        }

        return { [FORM_ERROR]: getLabel('uploadError') };
      }
    }

    if (onConversationCreate) {
      onConversationCreate(conversation, form);
    }
  };

  render() {
    const { getLabel, initialValues, Wrapper, lang, autoFocus } = this.props;

    const numberFiles = Object.keys(this.uppy.getState().files).length;

    return (
      <Form
        initialValues={initialValues}
        onSubmit={this.handleSubmit}
        validate={validate}
      >
        {({ form, handleSubmit, submitting, submitError }) => (
          createElement(
            Wrapper,
            {
              form,
              submitting,
              submitError,
              handleSubmit
            },
            <Fragment>
              <Field
                name="destinationInbox"
                component="input"
                type="hidden"
              />
              <Field
                name="type"
                component="input"
                type="hidden"
              />
              <Field
                name="params"
                component="input"
                type="hidden"
              />
              <Field
                component={renderTextarea}
                name="message"
                className="form-control"
                classNameGroup="margin-v-xs"
                rows="3"
                getErrorLabel={getLabel}
                onKeyDown={e => {
                  if (e.keyCode === 13 && e.ctrlKey) {
                    form.submit();
                  }
                }}
                placeholder={
                  _.isMatch(initialValues, { destinationInbox: { identifier: 1, type: 'support' }, type: 'support' })
                    ? getLabel('supportPlaceholder')
                    : getLabel('yourMessage')
                }
                autoFocus={autoFocus}
                displayError={meta => meta.modified && meta.submitFailed}
              />

              <p>
                <a role="button" onClick={this.handleOpen}>
                  {numberFiles === 0 ? getLabel('attachFile') : null}
                  {numberFiles === 1 ? getLabel('oneAttachment') : null}
                  {numberFiles > 1 ? getLabel('nAttachments', { number: numberFiles }) : null}
                </a>
              </p>

              {this.state.modalOpen && <Modal
                title={getLabel('uppyModalTitle')}
                visible={this.state.modalOpen}
                onClose={this.handleClose}
                classNames={{
                  overlay: 'popup-overlay attachments-upload'
                }}
                disableBodyScroll
              >
                <Dashboard
                  uppy={this.uppy}
                  closeModalOnClickOutside
                  hideUploadButton={true}
                  disableStatusBar={true}
                  maxHeight={300}
                  note={getLabel('uppyNote')}
                  locale={uppyLocales.Dashboard[lang] || uppyLocales.Dashboard['fr']}
                />

                <div className="text-center padding-top-md">
                  <button className="btn btn-info" onClick={this.handleClose}>
                    {getLabel('validate')}
                  </button>
                </div>
              </Modal>}

              <StatusBar
                uppy={this.uppy}
                hideUploadButton={true}
                showProgressDetails={true}
                locale={uppyLocales.StatusBar[lang] || uppyLocales.StatusBar['fr']}
              />
            </Fragment>
          )
        )}
      </Form>
    );
  }
};
