import { Component } from 'react';
import { Form, Field } from 'react-final-form';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import {
  renderInput,
  renderMarkdownInput,
  renderCheckbox,
} from '../../utils/form';
import I18nContext from '../../contexts/I18nContext';
import validate from './validate';

export default class SendMessageForm extends Component {
  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.renderInput = renderInput.bind(this);
    this.renderMarkdownInput = renderMarkdownInput.bind(this);
    this.renderCheckbox = renderCheckbox.bind(this);
  }

  render() {
    const { onSubmit } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="invite-members-form">
            <Field
              label={getLabel('replyTo')}
              component={this.renderInput}
              name="replyTo"
              type="text"
              classNameGroup="margin-v-md"
              className="form-control"
              placeholder={
                lang === 'fr'
                  ? 'ne-pas-repondre@openagenda.com'
                  : 'no-reply@openagenda.com'
              }
            />
            <Field
              label={getLabel('message')}
              component={this.renderMarkdownInput}
              name="message"
              classNameGroup="margin-top-md margin-bottom-lg"
              displayFeedback={false}
              loadComponent={(
                <div style={{ height: '200px', position: 'relative' }}>
                  <Spinner />
                </div>
              )}
            />

            <Field
              label={getLabel('sendOnlyToInactives')}
              component={this.renderCheckbox}
              name="inactive"
              type="checkbox"
              classNameGroup="margin-v-md"
            />

            <div className="text-center">
              <button className="btn btn-primary" type="submit">
                {getLabel('sendMessage')}
              </button>
            </div>
          </form>
        )}
      />
    );
  }
}
