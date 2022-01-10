import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';

const messages = defineMessages({
  title: {
    id: 'LegacyEmbed.Presentation.title',
    defaultMessage: 'Integrate the agenda in your website'
  },
  create: {
    id: 'LegacyEmbed.Presentation.create',
    defaultMessage: 'Create an embed for this agenda'
  },
  description: {
    id: 'LegacyEmbed.Presentation.description',
    defaultMessage: 'Display the agenda anywhere you like on any webpage or on Facebook, with supporting map, categories or calendar widgets.'
  },
  details: {
    id: 'LegacyEmbed.Presentation.details',
    defaultMessage: 'Creating a view of your agenda will allow you to embed its content and use navigation widgets like a map, a calendar, categories menus... directly in the website of your choice'
  }
});

export default function Presentation({
  res,
  onCreate
}) {
  const m = useIntl().formatMessage;

  const [creating, setCreating] = useState(false);

  const create = useCallback(() => {
    setCreating(true);
    axios.post(res).then(({ data }) => {
      onCreate(data);
    });
  }, [onCreate, res]);

  return (
    <>
      {creating ? <Spinner /> : null}
      <div className="row">
        <div className="col-sm-12">
          <h2>{m(messages.title)}</h2>
          <p>{m(messages.description)}</p>
          <div className="text-center margin-v-md">
            <button
              onClick={create}
              type="button"
              className="btn btn-primary"
            >
              {m(messages.create)}
            </button>
          </div>
          <p>{m(messages.details)}</p>
        </div>
      </div>
    </>
  );
}
