import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useQuery } from 'react-query';

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
  }
});

export default ({
  res,
  lang,
  onChange
}) => {
  const intl = useIntl();

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectionMode, setSelectionMode] = useState('all');

  useEffect(() => {
    onChange({ selectedTags, selectedGroup });
  }, [selectedTags, selectedGroup, onChange]);

  const query = useQuery('schema', () => axios.get(res), {
    select: ({ data }) => data
  });

  if (query.isLoading || !query.data) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <div className="margin-bottom-md">
        <strong>Sélectionnez les valeurs à afficher dans le Widget</strong>
        <ul className="list-unstyled">
          <li className="radio">
            <label htmlFor="allSelectionMode">
              <input
                id="allSelectionMode"
                type="radio"
                checked={selectionMode === 'all'}
                onChange={() => setSelectionMode('all')}
              />
              Utiliser toutes les valeurs
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
              Ne reprendre qu'un jeu de valeurs
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
              Choisir les valeurs une à une
            </label>
          </li>
        </ul>
      </div>
      {selectionMode === 'group' ? (
        <div>
          {extractTagGroupsFromSchema(query.data.schema).map((field, index) => (
            <div className="radio">
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
                  <li className="checkbox" key={`${field}.${o.id}`}>
                    <label htmlFor={`${field}.${o.id}`}>
                      <input
                        disabled={selectedGroup !== null}
                        key={`${field.field}.${o.id}`}
                        checked={selectedTags.includes(o.value) || selectedGroup === index}
                        name={`${field.field}.${o.id}`}
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
};
