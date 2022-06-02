import _ from 'lodash';

import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaBuilder from '@openagenda/form-schemas/client/build/FormSchemaBuilder';
import {getSupportedLocale} from '@openagenda/intl'
import { defineMessages, IntlProvider, injectIntl } from 'react-intl';

import locales from './locales-compiled';
import getSchemaFieldCount from './lib/getSchemaFieldCount';
import EnabledRanges from '@openagenda/event-form/build/components/configuration/EnabledRanges';

const messages = defineMessages({
  network: {
    id: 'AgendaSchema.network',
    defaultMessage: "Network",
  },
  networkDetail: {
    id: 'AgendaSchema.networkDetail',
    defaultMessage: "Field required by the agenda network",
  },
  event: {
    id: 'AgendaSchema.event',
    defaultMessage: "Standard",
  },
  eventDetail: {
    id: 'AgendaSchema.eventDetail',
    defaultMessage: "Standard event field",
  },
  needMoreFields: {
    id: 'AgendaSchema.needMoreFields',
    defaultMessage: "Need more fields?"
  },
  adaptForm: {
    id: 'AgendaSchema.adaptForm',
    defaultMessage: "Adapt the configuration of the event form"
  },
  canAddField: {
    id: 'AgendaSchema.canAddField',
    defaultMessage: "Vous pouvez ajouter le champ de votre choix au formulaire événement"
  }

});


if (module.hot) module.hot.accept();

class Main extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentFieldCount: getSchemaFieldCount(props.schema)
    }
  }

  onUpdate(updatedSchema) {
    this.setState({ currentFieldCount: getSchemaFieldCount(updatedSchema) });
  }

  renderHeadComponent() {
    const { maxFields } = this.props;

    return <div className="padding-all-sm">
      <label>{intl.formatMessage(messages.adaptForm)}</label>
      {maxFields === 1 ? <div>
        <p>{intl.formatMessage(messages.canAddField)}</p>
      </div> : null}
      {maxFields === 1 && maxFields === this.state.currentFieldCount ? <div>
        <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=agendaSchema`}>
          {intl.formatMessage(messages.needMoreFields)}
        </a>
      </div> : null}
    </div>
  }

  render() {
    const { lang, extensions, schema, maxFields, editableExtensions, intl } = this.props;

    return (
        <div>
          {intl.formatMessage(messages.eventDetail)}
          <FormSchemaBuilder
            lang={lang}
            addEnabled={maxFields > this.state.currentFieldCount}
            settingsEnabled={true}
            editableExtensions={editableExtensions}
            devState={{
              //editedField: 'title'
            }}
            schema={schema}
            extendedFrom={_.keys(extensions)
              .filter(extKey => extensions[extKey])
              .map(extKey => ({
                schema: extensions[extKey],
                info: {
                  label: intl.formatMessage(messages[extKey]),
                  detail: intl.formatMessage(messages[`${extKey}Detail`])
                }
              }))}
            onUpdate={this.onUpdate.bind(this)}
            renderHead={this.renderHeadComponent.bind(this)}
            components={{
              enabledRanges: EnabledRanges
            }}
            customFieldConfigurationSchemas={({
              timings: {
                fields: [{
                  field: 'label',
                  fieldType: 'abstract'
                }, {
                  field: 'sub',
                  fieldType: 'abstract'
                }, {
                  field: 'enabledRanges',
                  fieldType: 'enabledRanges',
                  label: 'Configurateur des saisie de dates',
                  selfHandled: ['label', 'info', 'help', 'sub']
                }],
              }
            })}
          />
          {maxFields === 1 && maxFields === this.state.currentFieldCount ? <div>
            <a href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=agendaSchema`}>
              {intl.formatMessage(messages.needMoreFields)}
            </a>
          </div> : null}
        </div>

    )
  }
}


const props = JSON.parse(document.getElementById('props').innerHTML);
const MainWithIntl = injectIntl(Main) 
render(
  <IntlProvider
    key={props.lang}
    locale={props.lang}
    messages={locales[props.lang]}
    defaultLocale={getSupportedLocale(props.lang)}
  >
    <MainWithIntl {...props} />
  </IntlProvider>, document.getElementById('app'));
