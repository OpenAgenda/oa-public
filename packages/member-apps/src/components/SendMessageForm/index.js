import { Component } from 'react';
import FormSchemaComponent from '@openagenda/form-schemas/client/build';

import I18nContext from '../../contexts/I18nContext';
import actionComponents from '../../utils/actionComponents';
import schema from './schema';

export default class InviteMembersForm extends Component {
  static contextType = I18nContext;

  render() {
    const { onSubmit: onPropsSubmit } = this.props;

    return (
      <I18nContext.Consumer>
        {({ getLabel, lang }) => (
          <FormSchemaComponent
            schema={schema({
              lang,
              getLabel,
            })}
            onSubmit={({ clean }) => {
              onPropsSubmit(clean);
            }}
            actionComponents={actionComponents(getLabel)}
          />
        )}
      </I18nContext.Consumer>
    );
  }
}
