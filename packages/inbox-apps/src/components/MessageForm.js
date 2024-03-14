import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import validate from '../utils/validateMessage';
import { renderTextarea } from '../utils/form';
import I18nContext from '../contexts/I18nContext';
import Attachments from './LoadableAttachments';

export default class MessageForm extends Component {
  static defaultProps = {
    Wrapper: 'div',
  };

  static contextType = I18nContext;

  constructor(props) {
    super(props);

    this.state = {
      uppy: null,
    };
  }

  handleSubmit = async (data, form) => {
    const { onSubmit, onMessageSent, onFileUploaded, conversation } = this.props;
    const { uppy } = this.state;
    const { getLabel } = this.context;

    const { message } = await onSubmit(data);
    form.change('body');

    uppy.setMeta({ messageId: message.id });

    const uppyState = uppy.getState();
    const uncompleteUploads = Object.values(uppyState.files).filter(v => !v.progress.uploadComplete);

    if (uncompleteUploads.length) {
      try {
        const uploadResult = await uppy.upload();

        if (uploadResult.failed.length) { // or uppyState.totalProgress !== 100
          if (onMessageSent) {
            onMessageSent(message, form);
          }

          return { [FORM_ERROR]: getLabel('uploadError') };
        }
        for (const file of uploadResult.successful) {
          await onFileUploaded(conversation.id, message.id, file);
        }

        uppy.cancelAll();
      } catch (e) {
        if (onMessageSent) {
          onMessageSent(message, form);
        }

        return { [FORM_ERROR]: getLabel('uploadError') };
      }
    }

    if (onMessageSent) {
      onMessageSent(message, form);
    }
  };

  render() {
    const { initialValues, autoFocus, Wrapper, uploadEndpoint } = this.props;
    const { getLabel } = this.context;

    return (
      <Form
        initialValues={initialValues}
        onSubmit={this.handleSubmit}
        validate={validate}
      >
        {({ form, handleSubmit, submitting, submitError }) =>
          React.createElement(
            Wrapper,
            {
              form,
              submitting,
              submitError,
              handleSubmit,
            },
            <>
              <Field
                autoFocus={autoFocus}
                component={renderTextarea}
                name="body"
                className="form-control"
                classNameGroup="margin-v-xs"
                rows="3"
                getErrorLabel={getLabel}
                onKeyDown={e => {
                  if (e.keyCode === 13 && e.ctrlKey) {
                    form.submit();
                  }
                }}
                placeholder={getLabel('yourMessage')}
                displayError={meta => meta.modified && meta.submitFailed}
              />

              <Attachments
                setUppy={uppy => this.setState({ uppy })}
                uploadEndpoint={uploadEndpoint}
              />
            </>,
          )}
      </Form>
    );
  }
}
