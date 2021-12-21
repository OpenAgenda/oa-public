import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useQuery } from 'react-query';
import { Spinner } from '@openagenda/react-shared';

const extractTagGroupsFromSchema = schema => schema.fields.filter(f => !!f.options);

const flatten = (label, lang = 'fr') => {
  if (typeof label === 'string') {
    return label;
  }
  return label[Object.keys(label).includes(lang) ? lang : Object.keys(label).shift()];
};

const messages = defineMessages({
  tagSelectionLabel: {
    id: 'LegacyEmbed.TagSelectionMenu.tagSelectionLabel',
    defaultMessage: 'Select the values to load in the widget'
  },
  useAllValues: {
    id: 'LegacyEmbed.TagSelectionMenu.useAllValues',
    defaultMessage: 'Use all values'
  },
  useGroupValues: {
    id: 'LegacyEmbed.TagSelectionMenu.useGroupValues',
    defaultMessage: 'Use all values from a field'
  },
  useSelection: {
    id: 'LegacyEmbed.TagSelectionMenu.useSelection',
    defaultMessage: 'Pick specific values'
  },
  tagMenuInfo: {
    id: 'LegacyEmbed.TagSelectionMenu.tagMenuInfo',
    defaultMessage: 'Changes you bring here update the embed code'
  }
});

export default function TagSelectionMenu({
  res,
  lang,
  onChange
}) {
  const m = useIntl().formatMessage;

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectionMode, setSelectionMode] = useState('all');

  const query = useQuery('schema', () => axios.get(res), {
    select: ({ data }) => data
  });

  useEffect(() => {
    setSelectedGroup(null);
    setSelectedTags([]);
  }, [selectionMode]);

  useEffect(() => {
    onChange({
      mode: selectionMode,
      tags: selectedTags,
      group: selectedGroup
    });
  }, [selectionMode, selectedTags, selectedGroup, onChange]);

  if (query.isLoading || !query.data) {
    return <Spinner page />;
  }

  return (
    <div>
      <div className="margin-bottom-md">
        <strong>{m(messages.tagSelectionLabel)}</strong>
        <p>{m(messages.tagMenuInfo)}</p>
        <ul className="list-unstyled">
          <li className="radio">
            <label htmlFor="allSelectionMode">
              <input
                id="allSelectionMode"
                type="radio"
                checked={selectionMode === 'all'}
                onChange={() => setSelectionMode('all')}
              />
              {m(messages.useAllValues)}
            </label>
          </li>
          <li className="radio">
            <label htmlFor="groupSelectionMode">
              <input
                id="groupSelectionMode"
                type="radio"
                checked={selectionMode === 'group'}
                onChange={() => setSelectionMode('group')}
              />
              {m(messages.useGroupValues)}
            </label>
          </li>
          <li className="radio">
            <label htmlFor="pickedSelectionMode">
              <input
                id="pickedSelectionMode"
                type="radio"
                checked={selectionMode === 'picked'}
                onChange={() => setSelectionMode('picked')}
              />
              {m(messages.useSelection)}
            </label>
          </li>
        </ul>
      </div>
      {selectionMode === 'group' ? (
        <div>
          {extractTagGroupsFromSchema(query.data.schema).map((field, index) => (
            <div className="radio" key={`group-${field.field}`}>
              <label htmlFor={field.field}>
                <input
                  id={field.field}
                  key={field.field}
                  checked={selectedGroup === index}
                  type="radio"
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedGroup(index);
                    } else {
                      setSelectedGroup(null);
                    }
                  }}
                /> {flatten(field.label, lang)}
              </label>
            </div>
          ))}
        </div>
      ) : null}
      {selectionMode === 'picked' ? (
        <div>
          {extractTagGroupsFromSchema(query.data.schema).map((field, index) => (
            <div key={`group-${field.field}`}>
              <strong>{flatten(field.label, lang)}</strong>
              <ul className="margin-left-xs list-unstyled">
                {field.options.map(o => (
                  <li className="checkbox" key={`${field.field}.${o.id}`}>
                    <label htmlFor={`${field.field}.${o.id}`}>
                      <input
                        disabled={selectedGroup !== null}
                        key={`${field.field}.${o.id}`}
                        checked={selectedTags.includes(o.value) || selectedGroup === index}
                        id={`${field.field}.${o.id}`}
                        type="checkbox"
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedTags(selectedTags.concat(o.value));
                          } else {
                            setSelectedTags(selectedTags.slice(selectedTags.indexOf(o.value), 1));
                          }
                        }}
                      /> {flatten(o.label, lang)}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
