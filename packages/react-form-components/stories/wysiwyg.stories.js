import React, { useState } from 'react';
import update from 'immutability-helper';
import { useUIDSeed } from 'react-uid';
import MarkdownComponent from '../components/MarkdownComponent';
import HTMLComponent from '../components/HTMLComponent';
import PageDecorator from './decorators/PageDecorator';
import defaultState from './state';

import '@openagenda/bs-templates/compiled/main.css';

function removeFirstMarkdownComponent(state) {
  return update(state, { multiMd: { $splice: [[0, 1]] } });
}

function addMarkdownComponent(state) {
  return update(state, {
    multiMd: {
      $push: [
        {
          lang: 'it',
          label: 'one more time',
          placeholder: 'nippingsnout',
          markdown: 'Nippinipppiniinp pinnipinini',
        },
      ],
    },
  });
}

function onChange(state, name, value) {
  const change = { values: {} };

  change.values[name] = { $set: value };

  return update(state, change);
}

function onMultiMarkdownChange(state, i, value) {
  const updated = { multiMd: {} };

  updated.multiMd[i] = {};

  updated.multiMd[i].markdown = { $set: value };

  return update(state, updated);
}

export default {
  title: 'Wysiwyg',
  decorators: [PageDecorator],
};

export function Markdown() {
  const [state, setState] = useState(defaultState);

  const seed = useUIDSeed();

  return (
    <>
      <button
        type="button"
        onClick={() => setState(removeFirstMarkdownComponent)}
      >
        supprimer le premier
      </button>

      {state.multiMd.map((c, i) => (
        <React.Fragment key={seed(i)}>
          <MarkdownComponent
            lang={c.lang}
            label={c.label}
            placeholder={c.placeholder}
            onChange={(value) =>
              setState(onMultiMarkdownChange(state, i, value))
            }
            value={c.markdown}
          />
          Prévisualisation:
          <pre>{c.markdown}</pre>
        </React.Fragment>
      ))}

      <button type="button" onClick={() => setState(addMarkdownComponent)}>
        ajouter
      </button>
    </>
  );
}

export function Html() {
  const [state, setState] = useState(defaultState);

  return (
    <HTMLComponent
      lang="fr"
      label="Ce champ enregistre du html"
      placeholder="Cet HTML sera sauvegardé en base"
      onChange={(value) => setState(onChange(state, 'html', value))}
      value={state.values.html}
    />
  );
}
