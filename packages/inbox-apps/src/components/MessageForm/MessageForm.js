import React, { Component, createElement, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { getContext } from 'recompose';
import superagent from 'superagent';
import Uppy from 'uppy/lib/core';
import { Dashboard, StatusBar } from 'uppy/lib/react';
import AwsS3 from 'uppy/lib/plugins/AwsS3';
import Modal from '@openagenda/react-components/build/Modal';
import validate from './validate';
import { renderTextarea } from '../../utils/form';
import * as uppyLocales from '../../locales/uppyLocales';

@reduxForm({
  validate
})
@getContext({
  getLabel: PropTypes.func,
  lang: PropTypes.string,
  store: PropTypes.object
})
export default class MessageForm extends Component {
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
          .get(uploadEndpoint + '/s3/params')
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
  }

  handleClose = () => {
    this.setState({
      modalOpen: false
    })
  }

  handleSubmit = this.props.handleSubmit(async data => {
    const { reset, onSubmit, onMessageSent, onFileUploaded, getLabel, conversation } = this.props;

    const { message } = await onSubmit(data);
    reset();

    this.uppy.setMeta({ messageId: message.id });

    const uppyState = this.uppy.getState();
    const uncompleteUploads = Object.values(uppyState.files).filter(v => !v.progress.uploadComplete);

    if (uncompleteUploads.length) {
      try {
        const uploadResult = await this.uppy.upload();

        if (uploadResult.failed.length) { // or uppyState.totalProgress !== 100
          throw new SubmissionError({ _error: getLabel('uploadError') });
        } else {
          for (const file of Object.values(uploadResult.successful)) {
            await onFileUploaded(conversation.id, message.id, file);
          }

          this.uppy.reset();
        }
      } catch (e) {
        if (e instanceof SubmissionError) {
          throw e;
        }
        console.log('Error on upload:', e);
        throw new SubmissionError({ _error: getLabel('uploadError') });
      }
    }

    if (onMessageSent) {
      await onMessageSent();
    }
  });

  render() {
    const { autoFocus, submitting, getLabel, lang, Wrapper, error } = this.props;

    const numberFiles = Object.keys(this.uppy.getState().files).length;

    return createElement(
      Wrapper,
      { handleSubmit: this.handleSubmit, submitting, error },
      <Fragment>
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
              this.handleSubmit();
            }
          }}
          placeholder={getLabel('yourMessage')}
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
    );
  }
}
