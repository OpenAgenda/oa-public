import React, { Component, useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Form, Field } from 'react-final-form';
import ImageUpload from '@openagenda/image-upload/components/build/ImageUploader';
import { ImageInput } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';

const MAX_SIZE = 1024 * 1024 * 20; // 20MB

function SubmitButton({ dirty, submitting, submitSucceeded, valid }) {
  const { getLabel } = useContext(I18nContext);

  if ( !dirty && submitSucceeded ) {
    return <button type="submit" className="btn btn-success" disabled>{getLabel( 'saved' )}</button>;
  } else if ( submitting ) {
    return <button type="submit" className="btn btn-primary" disabled>{getLabel( 'saving' )}</button>;
  } else {
    return (
      <button type="submit" className="btn btn-primary"{...{ disabled: dirty && valid ? undefined : true }}>
        {getLabel( 'save' )}
      </button>
    );
  }
}

function ImageForm({ handleSubmit, dirty, submitting, submitSucceeded, valid }) {
  const { getLabel, lang } = useContext(I18nContext);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">{getLabel('image')}</label>
        <Field
          name="image"
          component={ImageInput}
          type="file"
          extensions={['jpg', 'bmp', 'png', 'jpeg']}
          locale={lang}
          maxSize={MAX_SIZE}
        />
      </div>
      <div className="pull-right">
        <SubmitButton
          dirty={dirty}
          submitting={submitting}
          submitSucceeded={submitSucceeded}
          valid={valid}
        />
      </div>
    </form>
  );
}

@connect(state => ({
  prefix: state.settings.prefix
}))
export default class ImageSettings extends Component {
  static propTypes = {
    activeTab: PropTypes.bool
  };

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  render() {
    const { getLabel } = this.context;
    const { activeTab, history, onUpdate, image, prefix } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => history.push(prefix + '/image', { fromUserApps: true }) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push(prefix + '/', { fromUserApps: true }) : null}
          className="col-md-3" style={{ cursor: 'pointer' }}
        >
          {getLabel('profileImage')}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <Form
              onSubmit={
                (values, form) => onUpdate(values)
                  .then(result => {
                    setTimeout(() => form.restart());

                    return result;
                  })
              }
              component={ImageForm}
              initialValues={{
                image
              }}
            />
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabel('modify')}</td>}
      </tr>
    );
  }
}
