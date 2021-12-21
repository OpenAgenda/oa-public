import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Image } from '@openagenda/react-shared';

const messages = defineMessages({
  administration: {
    id: 'react-layouts.AdminHeader.administration',
    defaultMessage: 'Administration',
  },
  return: {
    id: 'react-layouts.AdminHeader.return',
    defaultMessage: 'Return',
  },
});

export default function AdminHeader({ agenda }) {
  const intl = useIntl();

  return (
    <div className="row wsq header">
      {agenda.image ? (
        <div className="col col-sm-2">
          <a className="agenda-logo" href={`/${agenda.slug}`}>
            <Image
              src={agenda.image}
              fallbackSrc={
                process.env.NODE_ENV === 'development'
                  ? agenda.image.replace('cibuldev', 'cibul')
                  : null
              }
              alt={agenda.title}
            />
          </a>
        </div>
      ) : null}

      <div className={`col col-sm-${agenda.image ? '10' : '12'}`}>
        <h1>{agenda.title}</h1>
        <p>{intl.formatMessage(messages.administration)}</p>
        <a className="url" href={`/${agenda.slug}`}>
          {intl.formatMessage(messages.return)}
        </a>
      </div>
    </div>
  );
}
