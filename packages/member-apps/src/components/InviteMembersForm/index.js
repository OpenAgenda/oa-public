import { Component } from 'react';
import FormSchemaComponent from '@openagenda/form-schemas/client/build/index.js';

import I18nContext from '../../contexts/I18nContext.js';
import actionComponents from '../../utils/actionComponents.js';
import EmailsComponent from './EmailsComponent.js';
import schema from './schema.js';

export default class InviteMembersForm extends Component {
  static contextType = I18nContext;

  render() {
    const { onSubmit: onPropsSubmit, agenda, userCredential } = this.props;

    return (
      <I18nContext.Consumer>
        {({ getLabel }) => (
          <FormSchemaComponent
            components={{
              emails: EmailsComponent,
            }}
            schema={schema({
              getLabel,
              areModeratorsEnabled: agenda.credentials?.moderators,
              isAgendaPrivate: agenda.private,
              isInvitationMessageEnabled: agenda.credentials.invitationMessage,
              modoCanInviteModo: agenda.settings.contribution.modoCanInviteModo,
              userCredential,
            })}
            onSubmit={({ clean }) => {
              onPropsSubmit(clean);
            }}
            actionComponents={actionComponents({
              getLabel,
              label: 'inviteMembers',
            })}
          />
        )}
      </I18nContext.Consumer>
    );
  }
}
