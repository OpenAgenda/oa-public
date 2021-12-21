import axios from 'axios';
import { diff } from 'deep-diff';
import React, { useState, useEffect } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Spinner } from '@openagenda/react-shared';

const messages = defineMessages({
  save: {
    id: 'LegacyEmbed.UpdateButton.save',
    defaultMessage: 'Save configuration'
  },
  saved: {
    id: 'LegacyEmbed.UpdateButton.saved',
    defaultMessage: 'Configuration saved'
  }
});

export default function UpdateButton({
  res,
  embed,
  onSave
}) {
  const m = useIntl().formatMessage;

  const [saveState, setSaveState] = useState('unchanged');
  const [savedEmbed, setSavedEmbed] = useState(embed);

  useEffect(() => {
    if (!diff(savedEmbed, embed)?.length) {
      return;
    }
    setSaveState('changed');
  }, [embed, savedEmbed]);

  return (
    <>
      <button
        type="submit"
        className={saveState === 'saved' ? 'btn btn-success' : 'btn btn-primary'}
        disabled={['loading', 'unchanged', 'saved'].includes(saveState)}
        onClick={() => {
          setSaveState('loading');
          axios.post(res, embed).then(() => {
            setSavedEmbed(embed);
            setSaveState('saved');
            onSave();
          });
        }}
      >{m(saveState === 'saved' ? messages.saved : messages.save)}
      </button>
      <div className="text-center padding-v-sm">
        {saveState === 'loading' ? <Spinner mode="inline" /> : null}
      </div>
    </>
  );
}
