import { Component, createElement } from 'react';
import _ from 'lodash';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { renderTextarea } from '../utils/form';
import I18nContext from '../contexts/I18nContext';
import validate from '../utils/validateConversation';
import Attachments from './LoadableAttachments';

function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export default class ConversationForm extends Component {
  static defaultProps = {
    Wrapper: 'div',
    autoFocus: false,
  };

  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.state = {
      uppy: null,
    };

    if (props.initialValues) {
      this.initialValues = {
        ...props.initialValues,
        destinationInbox: parseJsonValue(props.initialValues.destinationInbox),
        type: props.initialValues.type,
        params: parseJsonValue(props.initialValues.params),
      };
    } else {
      this.initialValues = props.initialValues;
    }
  }

  handleSubmit = async (data, form) => {
    const { onSubmit, onConversationCreate, onFileUploaded, uploadEndpoint } = this.props;
    const { uppy } = this.state;
    const { getLabel } = this.context;

    let conversation;

    try {
      ({ conversation } = await onSubmit(data));
    } catch (e) {
      return { [FORM_ERROR]: getLabel('sendMessageError') };
    }

    const { latestMessage: message } = conversation;
    form.change('message');

    uppy.setMeta({ messageId: message.id, conversationId: conversation.id });

    const awsS3MultipartPlugin = uppy.getPlugin('AwsS3Multipart');
    const AwsS3MultipartPlugin = awsS3MultipartPlugin.constructor;

    uppy.removePlugin(awsS3MultipartPlugin);
    uppy.use(AwsS3MultipartPlugin, {
      shouldUseMultipart: (file) => file.size > 100 * 2 ** 20,
      companionUrl: uploadEndpoint.replace(':conversationId', conversation.id),
    });

    const uppyState = uppy.getState();
    const uncompleteUploads = Object.values(uppyState.files).filter(
      (v) => !v.progress.uploadComplete,
    );

    if (uncompleteUploads.length) {
      try {
        const uploadResult = await uppy.upload();

        if (uploadResult.failed.length) {
          // or uppyState.totalProgress !== 100
          if (onConversationCreate) {
            onConversationCreate(conversation, form);
          }

          return { [FORM_ERROR]: getLabel('uploadError') };
        }
        for (const file of uploadResult.successful) {
          await onFileUploaded(conversation.id, message.id, file);
        }

        uppy.cancelAll();
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
    const { autoFocus, Wrapper, uploadEndpoint } = this.props;
    const { getLabel } = this.context;

    return (
      <Form
        initialValues={this.initialValues}
        onSubmit={this.handleSubmit}
        validate={validate}
      >
        {({ form, handleSubmit, submitting, submitError }) =>
          createElement(
            Wrapper,
            {
              form,
              submitting,
              submitError,
              handleSubmit,
            },
            <>
              <Field name="destinationInbox" component="input" type="hidden" />
              <Field name="type" component="input" type="hidden" />
              <Field name="params" component="input" type="hidden" />
              <Field
                component={renderTextarea}
                name="message"
                className="form-control"
                classNameGroup="margin-v-xs"
                rows="3"
                getErrorLabel={getLabel}
                onKeyDown={(e) => {
                  if (e.keyCode === 13 && e.ctrlKey) {
                    form.submit();
                  }
                }}
                placeholder={
                  _.isMatch(this.initialValues, {
                    destinationInbox: { identifier: 1, type: 'support' },
                    type: 'support',
                  })
                    ? getLabel('supportPlaceholder')
                    : getLabel('yourMessage')
                }
                autoFocus={autoFocus}
                displayError={(meta) => meta.modified && meta.submitFailed}
              />

              <Attachments
                setUppy={(uppy) => this.setState({ uppy })}
                uploadEndpoint={uploadEndpoint}
              />
            </>,
          )}
      </Form>
    );
  }
}
