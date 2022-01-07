'use strict';

import debug from 'debug';
import React from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import get from '@openagenda/utils/get';
import { Portal } from '@openagenda/react-portal-ssr';
import { IntlProvider, defineMessages, useIntl } from 'react-intl';
import locales from '../../locales-compiled';

import {
  hasAdditionalFields,
  formatAdditionalFieldData
} from './additionalFields.utils';

const log = debug('displayAdditionalFields');

const messages = defineMessages({
  noSelection: {
    id: 'displayAdditionalFields.noSelectionValue',
    defaultMessage: 'No selection'
  },
  noInput: {
    id: 'displayAdditionalFields.emptyValue',
    defaultMessage: 'No input'
  },
  privateField: {
    id: 'displayAdditionalFields.privateField',
    defaultMessage: 'Restricted information'
  },
  noImage: {
    id: 'displayAdditionalFields.noImage',
    defaultMessage: 'No image is loaded'
  },
  noFile: {
    id: 'displayAdditionalFields.noFile',
    defaultMessage: 'No file is loaded'
  },
  additionalFieldsInfo: {
    id: 'displayAdditionalFields.additionalFieldsInfo',
    defaultMessage: 'Event values specific to this agenda are displayed in the next section below'
  },
  goToAdditionalFields: {
    id: 'displayAdditionalFields.goToAdditionalFields',
    defaultMessage: 'see'
  }
});

const renderLabel = (field, m) => (
  <label className={field.isRestricted ? 'privateable' : ''}>
    <span className="margin-right-xs">{field.label}</span>
    {field.isRestricted ? (
      <div className="private-label">
        <i className="fa fa-unlock-alt"></i>&nbsp;<span>{m(messages.privateField)}</span>
      </div>
    ) : null}
  </label>
);

const renderDefaultField = (field, m) => (<>
  {renderLabel(field, m)}
  <div>
    {field.value ? field.value : (
      <em className="text-muted">{m(messages.noInput)}</em>
    )}
  </div>
</>);

const renderLinkField = (field, m) => {
  const prefix = ({
    phone: 'tel:',
    link: '',
    email: 'mailto:'
  })[field.fieldType];

  return (
    <>
      {renderLabel(field, m)}
      <div>
        {field.value ? <a target="_blank" href={`${prefix}${field.value}`}>{field.value}</a> : (
          <em className="text-muted">{m(messages.noInput)}</em>
        )}
      </div>
    </>
  );
}

const renderOptionedField = (field, m) => (<>
  {renderLabel(field, m)}
  <div>
    {field.value?.length ? field.value.join(', ') : (
      <em className="text-muted">{m(messages.noSelection)}</em>
    )}
  </div>
</>);

const renderFileField = (field, m) => (<>
  {renderLabel(field, m)}
  <div>
  {field.value ? (
    <a
      target="_blank"
      href={field.value.link}
    >{field.value.originalName}</a>
  ) : (
    <em className="text-muted">{m(messages.noFile)}</em>
  )}
  </div>
</>);

const renderImageField = (field, m) => (<>
  {renderLabel(field, m)}
  <div className="row">
    <div className="col-xs-12 col-print-6">
      {field.value ? (
        <img 
          className="img-responsive"
          src={field.value.link}
          alt={field.label}
        />
      ) : (
        <em className="text-muted">{m(messages.noImage)}</em>
      )}
    </div>
  </div>
</>);

const renderField = (field, m) => {
  switch (field.fieldType) {
    case 'link':
    case 'phone':
    case 'email':
      return renderLinkField(field, m);
    case 'image':
      return renderImageField(field, m);
    case 'file':
      return renderFileField(field, m);
    default:
      return field.isOptioned ? renderOptionedField(field, m) : renderDefaultField(field, m)
  }
}

function AdditionalFieldsSection({ additionalFields }) {
  const m = useIntl().formatMessage;

  return (<>
    <div id="additional-fields" className="padding-top-xl">
      <div className="event-content">
        <div className="event-content-section">
          <ul className="list-unstyled">
            {additionalFields.map(field => (
              <li key={field.key} className="margin-bottom-sm padding-bottom-xs">
                {renderField(field, m)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    <Portal key="additional-fields-info" selector=".js_additional_fields_info">
      <div className="tag-groups margin-bottom-sm">
        <em className="text-muted margin-right-xs">{m(messages.additionalFieldsInfo)}</em>
        <a href="#additional-fields">{m(messages.goToAdditionalFields)}</a>
      </div>
    </Portal>
  </>
  )
}


function displayAdditionalFields({ agendaUid, eventUid, lang }) {
  get(window.env === 'tpl' ? '/server/testdata/agendawithadditionalfields.json' : `/api/agendas/${agendaUid}`, (err, agendaResponse) => {
    if (err) {
      log('error when trying to load agenda schema');
      log(err)
      return;
    }

    get(window.env === 'tpl' ? '/server/testdata/eventdatawithadditionalfields.json' : `/api/agendas/${agendaUid}/events/${eventUid}`, (err, eventResponse) => {
      if (err) {
        log('error when trying to load event data');
        log(err);
        return;
      }

      if (!hasAdditionalFields(agendaResponse.schema)) {
        return;
      }

      const additionalFields = formatAdditionalFieldData(agendaResponse.schema, eventResponse.event, lang);
      
      ReactDom.render(
        <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
          <AdditionalFieldsSection
            additionalFields={additionalFields}
            lang={lang}
          />
        </IntlProvider>,
        du.el('.js_additional_fields')
      );
    });
  });

}

export default displayAdditionalFields;
