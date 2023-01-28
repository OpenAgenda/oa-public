import { Component } from 'react';
import FormSchemaComponent from '@openagenda/form-schemas/client/build';

import I18nContext from '../../contexts/I18nContext';
import actionComponents from '../../utils/actionComponents';
import EmailsComponent from './EmailsComponent';
import schema from './schema';

export default class InviteMembersForm extends Component {
  static contextType = I18nContext;

  render() {
    const { onSubmit: onPropsSubmit, agenda } = this.props;

    return (
      <I18nContext.Consumer>
        {({ getLabel }) => (
          <FormSchemaComponent
            components={{
              emails: EmailsComponent,
            }}
            schema={schema({
              getLabel,
              areModeratorsEnabled: agenda.credentials.moderators,
              isAgendaPrivate: agenda.private,
              isInvitationMessageEnabled: agenda.credentials.invitationMessage,
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
