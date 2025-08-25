import { useContext, useState } from 'react';
import ComponentsContext from '../components/Context.js';
import Radio from '../components/bootstrap/Radio.js';

export default function Description({
  value,
  onChange,
  longDesc,
  longDescWarning: _longDescWarning,
}) {
  const { Textarea } = useContext(ComponentsContext);

  // Ensure value is always a string
  const actualValue = String(value?.description || '');
  const isLinkedDesc = actualValue === 'linked desc';

  const [description, setDescription] = useState(
    isLinkedDesc ? '' : actualValue,
  );
  const [descriptionMode, setDescriptionMode] = useState(
    isLinkedDesc ? 'sync' : 'adapt',
  );

  const handleUseEventDescription = () => {
    const isEmptyOrNullObject = typeof longDesc === 'object'
      && longDesc !== null
      && (Object.keys(longDesc).length === 0
        || Object.values(longDesc).every((val) => val === null || val === ''));
    const descToUse = isEmptyOrNullObject ? '' : longDesc || '';
    setDescription(descToUse);
    onChange(descToUse);
  };

  const handleModeChange = (mode) => {
    setDescriptionMode(mode);

    if (mode === 'sync') {
      setDescription('linked desc');
      onChange('linked desc');
    } else {
      // Clear the value when switching to adapt mode
      setDescription('');
      onChange('');
    }
  };

  const handleDescriptionChange = (newDescription) => {
    setDescription(newDescription);
    onChange(newDescription);
  };

  const radioOptions = [
    {
      value: 'adapt',
      label:
        'Adaptez la description de votre offre afin de la rendre la plus parlante possible pour le public des 15-20 ans.',
      info: (
        <>
          Tous nos conseils à ce sujet sont disponibles{' '}
          <a
            href="https://passculture.docsend.com/view/c5ywca7ximmi5it2"
            target="_blank"
            rel="noopener noreferrer"
          >
            ici
          </a>{' '}
          !
        </>
      ),
      children: (
        <div className="margin-top-sm">
          <Textarea
            placeholder="Saisissez votre description"
            max="1000"
            value={description}
            onChange={(e) => {
              handleDescriptionChange(e.target.value);
            }}
            actionButton={(
              <button
                type="button"
                className="btn btn-link text-sm padding-all-z"
                onClick={handleUseEventDescription}
              >
                Charger la description longue de l&apos;événement
              </button>
            )}
          />

          {description?.length > 1000 && (
            <div className="text-danger text-xs margin-top-xs">
              Attention votre description actuelle fait plus de 1000 caractères
            </div>
          )}
        </div>
      ),
    },
    {
      value: 'sync',
      label:
        "Synchronisez la description de l'offre pass avec la description de l'événement",
      info: "Toute édition sur la description de l'événement sera reprise sur l'offre pass",
    },
  ];

  return (
    <div>
      <div className="control-label">
        <strong>Description de l&apos;offre</strong> (Champ obligatoire)
      </div>

      <Radio
        name="description-mode"
        options={radioOptions}
        value={descriptionMode}
        onChange={handleModeChange}
      />
    </div>
  );
}
