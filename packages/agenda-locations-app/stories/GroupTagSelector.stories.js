import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import GroupTagSelector from '../src/components/form-components/GroupTagSelector.js';
import flattenTagSetLabels from '../src/flattenTagSetLabels.js';
import Providers from './decorators/Providers.js';
import ComponentCanvas from './decorators/ComponentCanvas.js';

export default {
  title: 'GroupTagSelector',
  decorators: [ComponentCanvas, Providers],
};

const unorderedTagSet = {
  groups: [
    {
      name: {
        fr: 'Type de lieu',
        en: 'Place type',
      },
      info: null,
      tags: [
        { id: 1, label: { fr: 'Musée', en: 'Museum' } },
        { id: 2, label: { fr: 'Château', en: 'Castle' } },
        { id: 3, label: { fr: 'Église', en: 'Church' } },
        { id: 4, label: { fr: 'Bibliothèque', en: 'Library' } },
        { id: 5, label: { fr: 'Théâtre', en: 'Theater' } },
        { id: 6, label: { fr: 'Archive', en: 'Archive' } },
        { id: 7, label: { fr: 'Parc', en: 'Park' } },
        { id: 8, label: { fr: 'Galerie', en: 'Gallery' } },
      ],
    },
    {
      name: {
        fr: 'Accessibilité',
        en: 'Accessibility',
      },
      info: null,
      unique: true,
      required: true,
      tags: [
        { id: 10, label: { fr: 'Partielle', en: 'Partial' } },
        { id: 11, label: { fr: 'Complète', en: 'Full' } },
        { id: 12, label: { fr: 'Aucune', en: 'None' } },
      ],
    },
  ],
};

const StatefulTagSelector = ({ lang, ...props }) => {
  const [tags, setTags] = useState([]);
  const set = flattenTagSetLabels(props.set, lang);

  return (
    <GroupTagSelector
      name="tags"
      set={set}
      value={tags}
      onChange={(name, value) => setTags(value)}
    />
  );
};

export const AlphabeticallySortedFr = () => (
  <StatefulTagSelector lang="fr" set={unorderedTagSet} />
);

export const AlphabeticallySortedEn = () => (
  <StatefulTagSelector lang="en" set={unorderedTagSet} />
);
