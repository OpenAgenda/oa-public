import debug from 'debug';
import React from 'react';
import ReactDom from 'react-dom';
import du from '@openagenda/dom-utils';
import get from '@openagenda/utils/get';
import { getSupportedLocale } from '@openagenda/intl';
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
  <div className={field.fieldType === 'date' ? 'date margin-bottom-sm' : 'margin-bottom-sm'}>
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
      <div className='margin-bottom-sm'>
        {field.value ? <a target="_blank" href={`${prefix}${field.value}`}>{field.value}</a> : (
          <em className="text-muted">{m(messages.noInput)}</em>
        )}
      </div>
    </>
  );
}

const renderOptionedField = (field, m) => (<>
  {renderLabel(field, m)}
  <div className='margin-bottom-sm'>
    {field.value?.length ? field.value.join(', ') : (
      <em className="text-muted">{m(messages.noSelection)}</em>
    )}
  </div>
</>);

const renderFileField = (field, m) => (<>
  {renderLabel(field, m)}
  <div className='margin-bottom-sm'>
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

const renderImageField = (field, m, updatedAt) => (<>
  {renderLabel(field, m)}
  <div className="row margin-bottom-sm">
    <div className="col-xs-12 col-print-6">
      {field.value ? (
        <img
          className="img-responsive"
          src={`${field.value.link}?_ts=${updatedAt}`}
          alt={field.label}
        />
      ) : (
        <em className="text-muted">{m(messages.noImage)}</em>
      )}
    </div>
  </div>
</>);

const renderHTML= (field, m ) => (
  <>{renderLabel(field, m)}
  <div className="margin-bottom-sm">
    {field.value ? (
      <div dangerouslySetInnerHTML={{__html: field.value}} />
    ): (
      <em className="text-muted">{m(messages.noInput)}</em>
    )}
    </div>
  </>
)

const renderField = (field, m, updatedAt) => {
  switch (field.fieldType) {
    case 'link':
    case 'phone':
    case 'email':
      return renderLinkField(field, m);
    case 'image':
      return renderImageField(field, m, updatedAt);
    case 'file':
      return renderFileField(field, m);
    case 'markdown':
    case 'html':
      return renderHTML(field, m);
    default:
      return field.isOptioned ? renderOptionedField(field, m) : renderDefaultField(field, m)
  }
}

function AdditionalFieldsSection({ additionalFields, updatedAt }) {
  const m = useIntl().formatMessage;

  return (<>
    <div id="additional-fields" className="padding-top-xl">
      <div className="event-content">
        <div className="event-content-section">
          <ul className="list-unstyled additional-fields">
            {additionalFields.map(field => (
              <li key={field.key} className="padding-bottom-xs">
                {renderField(field, m, updatedAt)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </>
  )
}


function displayAdditionalFields({ agenda, event, lang }) {
  if (!hasAdditionalFields(agenda.schema)) {
    return;
  }

  const updatedAt = new Date(event.updatedAt);
  const additionalFields = formatAdditionalFieldData(agenda.schema, event, lang);

  ReactDom.render(
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <AdditionalFieldsSection
        additionalFields={additionalFields}
        lang={lang}
        updatedAt={updatedAt.getTime()}
      />
    </IntlProvider>,
    du.el('.js_additional_fields')
  );
}

export default displayAdditionalFields;
